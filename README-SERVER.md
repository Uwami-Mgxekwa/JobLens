# JobLens Local Server

## Quick Start

### Option 1: Batch File (Recommended)
Double-click `start-server.bat` to start the server.

### Option 2: PowerShell Script
Right-click `start-server.ps1` and select "Run with PowerShell".

## What it does
- Starts a local web server on port 8000
- Opens your JobLens app at `http://localhost:8000`
- Automatically tries different server options (Python, Node.js)

## Requirements
You need at least one of these installed:
- **Python** (recommended) - Usually comes with Windows or download from https://python.org
- **Node.js** - Download from https://nodejs.org

## Usage
1. Double-click the script
2. Open your browser to `http://localhost:8000`
3. Test your app changes
4. Press `Ctrl+C` in the terminal to stop the server

## Troubleshooting
- If you get "execution policy" errors with PowerShell, use the batch file instead
- If neither script works, you may need to install Python or Node.js
- Make sure you're running the script from the project root folder (where index.html is located)