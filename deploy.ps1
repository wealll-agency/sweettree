Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   🚀 Starting SweetTree Deployment...     " -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 1. Pull the latest code from the main branch
Write-Host "--> Pulling latest code from GitHub..." -ForegroundColor Yellow
git pull origin main

# 2. Setup Backend
Write-Host "--> Setting up Backend..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install

# Restart Backend using PM2 (Uncomment and adjust the name if you use PM2)
# pm2 restart sweettree-backend || pm2 start src/server.js --name sweettree-backend

Set-Location -Path ".."

# 3. Setup Frontend
Write-Host "--> Setting up Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm install

Write-Host "--> Building Next.js Frontend for production..." -ForegroundColor Yellow
npm run build

# Restart Frontend using PM2 (Uncomment and adjust the name if you use PM2)
# pm2 restart sweettree-frontend || pm2 start npm --name "sweettree-frontend" -- start

Set-Location -Path ".."

Write-Host "===========================================" -ForegroundColor Green
Write-Host "   ✅ Deployment Completed Successfully!   " -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
