@echo off
echo ========================================
echo    GunDB Server Startup Script
echo ========================================
echo.

echo Setting environment variables...
set PORT=8080
set HOST=0.0.0.0

echo Port: %PORT%
echo Host: %HOST%
echo.

echo Starting GunDB server...
echo Server will be accessible at:
echo - Local: http://localhost:%PORT%
echo - Network: http://0.0.0.0:%PORT%
echo - External: http://YOUR_EXTERNAL_IP:%PORT%
echo.

echo Press Ctrl+C to stop the server
echo.

node server.js

pause

