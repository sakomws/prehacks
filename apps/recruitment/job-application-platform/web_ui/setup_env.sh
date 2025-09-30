#!/bin/bash

# JobHax Web UI Environment Setup
echo "🚀 Setting up JobHax Web UI environment..."

# Create .env file from template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env_template.txt .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_actual_openai_api_key_here"
    echo ""
    echo "   You can get your API key from: https://platform.openai.com/api-keys"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install required packages
echo "📦 Installing required packages..."
pip install python-dotenv openai beautifulsoup4

echo "🎉 Setup complete! Now you can run the JobHax Web UI with LLM support."
echo "   Run: python app.py"
