#!/bin/bash
set -e

echo "==========================================="
echo "   ⚠️ Initiating Emergency Rollback"
echo "==========================================="

DEPLOY_ROOT="/var/www/sweettree"
CURRENT_LINK="$DEPLOY_ROOT/current"

cd "$DEPLOY_ROOT/releases"
# Get the two most recent directories
LATEST_RELEASES=$(ls -1tr | tail -n 2)
PREVIOUS_RELEASE=$(echo "$LATEST_RELEASES" | head -n 1)
CURRENT_RELEASE=$(echo "$LATEST_RELEASES" | tail -n 1)

if [ -z "$PREVIOUS_RELEASE" ] || [ "$PREVIOUS_RELEASE" == "$CURRENT_RELEASE" ]; then
    echo "--> ❌ Rollback Failed: No previous release found to rollback to!"
    exit 1
fi

PREVIOUS_DIR="$DEPLOY_ROOT/releases/$PREVIOUS_RELEASE"

echo "--> Reverting symlink to $PREVIOUS_RELEASE..."
cd "$DEPLOY_ROOT"
ln -sfn "$PREVIOUS_DIR" "$CURRENT_LINK"

echo "--> Reloading PM2 processes from previous release..."
pm2 reload ecosystem.config.cjs --update-env || pm2 start current/ecosystem.config.cjs

echo "==========================================="
echo "   ✅ Rollback Completed Successfully!"
echo "==========================================="
exit 0
