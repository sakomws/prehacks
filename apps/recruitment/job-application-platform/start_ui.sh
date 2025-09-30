#!/bin/bash

echo "🚀 Starting JobHax Web UI..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "web_ui/app.py" ]; then
    echo "❌ Error: Please run this script from the jobhax directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install -r web_ui/requirements.txt

echo "🌐 Starting web server..."
echo "📱 Open your browser to: http://localhost:5001"
echo "🎯 Click the 'Apply' button on any job card to start the application process"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd web_ui
python app.py

