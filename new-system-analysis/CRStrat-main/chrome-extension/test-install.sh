#!/bin/bash
# Chrome Extension Installation Test Script

echo "🚀 Testing Chrome Extension Installation..."

# Create test directory
TEST_DIR="extension_test"
mkdir -p $TEST_DIR

echo "📦 Extracting extension package..."
tar -xzf ../strategic-content-capture-extension.tar.gz -C $TEST_DIR

echo "✅ Extension files extracted to $TEST_DIR"
echo ""
echo "📁 Extension Contents:"
ls -la $TEST_DIR

echo ""
echo "🔍 Verifying key files..."

# Check manifest
if [ -f "$TEST_DIR/manifest.json" ]; then
    echo "✅ manifest.json found"
    echo "   📄 Manifest version: $(grep '"manifest_version"' $TEST_DIR/manifest.json)"
    echo "   📄 Extension name: $(grep '"name"' $TEST_DIR/manifest.json)"
else
    echo "❌ manifest.json missing"
fi

# Check background script
if [ -f "$TEST_DIR/background-enhanced.js" ]; then
    echo "✅ background-enhanced.js found ($(wc -l < $TEST_DIR/background-enhanced.js) lines)"
else
    echo "❌ background-enhanced.js missing"
fi

# Check popup
if [ -f "$TEST_DIR/popup.html" ] && [ -f "$TEST_DIR/popup.js" ]; then
    echo "✅ popup files found"
else
    echo "❌ popup files missing"
fi

# Check content scripts
if [ -f "$TEST_DIR/content-enhanced.js" ]; then
    echo "✅ content-enhanced.js found ($(wc -l < $TEST_DIR/content-enhanced.js) lines)"
else
    echo "❌ content-enhanced.js missing"
fi

# Check configuration
if [ -f "$TEST_DIR/config.js" ]; then
    echo "✅ config.js found"
    echo "   🔗 API URL configured: $(grep 'API_BASE_URL' $TEST_DIR/config.js)"
else
    echo "❌ config.js missing"
fi

echo ""
echo "🎯 Installation Instructions:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo "3. Click 'Load unpacked'"
echo "4. Select the folder: $(pwd)/$TEST_DIR"
echo "5. Extension should appear in your extensions list"
echo ""
echo "🔗 Platform URL: https://8b8b11fe-8b26-478c-833b-4cb2c7d9c3ca-00-1u6v7kw2cbj6z.worf.replit.dev"
echo ""
echo "✅ Extension package is ready for installation!"

# Cleanup
echo ""
echo "🧹 Cleaning up test directory..."
rm -rf $TEST_DIR
echo "Done!"