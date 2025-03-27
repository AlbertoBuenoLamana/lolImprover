# LoL Improve Scripts Guide

This project includes PowerShell scripts to help with development and deployment. These scripts are designed to work in PowerShell on Windows.

## Available Scripts

- `restart.ps1`: Stops any running backend and frontend servers and starts them again
- `clean-build.ps1`: Performs a complete clean and rebuild of the application

## How to Use

### Running the Scripts

1. Open PowerShell in the project directory
2. Make sure script execution is allowed by running:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
3. Run the desired script:
   ```powershell
   .\restart.ps1
   ```
   or
   ```powershell
   .\clean-build.ps1
   ```

### Script Details

#### restart.ps1

This script:
- Stops any running node and python processes
- Starts the backend server
- Starts the frontend server
- Keeps the servers running until you press Ctrl+C

#### clean-build.ps1

This script:
- Stops any running processes
- Cleans frontend dependencies (removes node_modules and package-lock.json)
- Reinstalls frontend dependencies
- Cleans backend cache files
- Sets up the Python virtual environment
- Installs backend dependencies
- Starts both servers

## Troubleshooting

If you encounter script execution errors, make sure you're using PowerShell and not Command Prompt, and that you've set the execution policy correctly.

If you encounter "module not found" errors, the clean-build script should fix those by reinstalling all dependencies.

## Manual Commands

If the scripts don't work for you, you can run these commands manually in separate PowerShell windows:

### Backend

```powershell
cd backend
python -m venv venv # If not already created
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend
npm install 
npm start
``` 