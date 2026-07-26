# AI Agent with Model Context Protocol (MCP), LangGraph & Next.js Frontend

An interactive AI chatbot agent built using **LangGraph**, **LangChain**, **Model Context Protocol (MCP)** tools, and a modern **Next.js** web interface. This repository integrates multi-server MCP clients (such as Chrome DevTools and Filesystem MCP) alongside custom Python tools into an autonomous, stateful agent workflow.

---

## 🌟 Key Features

- **Next.js Glassmorphic Web UI**: Modern dark theme with real-time SSE streaming responses and expandable tool execution cards.
- **Multi-Server MCP Adapter**: Connects seamlessly to external MCP servers over `stdio` using `langchain-mcp-adapters`.
  - **Chrome DevTools MCP**: Browser automation, snapshotting, page navigation, and DOM interaction.
  - **Filesystem MCP**: Local file system inspection and management.
- **Custom Tool Integration**: Extensible with custom LangChain `@tool` functions (e.g., date-time utilities, async sleep/wait functions).
- **Stateful Graph Architecture**: Powered by **LangGraph** (`StateGraph`, `ToolNode`, `tools_condition`, `InMemorySaver`) for session thread management and tool routing.
- **FastAPI Streaming Backend**: Exposes `POST /api/chat` streaming Server-Sent Events (SSE) directly to the web UI.

---

## 📁 Repository Structure

```text
agents-wth-mcp-tools/
├── agent.py                 # Modularized Python agent logic (LangGraph + MCP Client)
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
3. **OpenAI API Key**:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
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

## 💡 Architecture & Extensibility

- **Extending Tools**: To add a new tool or MCP server, edit `agent.py` and bind it to `all_tools`. The Next.js frontend automatically renders any newly triggered tool names and inputs/outputs.
- **Extending UI**: Components are modularly structured in `frontend/src/components/` (`ToolCallBadge`, `ChatMessage`, `Header`, `ChatInput`).

---

## 📝 License

This project is licensed under the MIT License.
