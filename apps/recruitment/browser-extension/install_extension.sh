#!/bin/bash

echo "🚀 JobHax Chrome Extension Installation Script"
echo "=============================================="

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null && ! command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome &> /dev/null; then
    echo "❌ Chrome not found. Please install Google Chrome first."
    exit 1
fi

echo "✅ Chrome found"

# Check if extension directory exists
if [ ! -d "browser-extension" ]; then
    echo "❌ Browser extension directory not found"
    exit 1
fi

echo "✅ Extension directory found"

# Check if required files exist
required_files=("manifest.json" "popup.html" "popup.js" "content.js" "background.js" "icon.svg")
for file in "${required_files[@]}"; do
    if [ ! -f "browser-extension/$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

echo "✅ All required files present"

# Validate manifest.json
if ! python3 -m json.tool browser-extension/manifest.json > /dev/null 2>&1; then
    echo "❌ Invalid manifest.json"
    exit 1
fi

echo "✅ Manifest.json is valid"

echo ""
echo "📋 Installation Instructions:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this directory: $(pwd)/browser-extension"
echo "5. The extension should now appear in your extensions list"
echo ""
echo "🔧 Required Services:"
echo "Make sure these are running:"
echo "- Agent Server: http://localhost:8080"
echo "- Monitoring UI: http://localhost:3001"
echo "- WebSocket Server: ws://localhost:8081"
echo ""
echo "🧪 Test the extension:"
echo "1. Open: file://$(pwd)/browser-extension/test_extension.html"
echo "2. Click the JobHax extension icon"
echo "3. Click '🚀 Auto Apply'"
echo "4. Watch the monitoring dashboard at http://localhost:3001"
echo ""
echo "✅ Extension is ready to install!"
