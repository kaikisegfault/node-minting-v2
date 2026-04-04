#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DAPP_DIR="$REPO_ROOT/dapp"
SITE_DIR="$REPO_ROOT/site"

echo "=== Building React DApp ==="
cd "$DAPP_DIR"
GENERATE_SOURCEMAP=false npm run build

echo ""
echo "=== Copying build output to site ==="
# Remove old build, keep everything else in site/ intact
rm -rf "$SITE_DIR/build"
cp -r "$DAPP_DIR/build" "$SITE_DIR/build"

# Also copy media to static/media (some CSS references use this path)
rm -rf "$SITE_DIR/static/media"
mkdir -p "$SITE_DIR/static"
cp -r "$DAPP_DIR/build/static/media" "$SITE_DIR/static/media" 2>/dev/null || true

echo ""
echo "=== Updating hash references in index.html ==="
# Read asset-manifest.json to get new filenames
MANIFEST="$DAPP_DIR/build/asset-manifest.json"

CSS_FILE=$(python3 -c "import json; d=json.load(open('$MANIFEST')); print(d['files']['main.css'])")
JS_FILE=$(python3 -c "import json; d=json.load(open('$MANIFEST')); print(d['files']['main.js'])")

# Extract just the hash portion (e.g., "main.63519139.css" from "/static/css/main.63519139.css")
CSS_HASH=$(basename "$CSS_FILE")
JS_HASH=$(basename "$JS_FILE")

echo "  New CSS: $CSS_HASH"
echo "  New JS:  $JS_HASH"

# Replace old hashes in site/index.html
# Pattern: build/static/css/main.ANYTHING.css → build/static/css/main.NEWHASH.css
cd "$SITE_DIR"
sed -i -E "s|build/static/css/main\.[a-f0-9]+\.css|build/static/css/$CSS_HASH|g" index.html
sed -i -E "s|build/static/js/main\.[a-f0-9]+\.js|build/static/js/$JS_HASH|g" index.html

echo ""
echo "=== Verifying ==="
grep -o 'build/static/css/main\.[a-f0-9]*\.css' index.html
grep -o 'build/static/js/main\.[a-f0-9]*\.js' index.html

echo ""
echo "=== Build complete ==="
echo "site/ is ready to deploy to S3"
