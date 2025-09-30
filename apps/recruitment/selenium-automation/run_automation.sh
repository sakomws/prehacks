#!/bin/bash

# JobHax Browser Automation Runner
# This script sets up and runs the job application automation

echo "🎯 JobHax Browser Automation"
echo "=============================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is required but not installed."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "job_application_automation.py" ]; then
    echo "❌ Please run this script from the browser_automation directory"
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
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env_example.txt .env
    echo "📝 Please edit .env file and add your API key"
    echo "   You can get a free API key from:"
    echo "   - Google Gemini: https://aistudio.google.com/"
    echo "   - Groq: https://console.groq.com/"
    echo ""
    read -p "Press Enter after you've added your API key to .env..."
fi

# Check if API key is set
if ! grep -q "your_.*_api_key_here" .env; then
    echo "✅ API key found in .env file"
else
    echo "❌ Please add your API key to .env file"
    exit 1
fi

echo "🚀 Starting job application automation..."
echo ""

# Run the automation
if [ $# -eq 0 ]; then
    python job_application_automation.py
else
    python job_application_automation.py "$1"
fi

echo ""
echo "✅ Automation completed!"
