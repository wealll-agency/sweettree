@echo off
echo ===========================================
echo    Starting SweetTree Deployment...     
echo ===========================================

echo.
echo --^> Pulling latest code from GitHub...
git pull origin main

echo.
echo --^> Setting up Backend...
cd backend
call npm install

:: Restart Backend using PM2 (Uncomment and adjust the name if you use PM2)
:: pm2 restart sweettree-backend || pm2 start src\server.js --name sweettree-backend

cd ..

echo.
echo --^> Setting up Frontend...
cd frontend
call npm install

echo.
echo --^> Building Next.js Frontend for production...
call npm run build

:: Restart Frontend using PM2 (Uncomment and adjust the name if you use PM2)
:: pm2 restart sweettree-frontend || pm2 start npm --name "sweettree-frontend" -- start

cd ..

echo.
echo ===========================================
echo    Deployment Completed Successfully!   
echo ===========================================
pause
