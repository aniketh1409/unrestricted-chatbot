@echo off
echo 🤖 Setting up Unrestricted AI Chatbot...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

REM Check if Ollama is installed
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama not found. Please install Ollama first.
    echo Download from: https://ollama.ai
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
cd client && call npm install && cd ..

echo 🐬 Downloading Dolphin-Llama3 (uncensored model)...
ollama pull dolphin-llama3:8b

echo ⚙️ Creating environment file...
(
echo DEFAULT_PROVIDER=local
echo LOCAL_LLM_URL=http://localhost:11434
echo DEFAULT_LOCAL_MODEL=dolphin-llama3:8b
echo PORT=3001
echo NODE_ENV=development
echo OPENAI_API_KEY=
echo ANTHROPIC_API_KEY=
) > .env

echo 🚀 Setup complete! Run 'npm run dev' to start the chatbot.
echo 📱 Access at: http://localhost:3000
pause 