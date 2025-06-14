# Zen MCP Server NPX Wrapper

Easy-to-use NPX wrapper for [Zen MCP Server](https://github.com/BeehiveInnovations/zen-mcp-server) - Give Claude access to multiple AI models (Gemini, OpenAI, OpenRouter, Ollama) for enhanced development capabilities.

## Quick Start

```bash
npx zen-mcp-server-199bio
```

That's it! No Docker required. 🎉

## What is Zen MCP Server?

Zen MCP Server gives Claude Desktop access to multiple AI models for:
- 🧠 **Extended reasoning** with Gemini 2.0 Pro's thinking mode
- 💬 **Collaborative development** with multiple AI perspectives
- 🔍 **Code review** and architectural analysis
- 🐛 **Advanced debugging** with specialized models
- 📊 **Large context analysis** (Gemini: 1M tokens, O3: 200K tokens)
- 🔄 **Conversation threading** - AI models maintain context across multiple calls

## Features

- ✅ **No Docker required** - Runs directly with Python
- 🚀 **Fast startup** - No container overhead
- 💾 **Lightweight** - Minimal resource usage
- 🔧 **Auto-setup** - Handles Python dependencies automatically
- 📦 **Virtual environment** - Isolated dependencies
- 🌍 **Cross-platform** - Works on macOS, Windows, Linux

## First Time Setup

On first run, the wrapper will:
1. Check Python 3.11+ is installed
2. Clone Zen MCP Server to `~/.zen-mcp-server`
3. Create `.env` file and prompt for API keys
4. Set up Python virtual environment
5. Install dependencies automatically

## Configuration

### 1. Get API Keys (at least one required)

Choose one or more:
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **OpenRouter**: [OpenRouter](https://openrouter.ai/) (access to 100+ models)
- **Local Models**: Ollama, vLLM, LM Studio (no API key needed)

### 2. Configure API Keys

Edit `~/.zen-mcp-server/.env`:

```bash
# Option 1: Native APIs
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# Option 2: OpenRouter (for multiple models)
OPENROUTER_API_KEY=your_openrouter_key_here

# Option 3: Local models (Ollama example)
CUSTOM_API_URL=http://localhost:11434/v1
CUSTOM_MODEL_NAME=llama3.2
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zen": {
      "command": "npx",
      "args": ["zen-mcp-server-199bio"]
    }
  }
}
```

**Location of config file:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## Usage with Claude CLI

```bash
claude mcp add zen "npx" "zen-mcp-server-199bio"
```

## Available Tools

Once configured, Claude will have access to these tools:

- **`zen`** - Default tool for quick AI consultation (alias for chat)
- **`chat`** - Collaborative development discussions
- **`thinkdeep`** - Extended reasoning (Gemini 2.0 Pro)
- **`codereview`** - Professional code review
- **`precommit`** - Pre-commit validation
- **`debug`** - Advanced debugging assistance
- **`analyze`** - Smart file and codebase analysis

**Quick Usage**: Just say "use zen" for quick AI consultations!

## Troubleshooting

### Python not found?
- macOS: `brew install python@3.11`
- Windows: Download from [python.org](https://www.python.org/downloads/)
- Linux: `sudo apt install python3.11`

### Dependencies issue?
The wrapper tries to install automatically, but if it fails:
```bash
cd ~/.zen-mcp-server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### API key issues?
- Check `~/.zen-mcp-server/.env` has valid keys
- Ensure at least one API key is configured
- For OpenRouter, check your credits/limits

## Requirements

- Python 3.11+
- Node.js >= 14.0.0
- Git
- At least one API key (Gemini, OpenAI, or OpenRouter)

## Why No Docker?

We removed Docker because:
- **Faster startup** - No container overhead
- **Less resource usage** - No Redis, no Docker daemon
- **Simpler** - Just Python and your API keys
- **Same features** - Conversation threading works perfectly with in-memory storage

## Links

- [Zen MCP Server](https://github.com/BeehiveInnovations/zen-mcp-server)
- [MCP Zen Plus](https://github.com/199-biotechnologies/mcp-zen-plus)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

Apache 2.0 - See [LICENSE](https://github.com/BeehiveInnovations/zen-mcp-server/blob/main/LICENSE)