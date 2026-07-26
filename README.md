# AI Agent with Model Context Protocol (MCP), LangGraph & Next.js Frontend

An interactive AI chatbot agent built using **LangGraph**, **LangChain**, **Model Context Protocol (MCP)** tools, and a modern **Next.js** web interface. This repository integrates multi-server MCP clients (such as Chrome DevTools and Filesystem MCP) alongside custom Python tools into an autonomous, stateful agent workflow.

---

## 🌟 Key Features

- **Next.js Glassmorphic Web UI**: Modern dark theme with real-time SSE streaming responses and expandable tool execution cards.
- **Multi-Server MCP Adapter**: Connects seamlessly to external MCP servers over `stdio` using `langchain-mcp-adapters`.
  - **Chrome DevTools MCP**: Browser automation, snapshotting, page navigation, and DOM interaction.
  - **Filesystem MCP**: Local file system inspection and management.
- **Custom Tool Integration**: Easily extensible with custom LangChain `@tool` functions (e.g. date-time utilities, async sleep/wait functions).
- **Stateful Graph & In-Memory Checkpointer**: Uses **LangGraph** (`StateGraph`, `ToolNode`, `tools_condition`, `InMemorySaver`) for thread-isolated state and message history persistence.
- **FastAPI Streaming Backend**: Exposes `POST /api/chat` streaming Server-Sent Events (SSE) directly to the web UI.

---

## 🧠 Memory Architecture

The agent uses **In-Memory Checkpointing (`InMemorySaver`)** provided by LangGraph:

- **Checkpointer (`InMemorySaver`)**: Stores current thread state and message history in server memory (RAM), isolated per conversation session via `thread_id`.
- **State Reducer (`add_messages`)**: Automatically appends new user messages, assistant responses, and MCP tool call outputs to the session history.
- **Session Threading**: Pass `{"configurable": {"thread_id": "session-id"}}` to maintain separate conversation contexts across multiple sessions.

---

## 💡 Extensibility & Adding New Features

`agent.py` is organized into **4 modular sections** so you can easily extend functionality:

### 1. Adding a New Custom Python Tool (`SECTION 1`)
Define your function with `@tool` and add it to `CUSTOM_TOOLS`:
```python
@tool
def calculate_discount(price: float, percentage: float) -> str:
    """Calculates final price after applying a percentage discount."""
    discounted = price * (1 - percentage / 100)
    return f"Discounted price: ${discounted:.2f}"

CUSTOM_TOOLS = [get_date_time, wait, calculate_discount]
```

### 2. Adding a New MCP Server (`SECTION 2`)
Add external stdio MCP server commands to `MCP_SERVERS`:
```python
MCP_SERVERS = {
    "chrome": {
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "chrome-devtools-mcp@latest"],
    },
    "filesystem": {
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", os.path.expanduser("~/Downloads")],
    },
    # Example: Add SQLite MCP Server
    "sqlite": {
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/db.sqlite"],
    },
}
```

---

## 📁 Repository Structure

```text
agents-wth-mcp-tools/
├── agent.py                 # Modularized Python agent logic (4 Sections)
├── server.py                # FastAPI backend serving POST /api/chat (SSE streaming)
├── chatbot_with_mcp.ipynb   # Original Jupyter Notebook implementation
├── requirements.txt         # Required Python dependencies
├── README.md                # Project documentation
└── frontend/                # Next.js App Router Web UI
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx     # Main Chat UI page
    │   │   └── globals.css  # Dark glassmorphic styling
    │   └── components/      # Header, ChatMessage, ToolCallBadge, ChatInput components
    ├── package.json
    └── next.config.ts
```

---

## 🛠️ Prerequisites

1. **Python 3.10+** (Python 3.11/3.12 recommended)
2. **Node.js 18+ & `npm` / `npx`**: Required for Next.js frontend & launching external stdio MCP servers (`chrome-devtools-mcp` & `@modelcontextprotocol/server-filesystem`).
3. **OpenAI API Key**: Set your key in `.env`:
   ```bash
   OPENAI_API_KEY="your-openai-api-key"
   OPENAI_MODEL="gpt-4o-mini"
   ```

---

## 🚀 Getting Started

### 1. Set Up Python Backend

```bash
# Activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI backend server (runs on http://localhost:8000)
python3 server.py
```

### 2. Start Next.js Frontend

In a separate terminal:

```bash
cd frontend

# Install frontend dependencies (if not already installed)
npm install

# Start Next.js dev server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with your MCP agent.

---

## 📝 License

This project is licensed under the MIT License.
