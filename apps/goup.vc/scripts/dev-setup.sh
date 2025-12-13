#!/bin/bash

# Event Management Platform Development Setup Script

echo "🚀 Setting up Event Management Platform development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env backend/.env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/eventmanagement
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production" > backend/.env
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend/.env.local file..."
    cp frontend/.env.local frontend/.env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret" > frontend/.env.local
fi

# Start the services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
if docker-compose ps | grep -q "Up (healthy)"; then
    echo "✅ Services are ready!"
else
    echo "⚠️  Services may still be starting up. Check with 'docker-compose ps'"
fi

echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload"
echo "2. Start the frontend: cd frontend && npm install && npm run dev"
echo "3. Or use Docker: docker-compose up"
echo ""
echo "Access points:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"