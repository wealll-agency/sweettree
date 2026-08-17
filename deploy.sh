#!/bin/bash

echo "==========================================="
echo "   🚀 Starting SweetTree Deployment...     "
echo "==========================================="

# 1. Pull the latest code from the main branch
echo "--> Pulling latest code from GitHub..."
git pull origin main

# 2. Setup Backend
echo "--> Setting up Backend..."
cd backend
npm install

# Restart Backend using PM2 (Uncomment and adjust the name if you use PM2)
# pm2 restart sweettree-backend || pm2 start src/server.js --name sweettree-backend

cd ..

# 3. Setup Frontend
echo "--> Setting up Frontend..."
cd frontend
npm install

echo "--> Building Next.js Frontend for production..."
npm run build

# Restart Frontend using PM2 (Uncomment and adjust the name if you use PM2)
# pm2 restart sweettree-frontend || pm2 start npm --name "sweettree-frontend" -- start

cd ..

echo "==========================================="
echo "   ✅ Deployment Completed Successfully!   "
echo "==========================================="
