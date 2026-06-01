@echo off
echo =======================================
echo     Starting VeritasAI Servers
echo =======================================

echo.
echo [1/4] Installing Backend Dependencies...
pip install -r requirements.txt

echo.
echo [2/4] Starting Backend Server...
start cmd /k "cd backend && python app.py"

echo.
echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install

echo.
echo [4/4] Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo All processes started! Two new terminal windows should open for the frontend and backend.
pause
