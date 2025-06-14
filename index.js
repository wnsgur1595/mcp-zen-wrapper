#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { promisify } = require('util');
const { pipeline } = require('stream');
const streamPipeline = promisify(pipeline);

// Check for --no-docker flag
const USE_DOCKER = !process.argv.includes('--no-docker');
const args = process.argv.filter(arg => arg !== '--no-docker');

const ZEN_REPO_URL = 'https://github.com/199-biotechnologies/zen-mcp-enhanced';
// Check if we already have a local installation
const LOCAL_ZEN_DIR = '/Users/biobook/playground/zen-mcp-server';
const ZEN_DIR = fs.existsSync(LOCAL_ZEN_DIR) ? LOCAL_ZEN_DIR : path.join(os.homedir(), '.zen-mcp-server');
const ENV_FILE = path.join(ZEN_DIR, '.env');

async function downloadFile(url, dest) {
  const file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function checkDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function startDocker() {
  console.error('Docker is not running. Starting Docker Desktop...');
  
  if (process.platform === 'darwin') {
    try {
      execSync('open -a Docker');
    } catch (error) {
      console.error('Failed to start Docker Desktop. Please start it manually.');
      process.exit(1);
    }
  } else {
    console.error('Please start Docker Desktop manually.');
    process.exit(1);
  }
  
  // Wait for Docker to start
  console.error('Waiting for Docker to start...');
  let attempts = 0;
  while (!checkDocker() && attempts < 30) {
    execSync('sleep 2');
    attempts++;
  }
  
  if (!checkDocker()) {
    console.error('Docker failed to start. Please check Docker Desktop.');
    process.exit(1);
  }
  
  console.error('Docker started successfully!');
}

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
  
  // Check if Docker image exists
  try {
    const images = execSync('docker images zen-mcp-server --format "{{.Repository}}"', { encoding: 'utf8' });
    if (!images.trim()) {
      console.error('Building Docker image...');
      execSync('docker-compose build', { cwd: ZEN_DIR, stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Failed to check/build Docker image.');
    process.exit(1);
  }
  
  // Check if containers are running
  try {
    const running = execSync('docker ps --filter name=zen-mcp-server --format "{{.Names}}"', { encoding: 'utf8' });
    if (!running.includes('zen-mcp-server')) {
      console.error('Starting Zen MCP Server containers...');
      execSync('docker-compose up -d', { cwd: ZEN_DIR, stdio: 'inherit' });
      
      // Wait for services to be ready
      console.error('Waiting for services to start...');
      execSync('sleep 5');
    }
  } catch (error) {
    console.error('Failed to start containers.');
    process.exit(1);
  }
}

function runPythonMode() {
  console.error('Running in Python mode (Docker-free)...');
  
  // Check Python version
  try {
    const pythonVersion = execSync('python3 --version', { encoding: 'utf8' });
    console.error(`Using ${pythonVersion.trim()}`);
  } catch (error) {
    console.error('Python 3 is not installed. Please install Python 3.11 or higher.');
    process.exit(1);
  }
  
  // Pass through environment variables
  const env = { ...process.env };
  
  // Execute the Python server directly
  const child = spawn('python3', ['run.py'], {
    stdio: 'inherit',
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

function main() {
  if (USE_DOCKER) {
    // Docker mode (original behavior)
    
    // Check and start Docker if needed
    if (!checkDocker()) {
      startDocker();
    }
    
    // Setup Zen MCP Server
    setupZenMcpServer();
    
    // Execute the MCP server
    const child = spawn('docker', ['exec', '-i', 'zen-mcp-server', 'python', 'server.py'], {
      stdio: 'inherit',
      cwd: ZEN_DIR
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
  } else {
    // Python mode (Docker-free)
    setupZenMcpServer();  // Still need to clone repo and check .env
    runPythonMode();
  }
}

// Check if we have the required commands
if (USE_DOCKER) {
  try {
    execSync('docker --version', { stdio: 'ignore' });
  } catch {
    console.error('Docker is not installed. Please install Docker Desktop first.');
    console.error('Visit: https://www.docker.com/products/docker-desktop/');
    console.error('\nAlternatively, run with --no-docker flag to use Python mode.');
    process.exit(1);
  }
}

try {
  execSync('git --version', { stdio: 'ignore' });
} catch {
  console.error('Git is not installed. Please install Git first.');
  process.exit(1);
}

main();