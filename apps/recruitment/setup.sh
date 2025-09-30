#!/bin/bash

# Recruitment Automation Suite Setup Script
echo "🚀 Setting up Recruitment Automation Suite..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.11+ required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Chrome extension dependencies
echo "📦 Installing Chrome extension dependencies..."
cd chrome_extension
if [ -f "package.json" ]; then
    npm install
else
    echo "⚠️  No package.json found in chrome_extension/"
fi
cd ..

# Install JHV5 dependencies
echo "📦 Installing JHV5 dependencies..."
cd jhv5
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi
cd ..

# Install JobHax dependencies
echo "📦 Installing JobHax dependencies..."
cd jobhax
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi
cd ..

# Create environment file
echo "⚙️  Creating environment file..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# API Keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Browser Settings
HEADLESS=false
BROWSER_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
EOF
    echo "📝 Created .env file. Please update with your API keys."
fi

# Create logs directory
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Choose your preferred tool:"
echo "   - JobHax: cd jobhax && python -m uvicorn web_ui.app:app --reload"
echo "   - Chrome Extension: Load chrome_extension/ in Chrome"
echo "   - Browser Automation: cd browser_automation && python job_application_automation.py"
echo "   - JHV5: cd jhv5 && python start_integrated_system.py"
echo ""
echo "📚 Documentation: ./docs/"
echo "🐛 Issues: Check logs/ directory for troubleshooting"
