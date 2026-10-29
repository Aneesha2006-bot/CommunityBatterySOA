@echo off
echo ========================================================
echo   Community Battery Reserve Priority SOA - Dev Server
echo ========================================================
echo.

if not exist "web\node_modules\" (
    echo [INFO] Installing web dependencies... Please wait.
    cd web && npm install && cd ..
)

echo.
echo Starting Vite Development Server on http://localhost:3000 ...
echo.
start "" "http://localhost:3000"
npm --prefix web run dev
pause
