import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent import run_agent_stream, initialize_agent

app = FastAPI(
    title="MCP Agent API Server",
    description="FastAPI Backend for LangGraph & MCP Tools Agent",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    thread_id: str = "user-session-1"


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "mcp-agent-backend"}


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    return StreamingResponse(
        run_agent_stream(user_message=request.message, thread_id=request.thread_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.on_event("startup")
async def startup_event():
    print("[Server] Pre-initializing MCP agent graph...")
    # Optional pre-init to warm up graph & MCP connections
    asyncio.create_task(initialize_agent())


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting MCP Agent FastAPI server on port {port}...")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
