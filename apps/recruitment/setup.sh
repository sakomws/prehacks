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

# Install Browser extension dependencies
echo "📦 Installing Browser extension dependencies..."
cd browser-extension
if [ -f "package.json" ]; then
    npm install
else
    echo "⚠️  No package.json found in browser-extension/"
fi
cd ..

# Install Autonomous Job Agent dependencies
echo "📦 Installing Autonomous Job Agent dependencies..."
cd autonomous-job-agent
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi
cd ..

# Install Job Application Platform dependencies
echo "📦 Installing Job Application Platform dependencies..."
cd job-application-platform
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
echo "   - Job Application Platform: cd job-application-platform && python -m uvicorn web_ui.app:app --reload"
echo "   - Browser Extension: Load browser-extension/ in Chrome"
echo "   - Selenium Automation: cd selenium-automation && python job_application_automation.py"
echo "   - Autonomous Job Agent: cd autonomous-job-agent && python start_integrated_system.py"
echo ""
echo "📚 Documentation: ./docs/"
echo "🐛 Issues: Check logs/ directory for troubleshooting"
