@echo off
echo Starting Blood Emergency Platform...

:: Start Backend
echo Starting Backend Server...
start "BEOS Backend" cmd /k "cd /d %~dp0backend && npm start"

:: Start Frontend
echo Starting Frontend Server...
start "BEOS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for servers to initialize (approx 5 seconds)
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

:: Open Browser
echo Opening Application...
start http://localhost:5173

echo Done! Servers are running in separate windows.
echo You can close this window now.
