import asyncio
import json
import os
from dotenv import load_dotenv
load_dotenv()

from datetime import datetime
from typing import TypedDict, Annotated, AsyncGenerator, Dict, Any, List

from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import InMemorySaver


class ChatbotState(TypedDict):
    messages: Annotated[list, add_messages]


@tool
def get_date_time() -> str:
    """Returns the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@tool
async def wait(seconds: int) -> str:
    """Wait for the specified number of seconds before continuing."""
    await asyncio.sleep(seconds)
    return f"Waited {seconds} seconds."


_app = None
_client = None
_lock = asyncio.Lock()


async def initialize_agent():
    global _app, _client
    async with _lock:
        if _app is not None:
            return _app, _client

        # Initialize LLM
        model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        llm = ChatOpenAI(model=model_name)

        # MCP Client configuration (Chrome DevTools + Filesystem)
        downloads_path = os.path.expanduser("~/Downloads")
        _client = MultiServerMCPClient(
            {
                "chrome": {
                    "transport": "stdio",
                    "command": "npx",
                    "args": ["-y", "chrome-devtools-mcp@latest"],
                },
                "filesystem": {
                    "transport": "stdio",
                    "command": "npx",
                    "args": [
                        "-y",
                        "@modelcontextprotocol/server-filesystem",
                        downloads_path if os.path.exists(downloads_path) else os.getcwd(),
                    ],
                },
            }
        )

        try:
            mcp_tools = await _client.get_tools()
        except Exception as e:
            print(f"[Warning] Failed to fetch MCP tools: {e}. Falling back to local tools only.")
            mcp_tools = []

        all_tools = mcp_tools + [get_date_time, wait]
        llm_with_tools = llm.bind_tools(all_tools)

        async def chatbot_node(state: ChatbotState):
            response = await llm_with_tools.ainvoke(state["messages"])
            return {"messages": [response]}

        tool_node = ToolNode(all_tools)

        graph = StateGraph(ChatbotState)
        graph.add_node("chatbot", chatbot_node)
        graph.add_node("tools", tool_node)
        graph.add_edge(START, "chatbot")
        graph.add_conditional_edges("chatbot", tools_condition)
        graph.add_edge("tools", "chatbot")


        memory = InMemorySaver()
        _app = graph.compile(checkpointer=memory)
        return _app, _client


async def run_agent_stream(user_message: str, thread_id: str = "default") -> AsyncGenerator[str, None]:
    """Runs the LangGraph agent and yields SSE formatted event strings."""
    app, _ = await initialize_agent()

    config = {"configurable": {"thread_id": thread_id}}
    inputs = {"messages": [("user", user_message)]}

    async for event in app.astream_events(inputs, config=config, version="v2"):
        kind = event["event"]
        
        # Capture model output chunks or tool call requests
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if hasattr(chunk, "content") and chunk.content:
                yield f"data: {json.dumps({'type': 'text_chunk', 'content': chunk.content})}\n\n"
        
        elif kind == "on_tool_start":
            tool_name = event.get("name", "unknown_tool")
            tool_inputs = event.get("data", {}).get("input", {})
            yield f"data: {json.dumps({'type': 'tool_start', 'name': tool_name, 'inputs': tool_inputs})}\n\n"
            
        elif kind == "on_tool_end":
            tool_name = event.get("name", "unknown_tool")
            tool_output = str(event.get("data", {}).get("output", ""))
            yield f"data: {json.dumps({'type': 'tool_end', 'name': tool_name, 'output': tool_output[:500]})}\n\n"

    yield f"data: {json.dumps({'type': 'done'})}\n\n"
