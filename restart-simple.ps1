# Restart script for Spanish PowerShell
Write-Host "Stopping any running servers..." -ForegroundColor Cyan

# Stop any running processes
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped Node processes" -ForegroundColor Green
} catch {
    Write-Host "No Node processes to stop" -ForegroundColor Yellow
}

try {
    Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped Python processes" -ForegroundColor Green
} catch {
    Write-Host "No Python processes to stop" -ForegroundColor Yellow
}

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd backend; python -m uvicorn app.main:app --reload"

Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start frontend 
Write-Host "Starting frontend server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd frontend; npm start"

Write-Host "Servers started successfully!" -ForegroundColor Green 