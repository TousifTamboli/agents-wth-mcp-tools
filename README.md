# AI Agent with Model Context Protocol (MCP) & LangGraph

An interactive AI chatbot agent built using **LangGraph**, **LangChain**, and **Model Context Protocol (MCP)** tools. This repository demonstrates how to integrate multi-server MCP clients (such as Chrome DevTools and Filesystem MCP) alongside custom Python tools into an autonomous, stateful agent workflow.

---

## 🌟 Key Features

- **Multi-Server MCP Adapter**: Connects seamlessly to external MCP servers over `stdio` using `langchain-mcp-adapters`.
  - **Chrome DevTools MCP**: Browser automation, snapshotting, page navigation, and element interaction.
  - **Filesystem MCP**: Local file system inspection and management.
- **Custom Tool Integration**: Easy extension with custom LangChain `@tool` functions (e.g., date-time utilities, async sleep/wait functions, screenshot extractors).
- **Stateful Graph Architecture**: Uses **LangGraph** (`StateGraph`, `ToolNode`, `tools_condition`, `InMemorySaver`) for tool routing and conversation state persistence across turns.
- **Interactive Execution Loop**: Features a notebook-ready interactive chat loop that prints tool calls and agent reasoning in real time.

---

## 📁 Repository Structure

```text
agents-wth-mcp-tools/
├── chatbot_with_mcp.ipynb   # Main Jupyter Notebook implementing the MCP LangGraph agent
├── requirements.txt         # Required Python dependencies
└── README.md                # Project documentation
```

---

## 🛠️ Prerequisites

1. **Python 3.10+** (Python 3.11/3.12 recommended)
2. **Node.js & `npx`**: Required for launching external stdio MCP servers (`chrome-devtools-mcp` & `@modelcontextprotocol/server-filesystem`).
3. **OpenAI API Key**: Set your API key in your environment or via `.env` file:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   ```

---

## 🚀 Getting Started

### 1. Clone the Repository & Set Up Virtual Environment

```bash
git clone https://github.com/TousifTamboli/agents-wth-mcp-tools.git
cd agents-wth-mcp-tools

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Launch Jupyter Notebook

```bash
jupyter lab
# Or use VS Code to open chatbot_with_mcp.ipynb
```

---

## 💡 How It Works

1. **Initialize LLM**: Configures `ChatOpenAI` (e.g. model `gpt-4o` / `gpt-4o-mini`).
2. **Configure MultiServerMCPClient**:
   ```python
   from langchain_mcp_adapters.client import MultiServerMCPClient

   client = MultiServerMCPClient({
       "chrome": {
           "transport": "stdio",
           "command": "npx",
           "args": ["-y", "chrome-devtools-mcp@latest"],
       },
       "filesystem": {
           "transport": "stdio",
           "command": "npx",
           "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
       },
   })
   ```
3. **Bind Tools & Build Graph**: Combines MCP tools with custom tools into a LangGraph state graph.
4. **Agent Execution**: Manages conversation history with `InMemorySaver` and executes tool calls conditionally via `tools_condition`.

---

## 📝 License

This project is licensed under the MIT License.
