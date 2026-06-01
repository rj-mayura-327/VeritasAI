@echo off
echo Starting VeritasAI Backend and Frontend...
echo.

start "Backend Server" cmd /k "cd backend && python app.py"
timeout /t 3 /nobreak >nul

start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
