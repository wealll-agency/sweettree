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
cd ..

# 3. Setup Frontend
echo "--> Setting up Frontend..."
cd frontend
npm install

echo "--> Building Next.js Frontend for production..."
rm -rf .next
npm run build
cd ..

# 4. Restart PM2 services
echo "--> Restarting PM2 processes..."
pm2 restart ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs

echo "==========================================="
echo "   ✅ Deployment Completed Successfully!   "
echo "==========================================="

