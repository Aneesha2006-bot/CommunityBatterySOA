@echo off
echo ========================================================
echo   Community Battery Reserve Priority SOA Web App
echo ========================================================
echo.
echo Starting web server on http://localhost:3000 ...
echo.

start "" "http://localhost:3000"
node web/server.cjs
pause
