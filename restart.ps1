Write-Host "Stopping any running servers..." -ForegroundColor Cyan

# Stop any running node processes (frontend)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop any running python processes (backend)
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Starting backend server..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd backend && python -m uvicorn app.main:app --reload" -PassThru

Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd frontend && npm start" -PassThru

Write-Host "Servers started successfully!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

try {
    # Keep script running until Ctrl+C
    Write-Host "Running servers. Press Ctrl+C to exit." -ForegroundColor Cyan
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Clean up on exit
    if ($backendProcess -ne $null -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force
    }
    if ($frontendProcess -ne $null -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force
    }
} 