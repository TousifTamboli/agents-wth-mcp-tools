import asyncio
import json
import os
from datetime import datetime
from typing import TypedDict, Annotated, AsyncGenerator, Dict, Any, List

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import InMemorySaver

# Load environment variables (.env file)
load_dotenv()


# ==============================================================================
# SECTION 1: CUSTOM PYTHON TOOLS
# 👉 ADD NEW CUSTOM TOOLS HERE using the @tool decorator
# ==============================================================================

@tool
def get_date_time() -> str:
    """Returns the current date and time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@tool
async def wait(seconds: int) -> str:
    """Wait for the specified number of seconds before continuing."""
    await asyncio.sleep(seconds)
    return f"Waited {seconds} seconds."


# 📌 LIST ALL YOUR CUSTOM TOOLS HERE
# To add a new custom tool, create a function with @tool above, then add it to this list:
CUSTOM_TOOLS = [
    get_date_time,
    wait,
]


# ==============================================================================
# SECTION 2: MCP SERVERS CONFIGURATION
# 👉 ADD NEW MCP SERVERS HERE
# ==============================================================================

MCP_SERVERS = {
    # 1. Chrome DevTools MCP (Browser Automation & Inspection)
    "chrome": {
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "chrome-devtools-mcp@latest"],
    },

    # 2. Filesystem MCP (Local Directory Operations)
    "filesystem": {
        "transport": "stdio",
        "command": "npx",
        "args": [
            "-y",
            "@modelcontextprotocol/server-filesystem",
            os.path.expanduser("~/Downloads") if os.path.exists(os.path.expanduser("~/Downloads")) else os.getcwd(),
        ],
    },

    # 📌 EXAMPLE: How to add a new MCP server in the future:
    # "sqlite": {
    #     "transport": "stdio",
    #     "command": "npx",
    #     "args": ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/db.sqlite"],
    # },
}


# ==============================================================================
# SECTION 3: LANGGRAPH STATE & AGENT ENGINE
# ==============================================================================

class ChatbotState(TypedDict):
    messages: Annotated[list, add_messages]


_app = None
_client = None
_lock = asyncio.Lock()


async def initialize_agent():
    """Initializes LLM, MCP Servers, and LangGraph Agent."""
    global _app, _client
    async with _lock:
        if _app is not None:
            return _app, _client

        # 1. Initialize OpenAI LLM
        model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        llm = ChatOpenAI(model=model_name)

        # 2. Connect to all configured MCP Servers
        _client = MultiServerMCPClient(MCP_SERVERS)

        try:
            mcp_tools = await _client.get_tools()
        except Exception as e:
            print(f"[Warning] Failed to fetch MCP tools: {e}. Using local tools only.")
            mcp_tools = []

        # 3. Combine MCP tools with Custom Python tools
        all_tools = mcp_tools + CUSTOM_TOOLS
        llm_with_tools = llm.bind_tools(all_tools)

        # 4. Define Agent Node function
        async def chatbot_node(state: ChatbotState):
            response = await llm_with_tools.ainvoke(state["messages"])
            return {"messages": [response]}

        # 5. Build LangGraph Workflow
        tool_node = ToolNode(all_tools)
        graph = StateGraph(ChatbotState)
        
        graph.add_node("chatbot", chatbot_node)
        graph.add_node("tools", tool_node)
        
        graph.add_edge(START, "chatbot")
        graph.add_conditional_edges("chatbot", tools_condition)
        graph.add_edge("tools", "chatbot")

        # 6. Memory Checkpointer
        memory = InMemorySaver()
        _app = graph.compile(checkpointer=memory)
        return _app, _client


# ==============================================================================
# SECTION 4: REAL-TIME STREAMING API RUNNER
# ==============================================================================

async def run_agent_stream(user_message: str, thread_id: str = "default") -> AsyncGenerator[str, None]:
    """Runs the LangGraph agent and streams events (SSE format) to web clients."""
    app, _ = await initialize_agent()

    config = {"configurable": {"thread_id": thread_id}}
    inputs = {"messages": [("user", user_message)]}

    async for event in app.astream_events(inputs, config=config, version="v2"):
        kind = event["event"]
        
        # 1. Stream Text Answer Chunks
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if hasattr(chunk, "content") and chunk.content:
                yield f"data: {json.dumps({'type': 'text_chunk', 'content': chunk.content})}\n\n"
        
        # 2. Stream Tool Start Events
        elif kind == "on_tool_start":
            tool_name = event.get("name", "unknown_tool")
            tool_inputs = event.get("data", {}).get("input", {})
            yield f"data: {json.dumps({'type': 'tool_start', 'name': tool_name, 'inputs': tool_inputs})}\n\n"
            
        # 3. Stream Tool Completion Events
        elif kind == "on_tool_end":
            tool_name = event.get("name", "unknown_tool")
            tool_output = str(event.get("data", {}).get("output", ""))
            yield f"data: {json.dumps({'type': 'tool_end', 'name': tool_name, 'output': tool_output[:500]})}\n\n"

    # End of stream signal
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
