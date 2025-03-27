@echo off
echo ---- LoL Improve Clean Build Script ----

REM Stop any running processes
echo Stopping any running servers...
taskkill /im node.exe /f 2>nul
taskkill /im python.exe /f 2>nul

REM Clean frontend dependencies
echo Cleaning frontend dependencies...
cd frontend
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del /f package-lock.json
)

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing frontend dependencies.
    exit /b %ERRORLEVEL%
)

REM Back to root directory
cd ..

REM Clean backend
echo Cleaning backend...
cd backend
if exist __pycache__ (
    echo Removing Python cache files...
    rmdir /s /q __pycache__
)
if exist app\__pycache__ (
    rmdir /s /q app\__pycache__
)

REM Create/update Python virtual environment
echo Setting up Python environment...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Error installing backend dependencies.
    exit /b %ERRORLEVEL%
)

REM Back to root directory
cd ..

REM Start servers
echo Starting servers...
start cmd /k "cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload"
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul
start cmd /k "cd frontend && npm start"

echo Setup completed successfully! 