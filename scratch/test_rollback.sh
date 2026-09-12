#!/bin/bash
set -e

mkdir -p scratch/deploy/releases/1000/backend/src
mkdir -p scratch/deploy/releases/1000/frontend
touch scratch/deploy/releases/1000/backend/src/server.js
touch scratch/deploy/releases/1000/frontend/package.json

mkdir -p scratch/deploy/releases/2000/backend/src
mkdir -p scratch/deploy/releases/2000/frontend
touch scratch/deploy/releases/2000/backend/src/server.js
touch scratch/deploy/releases/2000/frontend/package.json

ln -sfn $(pwd)/scratch/deploy/releases/2000 scratch/deploy/current

echo "Simulated environment created. Current points to:"
readlink -f scratch/deploy/current

# Mock rollback logic
CURRENT_LINK="scratch/deploy/current"
RELEASES_DIR="scratch/deploy/releases"
CURRENT_TARGET=$(readlink -f "$CURRENT_LINK")
AVAILABLE_RELEASES=$(ls -1d "$RELEASES_DIR"/* | sort -rn)

for rel in $AVAILABLE_RELEASES; do
    ABS_REL=$(readlink -f "$rel")
    if [ -d "$ABS_REL" ]; then
        if [ "$ABS_REL" != "$CURRENT_TARGET" ]; then
            PREVIOUS_RELEASE="$ABS_REL"
            break
        fi
    fi
done

echo "Resolved Previous Release: $PREVIOUS_RELEASE"

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "Fail"
    exit 1
fi

ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
echo "New current target:"
readlink -f scratch/deploy/current
