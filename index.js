#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ZEN_REPO_URL = 'https://github.com/BeehiveInnovations/zen-mcp-server';
// Check if we already have a local installation
const LOCAL_ZEN_DIR = '/Users/biobook/playground/zen-mcp-server';
const ZEN_DIR = fs.existsSync(LOCAL_ZEN_DIR) ? LOCAL_ZEN_DIR : path.join(os.homedir(), '.zen-mcp-server');
const ENV_FILE = path.join(ZEN_DIR, '.env');

function setupZenMcpServer() {
  // Check if zen-mcp-server directory exists
  if (!fs.existsSync(ZEN_DIR)) {
    console.error('Setting up Zen MCP Server for the first time...');
    console.error(`Cloning repository to ${ZEN_DIR}...`);
    
    try {
      execSync(`git clone ${ZEN_REPO_URL} ${ZEN_DIR}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to clone Zen MCP Server repository.');
      process.exit(1);
    }
  }
  
  // Check if .env exists, if not create from example
  if (!fs.existsSync(ENV_FILE)) {
    const envExample = path.join(ZEN_DIR, '.env.example');
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, ENV_FILE);
      console.error('Created .env file. Please configure your API keys:');
      console.error(`  ${ENV_FILE}`);
      console.error('\nYou need at least one of:');
      console.error('  - GEMINI_API_KEY');
      console.error('  - OPENAI_API_KEY');
      console.error('  - OPENROUTER_API_KEY');
      console.error('\nThen run this command again.');
      process.exit(1);
    }
  }
}

function checkPython() {
  // Try python3 first, then python (for Windows compatibility)
  const pythonCommands = ['python3', 'python'];
  
  for (const command of pythonCommands) {
    try {
      const pythonVersion = execSync(`${command} --version`, { encoding: 'utf8' });
      console.error(`✓ ${pythonVersion.trim()}`);
      
      // Check if it's 3.11+
      const versionMatch = pythonVersion.match(/Python (\d+)\.(\d+)/);
      if (versionMatch) {
        const major = parseInt(versionMatch[1]);
        const minor = parseInt(versionMatch[2]);
        if (major < 3 || (major === 3 && minor < 11)) {
          console.error('⚠️  Warning: Python 3.11+ is recommended for best performance');
        }
        // Store the working command for later use
        process.env.PYTHON_CMD = command;
        return true;
      }
    } catch (error) {
      // Continue to next command
      continue;
    }
  }
  
  console.error('❌ Python 3 is not installed.');
  console.error('Please install Python 3.11 or higher:');
  console.error('  - macOS: brew install python@3.11');
  console.error('  - Windows: https://www.python.org/downloads/');
  console.error('  - Linux: sudo apt install python3.11');
  return false;
}

function checkDependencies() {
  console.error('Checking Python dependencies...');
  const pythonCmd = process.env.PYTHON_CMD || 'python3';
  
  try {
    execSync(`${pythonCmd} -c "import mcp, google.genai, openai, pydantic"`, { 
      stdio: 'ignore',
      cwd: ZEN_DIR 
    });
    console.error('✓ All Python dependencies installed');
    return true;
  } catch (error) {
    console.error('⚠️  Some Python dependencies are missing');
    console.error('Installing dependencies...');
    try {
      // Try to install in virtual environment
      const venvPath = path.join(ZEN_DIR, 'venv');
      if (!fs.existsSync(venvPath)) {
        console.error('Creating virtual environment...');
        execSync(`${pythonCmd} -m venv ${venvPath}`, { stdio: 'inherit', cwd: ZEN_DIR });
      }
      
      const pip = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'pip')
        : path.join(venvPath, 'bin', 'pip');
      
      execSync(`${pip} install -r requirements.txt > /dev/null 2>&1`, { 
        cwd: ZEN_DIR,
        shell: true
      });
      console.error('✓ Dependencies installed successfully');
      return true;
    } catch (installError) {
      console.error('Failed to install dependencies automatically.');
      console.error('Please install manually:');
      console.error(`  cd ${ZEN_DIR}`);
      console.error('  python3 -m pip install -r requirements.txt');
      return false;
    }
  }
}

function main() {
  console.error('🚀 Starting Zen MCP Server (Python mode)');
  console.error('='.repeat(50));
  
  // Check Python
  if (!checkPython()) {
    process.exit(1);
  }
  
  // Setup Zen MCP Server
  setupZenMcpServer();
  
  // Check/install dependencies
  checkDependencies();
  
  // Pass through environment variables and API keys
  const env = { ...process.env };
  
  // If we're using the local installation, load its .env file
  if (ZEN_DIR === LOCAL_ZEN_DIR && fs.existsSync(ENV_FILE)) {
    const dotenv = require('fs').readFileSync(ENV_FILE, 'utf8');
    dotenv.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key && !env[key]) {
          env[key] = value;
        }
      }
    });
  }
  
  // Check for virtual environment
  const venvPath = path.join(ZEN_DIR, 'venv');
  const pythonBin = fs.existsSync(venvPath)
    ? (process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'python')
        : path.join(venvPath, 'bin', 'python'))
    : (process.env.PYTHON_CMD || 'python3');
  
  console.error(`\n✅ Starting server with ${pythonBin}...`);
  console.error('='.repeat(50) + '\n');
  
  // Execute the Python server
  const child = spawn(pythonBin, ['server.py'], {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: ZEN_DIR,
    env: env
  });
  
  child.on('error', (error) => {
    console.error('Failed to execute Zen MCP Server:', error.message);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
}

// Check if we have Git (still needed to clone the repo)
try {
  execSync('git --version', { stdio: 'ignore' });
} catch {
  console.error('Git is not installed. Please install Git first.');
  process.exit(1);
}

main();