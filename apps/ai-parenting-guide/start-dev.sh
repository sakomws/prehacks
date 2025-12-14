#!/bin/bash

# AI Parenting Guide Platform - Development Startup Script

echo "🚀 Starting AI Parenting Guide Platform Development Environment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example"
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration before continuing."
    echo "   Especially set your GOOGLE_AI_API_KEY for Gemini integration."
    read -p "Press Enter to continue after updating .env file..."
fi

# Start PostgreSQL and Redis
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
if docker-compose ps postgres | grep -q "healthy"; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

if docker-compose ps redis | grep -q "healthy"; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis failed to start"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/.venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start development servers
echo "🌐 Starting development servers..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:8000"
echo "API Documentation will be available at: http://localhost:8000/docs"

# Start both frontend and backend
npm run dev