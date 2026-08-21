#!/bin/bash
set -e

echo "==========================================="
echo "   🚀 Starting SweetTree Atomic Deployment"
echo "==========================================="

DEPLOY_ROOT="/var/www/sweettree"
TIMESTAMP=$(date +%s)
RELEASE_DIR="$DEPLOY_ROOT/releases/$TIMESTAMP"
CURRENT_LINK="$DEPLOY_ROOT/current"
LOCK_FILE="$DEPLOY_ROOT/deploy.lock"

# 1. Deployment Lock
if [ -f "$LOCK_FILE" ]; then
    # Check if lock is stale (older than 10 minutes)
    if [ $(find "$LOCK_FILE" -mmin +10 2>/dev/null) ]; then
        echo "--> ⚠️ Stale lock file detected (older than 10 minutes). Removing it."
        rm -f "$LOCK_FILE"
    else
        echo "--> ❌ Deployment is already in progress. Lock file exists at $LOCK_FILE"
        echo "--> If this is a stale lock, wait 10 minutes or run: rm -f $LOCK_FILE"
        exit 1
    fi
fi
touch "$LOCK_FILE"

# Ensure lock file is removed on exit, fail, or interrupt
trap "rm -f $LOCK_FILE" EXIT INT TERM

# Ensure directories exist
mkdir -p "$DEPLOY_ROOT/releases"

# 2. Update Codebase (assuming this script is run in the root of the git repo at $DEPLOY_ROOT)
echo "--> Pulling latest code from GitHub..."
git pull origin main || { echo "--> ❌ Git pull failed! Aborting."; exit 1; }

# 3. Create New Release Directory
echo "--> Creating new release at $RELEASE_DIR..."
# Use rsync to copy the codebase, excluding heavy/generated folders and the releases directory itself
rsync -a --exclude 'node_modules' --exclude '.git' --exclude 'releases' --exclude 'current' --exclude 'deploy.lock' --exclude '.next' --exclude '.next-backup' ./ "$RELEASE_DIR/" || { echo "--> ❌ Rsync failed! Aborting."; exit 1; }

# 4. Setup Backend
echo "--> Setting up Backend in new release..."
cd "$RELEASE_DIR/backend"
npm ci --omit=dev || { echo "--> ❌ Backend npm ci failed! Aborting."; exit 1; }

# 5. Setup Frontend & Build
echo "--> Setting up Frontend in new release..."
cd "$RELEASE_DIR/frontend"
npm ci --omit=dev || { echo "--> ❌ Frontend npm ci failed! Aborting."; exit 1; }

echo "--> Building Next.js Frontend for production..."
export NEXT_TELEMETRY_DISABLED=1
if ! npm run build; then
    echo "--> ❌ Frontend Build Failed! Aborting deployment."
    echo "--> The live production site was NOT touched and remains perfectly active."
    exit 1
fi

# 5.5 Aggregate Old Static Assets (CRITICAL FIX FOR CHUNKLOADERROR)
# This copies all historical JS/CSS chunks from the current live release into the newly built release.
# When the symlink swaps, active users with old HTML will still be able to fetch their old chunks!
echo "--> Aggregating previous static assets to prevent ChunkLoadErrors..."
if [ -d "$CURRENT_LINK/frontend/.next/static" ]; then
    # -r recursive, -n no clobber (don't overwrite new chunks with old ones if there's a hash collision, which shouldn't happen)
    cp -rn "$CURRENT_LINK/frontend/.next/static/"* "$RELEASE_DIR/frontend/.next/static/" || true
    echo "--> ✅ Old static chunks successfully merged into new release."
fi

# 6. Build Validation
echo "--> Validating Build Output..."
if [ ! -d "$RELEASE_DIR/frontend/.next/static" ]; then
    echo "--> ❌ Validation Failed: .next/static directory is missing! Aborting."
    exit 1
fi

# 7. Atomic Swap
echo "--> Performing atomic symlink swap..."
cd "$DEPLOY_ROOT"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

echo "--> Reloading PM2 processes from new release..."
# PM2 often caches the resolved realpath of symlinks during 'reload'.
# By using 'restart', we force it to resolve the new 'current' symlink.
pm2 restart ecosystem.config.cjs --update-env || pm2 start current/ecosystem.config.cjs

# 8. Post-Deploy Health Check
echo "--> Running Health Checks (Waiting 5 seconds for startup)..."
sleep 5

FRONTEND_STATUS=$(pm2 jlist | grep -o '"name":"sweettree-frontend","pm2_env":{"status":"[^"]*"' | grep -o 'status":"[^"]*' | cut -d'"' -f3 | head -n 1)
BACKEND_STATUS=$(pm2 jlist | grep -o '"name":"sweettree-backend","pm2_env":{"status":"[^"]*"' | grep -o 'status":"[^"]*' | cut -d'"' -f3 | head -n 1)

if [ "$FRONTEND_STATUS" != "online" ] || [ "$BACKEND_STATUS" != "online" ]; then
    echo "--> ❌ PM2 Health Check Failed! Processes are not online."
    echo "    Frontend: $FRONTEND_STATUS, Backend: $BACKEND_STATUS"
    
    echo "--> ⚠️ INITIATING AUTOMATIC ROLLBACK..."
    bash ./rollback.sh
    exit 1
fi

if ! curl -s --head --fail http://localhost:7051 > /dev/null; then
    echo "--> ❌ HTTP Health Check Failed! Frontend is not responding."
    
    echo "--> ⚠️ INITIATING AUTOMATIC ROLLBACK..."
    bash ./rollback.sh
    exit 1
fi

# 9. Cleanup Old Releases (Keep last 3)
echo "--> Cleaning up old releases (Keeping last 3)..."
cd "$DEPLOY_ROOT/releases"
ls -1tr | head -n -3 | xargs -d '\n' rm -rf -- || true

echo "==========================================="
echo "   ✅ True Atomic Deployment Completed!    "
echo "==========================================="
exit 0
