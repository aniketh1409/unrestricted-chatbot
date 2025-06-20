@echo off
echo 🤖 Setting up Custom Unrestricted Chatbot...
echo.

echo Installing server dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Copy .env.example to .env and add your API keys
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
pause 