# Zen MCP Server NPX Wrapper

Easy-to-use NPX wrapper for [Zen MCP Server](https://github.com/BeehiveInnovations/zen-mcp-server) - Give Claude access to multiple AI models (Gemini, OpenAI, OpenRouter, Ollama) for enhanced development capabilities.

## Quick Start

```bash
npx zen-mcp-server-199bio
```

That's it! The wrapper handles all Docker setup automatically.

## What is Zen MCP Server?

Zen MCP Server gives Claude Desktop access to multiple AI models for:
- 🧠 **Extended reasoning** with Gemini 2.0 Pro's thinking mode
- 💬 **Collaborative development** with multiple AI perspectives
- 🔍 **Code review** and architectural analysis
- 🐛 **Advanced debugging** with specialized models
- 📊 **Large context analysis** (Gemini: 1M tokens, O3: 200K tokens)
- 🔄 **Conversation threading** with Redis - AI models maintain context across multiple calls

## First Time Setup

On first run, the wrapper will:
1. Check/start Docker Desktop
2. Clone Zen MCP Server to `~/.zen-mcp-server`
3. Create `.env` file and prompt for API keys
4. Build Docker image automatically
5. Start all services via Docker Compose:
   - Zen MCP Server container
   - Redis container (for conversation threading)
   - Log monitor service

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
CUSTOM_API_URL=http://host.docker.internal:11434/v1
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

## Features

- ✅ **Zero config** - Just run with npx
- 🐳 **Full Docker Compose stack** - Includes Redis for conversation threading
- 🔧 **Smart setup** - Handles all initialization automatically
- 💾 **Redis included** - Maintains context between AI model calls
- 🔄 **Graceful shutdown** - Proper cleanup on exit
- 📦 **No installation** - Always runs latest version
- 🌍 **Cross-platform** - Works on macOS, Windows (WSL2), Linux

### What's Included
The NPX wrapper starts the complete Zen MCP Server stack:
- **Zen MCP Server** - Main server handling AI model communication
- **Redis** - For conversation threading and context persistence
- **Log Monitor** - For debugging and monitoring
- All features from the original Docker Compose setup

## Troubleshooting

### Docker not starting?
- macOS: Make sure Docker Desktop is installed
- Windows: Requires WSL2 and Docker Desktop
- Linux: Ensure Docker daemon is running

### API key issues?
- Check `~/.zen-mcp-server/.env` has valid keys
- Ensure at least one API key is configured
- For OpenRouter, check your credits/limits

### Connection failed?
1. Restart Claude Desktop after configuration
2. Check Docker containers: `docker ps`
3. View logs: `docker logs zen-mcp-server`

## Requirements

- Docker Desktop
- Node.js >= 14.0.0
- Git
- At least one API key (Gemini, OpenAI, or OpenRouter)

## Links

- [Zen MCP Server Repo](https://github.com/BeehiveInnovations/zen-mcp-server)
- [NPX Wrapper Repo](https://github.com/199-biotechnologies/zen-mcp-server-npx)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

Apache 2.0 - See [LICENSE](https://github.com/BeehiveInnovations/zen-mcp-server/blob/main/LICENSE)