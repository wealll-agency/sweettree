#!/bin/bash

echo "==========================================="
echo "   🚀 Starting SweetTree Deployment...     "
echo "==========================================="

# Do NOT use set -e indiscriminately because we want to handle rollbacks manually
# We will check exit codes explicitly.

# 1. Pull the latest code from the main branch
echo "--> Pulling latest code from GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "--> ❌ Git pull failed! Aborting."
    exit 1
fi

# 2. Setup Backend
echo "--> Setting up Backend..."
cd backend
npm ci --omit=dev
if [ $? -ne 0 ]; then
    echo "--> ❌ Backend npm ci failed! Aborting."
    exit 1
fi
cd ..

# 3. Setup Frontend
echo "--> Setting up Frontend..."
cd frontend
npm ci --omit=dev
if [ $? -ne 0 ]; then
    echo "--> ❌ Frontend npm ci failed! Aborting."
    exit 1
fi

echo "--> Building Next.js Frontend for production in isolated directory..."
export NEXT_TELEMETRY_DISABLED=1

# Clean any stale temp directory
rm -rf .next-temp

# Run the build using BUILD_DIR to isolate output
if BUILD_DIR=.next-temp npm run build; then
    echo "--> ✅ Build Successful in isolated directory!"
else
    echo "--> ❌ Build Failed! Aborting deployment."
    echo "--> Live production release (.next) was NOT touched and remains active."
    # Clean up the failed temp build
    rm -rf .next-temp
    exit 1
fi

# 4. Atomic Directory Swap & PM2 Reload
echo "--> Performing atomic release swap..."

# Keep a backup of the current live release
rm -rf .next-backup
if [ -d ".next" ]; then
    mv .next .next-backup
fi

# Activate the new release
mv .next-temp .next

cd ..

echo "--> Reloading PM2 processes..."
# Reload gracefully
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs

# 5. Post-Deploy Health Check
echo "--> Running Health Checks (Waiting 5 seconds for startup)..."
sleep 5

# Check if PM2 says the processes are online
FRONTEND_STATUS=$(pm2 jlist | grep -o '"name":"sweettree-frontend","pm2_env":{"status":"[^"]*"' | grep -o 'status":"[^"]*' | cut -d'"' -f3)
BACKEND_STATUS=$(pm2 jlist | grep -o '"name":"sweettree-backend","pm2_env":{"status":"[^"]*"' | grep -o 'status":"[^"]*' | cut -d'"' -f3)

if [ "$FRONTEND_STATUS" != "online" ] || [ "$BACKEND_STATUS" != "online" ]; then
    echo "--> ❌ Health Check Failed! PM2 processes are not online."
    echo "    Frontend Status: $FRONTEND_STATUS"
    echo "    Backend Status: $BACKEND_STATUS"
    
    echo "--> ⚠️  INITIATING AUTOMATIC ROLLBACK..."
    cd frontend
    rm -rf .next
    if [ -d ".next-backup" ]; then
        mv .next-backup .next
        echo "--> ✅ Previous working release restored from .next-backup"
    else
        echo "--> ❌ FATAL: No backup found to rollback to!"
    fi
    cd ..
    pm2 reload ecosystem.config.cjs --update-env
    echo "--> 🔴 Deployment failed, but system was rolled back to previous known-good state."
    exit 1
fi

# HTTP Health check to ensure it's actually serving requests
if ! curl -s --head --fail http://localhost:7051 > /dev/null; then
    echo "--> ❌ HTTP Health Check Failed! Frontend is not responding on port 7051."
    
    echo "--> ⚠️  INITIATING AUTOMATIC ROLLBACK..."
    cd frontend
    rm -rf .next
    if [ -d ".next-backup" ]; then
        mv .next-backup .next
        echo "--> ✅ Previous working release restored from .next-backup"
    else
        echo "--> ❌ FATAL: No backup found to rollback to!"
    fi
    cd ..
    pm2 reload ecosystem.config.cjs --update-env
    echo "--> 🔴 Deployment failed, but system was rolled back to previous known-good state."
    exit 1
fi

echo "--> ✅ Health Checks Passed!"
echo "==========================================="
echo "   ✅ True Atomic Deployment Completed!    "
echo "==========================================="
exit 0
