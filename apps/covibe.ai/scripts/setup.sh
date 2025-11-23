#!/bin/bash

echo "🚀 Setting up Covibe.ai..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup backend
echo "🐍 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - please update with your API keys"
fi

if [ ! -f frontend/.env.local ]; then
    cp .env.example frontend/.env.local
    echo "✅ Created frontend/.env.local file"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys (OpenAI, Anthropic, etc.)"
echo "2. Start PostgreSQL and Redis (or use docker-compose up -d postgres redis)"
echo "3. Run 'npm run dev' in frontend/ directory"
echo "4. Run 'uvicorn app.main:app --reload' in backend/ directory"
echo ""
echo "Or use Docker: docker-compose up"
