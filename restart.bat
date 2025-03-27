@echo off
echo Stopping any running servers...

REM Stop any running node processes (frontend)
taskkill /im node.exe /f 2>nul

REM Stop any running uvicorn processes (backend)
taskkill /im python.exe /f 2>nul

echo Starting backend server...
start cmd /k "cd backend && python -m uvicorn app.main:app --reload"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo Servers started successfully! 