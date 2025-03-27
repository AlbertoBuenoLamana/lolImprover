Write-Host "---- LoL Improve Clean Build Script ----" -ForegroundColor Cyan

# Stop any running processes
Write-Host "Stopping any running servers..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean frontend dependencies
Write-Host "Cleaning frontend dependencies..." -ForegroundColor Cyan
Push-Location -Path "./frontend"
if (Test-Path -Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force
}
if (Test-Path -Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Path "package-lock.json" -Force
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
$npmProcess = Start-Process -FilePath "npm" -ArgumentList "install" -PassThru -Wait -NoNewWindow
if ($npmProcess.ExitCode -ne 0) {
    Write-Host "Error installing frontend dependencies." -ForegroundColor Red
    Pop-Location
    exit $npmProcess.ExitCode
}

# Back to root directory
Pop-Location

# Clean backend
Write-Host "Cleaning backend..." -ForegroundColor Cyan
Push-Location -Path "./backend"
if (Test-Path -Path "__pycache__") {
    Write-Host "Removing Python cache files..." -ForegroundColor Yellow
    Remove-Item -Path "__pycache__" -Recurse -Force
}
if (Test-Path -Path "app/__pycache__") {
    Remove-Item -Path "app/__pycache__" -Recurse -Force
}

# Create/update Python virtual environment
Write-Host "Setting up Python environment..." -ForegroundColor Cyan
if (-not (Test-Path -Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList "-m", "venv", "venv" -Wait -NoNewWindow
}
# Activate virtual environment and install dependencies
if ($PSVersionTable.PSVersion.Major -ge 6) {
    # PowerShell Core
    & "./venv/Scripts/Activate.ps1"
} else {
    # Windows PowerShell
    & "./venv/Scripts/Activate.ps1"
}
$pipProcess = Start-Process -FilePath "pip" -ArgumentList "install", "-r", "requirements.txt" -PassThru -Wait -NoNewWindow
if ($pipProcess.ExitCode -ne 0) {
    Write-Host "Error installing backend dependencies." -ForegroundColor Red
    Pop-Location
    exit $pipProcess.ExitCode
}

# Back to root directory
Pop-Location

# Start servers
Write-Host "Starting servers..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload" -PassThru

Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd frontend && npm start" -PassThru

Write-Host "Setup completed successfully!" -ForegroundColor Green
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