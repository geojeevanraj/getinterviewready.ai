@echo off
echo ========================================
echo AI Interview Platform - Setup Script
echo ========================================
echo.

echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed successfully!
echo.

echo [2/3] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed successfully!
echo.

echo [3/3] Setup Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Make sure MongoDB is running
echo 2. Start Backend:  cd backend  and run  npm run dev
echo 3. Start Frontend: cd frontend and run  npm run dev
echo 4. Open browser: http://localhost:3000
echo.
echo Check QUICKSTART.md for detailed instructions!
echo.
pause
