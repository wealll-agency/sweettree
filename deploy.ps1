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
Set-Location -Path ".."

# 3. Setup Frontend
Write-Host "--> Setting up Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm install

Write-Host "--> Building Next.js Frontend for production..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
npm run build
Set-Location -Path ".."

# 4. Restart PM2 services
Write-Host "--> Restarting PM2 processes..." -ForegroundColor Yellow
pm2 restart ecosystem.config.cjs --update-env

Write-Host "===========================================" -ForegroundColor Green
Write-Host "   ✅ Deployment Completed Successfully!   " -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

