# 🚀 Setup Guide for Custom Unrestricted Chatbot

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- An **API key** from one of these providers:
  - [OpenAI](https://platform.openai.com/) (recommended)
  - [Anthropic](https://console.anthropic.com/)
  - Or install [Ollama](https://ollama.ai/) for local models

## Step-by-Step Setup

### 1. Install Node.js
If you don't have Node.js installed:
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version for Windows
3. Run the installer and follow the prompts
4. Restart your terminal/command prompt

### 2. Verify Installation
Open a new terminal and run:
```bash
node --version
npm --version
```
You should see version numbers for both.

### 3. Install Dependencies

**For Server (Backend):**
```bash
npm install
```

**For Client (Frontend):**
```bash
cd client
npm install
cd ..
```

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` file and add your API key:
   ```
   # For OpenAI (most popular)
   OPENAI_API_KEY=sk-your-actual-api-key-here
   
   # OR for Anthropic
   ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
   
   # OR for local models (Ollama)
   LOCAL_LLM_URL=http://localhost:11434
   ```

### 5. Start the Application
Run both frontend and backend:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend app on http://localhost:3000

### 6. Open in Browser
Go to http://localhost:3000 and start chatting!

## Troubleshooting

### Issue: "npm not found"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal
- Try again

### Issue: "Cannot connect to server"
- Make sure both server and client are running
- Check that port 3001 and 3000 are available
- Look for error messages in the terminal

### Issue: "API Error"
- Check your API key in the `.env` file
- Make sure the key is valid and has credits
- Try switching to a different provider in settings

### Issue: "Local model not working"
- Install Ollama: https://ollama.ai/
- Pull a model: `ollama pull llama2`
- Make sure Ollama is running: `ollama serve`

## Manual Installation (If Automated Setup Fails)

If the automated setup scripts don't work, follow these manual steps:

1. **Install server dependencies:**
   ```bash
   npm install express cors dotenv axios body-parser ws nodemon concurrently
   ```

2. **Create client React app (if not already created):**
   ```bash
   npx create-react-app client --template typescript
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start manually:**
   - Terminal 1: `cd server && node index.js`
   - Terminal 2: `cd client && npm start`

## Getting API Keys

### OpenAI (Recommended)
1. Go to https://platform.openai.com/
2. Create account or sign in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste into `.env` file

### Anthropic
1. Go to https://console.anthropic.com/
2. Create account or sign in
3. Go to API Keys
4. Create new key
5. Copy and paste into `.env` file

### Local Models (Free)
1. Install Ollama: https://ollama.ai/
2. Pull models: `ollama pull llama2`
3. Start Ollama: `ollama serve`
4. Set `LOCAL_LLM_URL=http://localhost:11434` in `.env`

## Features

✅ **Unrestricted AI conversations** - No content filters
✅ **Multiple AI providers** - OpenAI, Anthropic, local models  
✅ **Custom system prompts** - Customize AI personality
✅ **Modern UI** - Beautiful dark theme
✅ **Real-time chat** - Instant responses
✅ **Mobile friendly** - Works on phones and tablets

## Next Steps

Once everything is working:
1. Try different models in the Settings panel
2. Experiment with custom system prompts
3. Test various conversation topics
4. Prepare for Phase 2 (MCP integration)

Need help? Check the main README.md or create an issue! 