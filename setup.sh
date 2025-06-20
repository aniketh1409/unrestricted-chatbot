#!/bin/bash

echo "🤖 Setting up Custom Unrestricted Chatbot..."
echo

echo "Installing server dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

echo
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

cd ..
echo
echo "✅ Setup complete!"
echo
echo "Next steps:"
echo "1. Copy .env.example to .env and add your API keys"
echo "2. Run 'npm run dev' to start the application"
echo "3. Open http://localhost:3000 in your browser"
echo 