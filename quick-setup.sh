#!/bin/bash

echo "🤖 Setting up Unrestricted AI Chatbot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "Download from: https://nodejs.org"
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

echo "🐬 Downloading Dolphin-Llama3 (uncensored model)..."
ollama pull dolphin-llama3:8b

echo "⚙️ Creating environment file..."
cat > .env << EOF
DEFAULT_PROVIDER=local
LOCAL_LLM_URL=http://localhost:11434
DEFAULT_LOCAL_MODEL=dolphin-llama3:8b
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EOF

echo "🚀 Setup complete! Run 'npm run dev' to start the chatbot."
echo "📱 Access at: http://localhost:3000" 