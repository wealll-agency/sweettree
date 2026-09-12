#!/bin/bash
set -e

echo "==========================================="
echo "   🔄 Starting Atomic Rollback Procedure"
echo "==========================================="

DEPLOY_ROOT="/var/www/sweettree"
CURRENT_LINK="$DEPLOY_ROOT/current"
RELEASES_DIR="$DEPLOY_ROOT/releases"

# 1. Resolve Current Target
if [ ! -L "$CURRENT_LINK" ]; then
    echo "--> ❌ CRITICAL: $CURRENT_LINK is not a symlink! Cannot determine current release."
    exit 1
fi

CURRENT_TARGET=$(readlink -f "$CURRENT_LINK")
echo "--> Current broken release identified: $CURRENT_TARGET"

# 2. Identify the Preceding Release
echo "--> Scanning available releases..."
AVAILABLE_RELEASES=$(ls -1d "$RELEASES_DIR"/* | sort -rn)

PREVIOUS_RELEASE=""

for rel in $AVAILABLE_RELEASES; do
    # Ensure it's a directory
    if [ -d "$rel" ]; then
        # Skip the current broken release
        if [ "$rel" != "$CURRENT_TARGET" ]; then
            PREVIOUS_RELEASE="$rel"
            break
        fi
    fi
done

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "--> ❌ CRITICAL: No preceding release found to rollback to! Rollback aborted."
    exit 1
fi

echo "--> Target known-good release identified: $PREVIOUS_RELEASE"

# 3. Validate Artifacts
echo "--> Validating target release integrity..."
if [ ! -f "$PREVIOUS_RELEASE/backend/src/server.js" ]; then
    echo "--> ❌ Target release missing backend/src/server.js. Validation failed!"
    exit 1
fi

if [ ! -f "$PREVIOUS_RELEASE/frontend/package.json" ]; then
    echo "--> ❌ Target release missing frontend/package.json. Validation failed!"
    exit 1
fi

echo "--> ✅ Target release integrity verified."

# 4. Atomic Swap
echo "--> Performing atomic symlink swap back to $PREVIOUS_RELEASE..."
cd "$DEPLOY_ROOT"
ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"

# 5. Reload PM2 Ecosystem
echo "--> Reloading PM2 processes with Zero-Downtime Cluster Mode..."
pm2 reload ecosystem.config.cjs --update-env || pm2 start current/ecosystem.config.cjs

# 6. Bounded Post-Rollback Verification
echo "--> Running Post-Rollback Health Checks..."

POST_DEPLOY_READY=0

for i in {1..20}; do
    FRONTEND_STATUS=$(pm2 jlist | node -e '
    let data="";
    process.stdin.on("data", c => data += c);
    process.stdin.on("end", () => {
        const apps = JSON.parse(data);
        const app = apps.find(x => x.name === "sweettree-frontend");
        console.log(app?.pm2_env?.status || "");
    });
    ')

    BACKEND_STATUS=$(pm2 jlist | node -e '
    let data="";
    process.stdin.on("data", c => data += c);
    process.stdin.on("end", () => {
        const apps = JSON.parse(data);
        const app = apps.find(x => x.name === "sweettree-backend");
        console.log(app?.pm2_env?.status || "");
    });
    ')

    echo "--> PM2 status check $i/20: Frontend=$FRONTEND_STATUS Backend=$BACKEND_STATUS"

    if [ "$FRONTEND_STATUS" = "online" ] && [ "$BACKEND_STATUS" = "online" ]; then
        POST_DEPLOY_READY=1
        break
    fi

    sleep 1
done

if [ "$FRONTEND_STATUS" != "online" ] || [ "$BACKEND_STATUS" != "online" ]; then
    echo "--> ❌ CRITICAL: Rollback PM2 Health Check Failed!"
    echo "--> Manual intervention is required immediately."
    exit 1
fi

echo "==========================================="
echo "   ✅ Atomic Rollback Completed Successfully!"
echo "==========================================="
exit 0
