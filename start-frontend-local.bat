@echo off
echo ==========================================
echo   Starting Indusmind Energy Dashboard Platform Frontend (Docker)
echo ==========================================
echo.
echo Services:
echo   - Frontend Dev Server (Port 5173)
echo.
echo Note: Ensure backend is running first! (start-backend-local.bat)
echo Press Ctrl+C to stop.
echo.

docker-compose -f docker-compose.front-local.yml up --build
