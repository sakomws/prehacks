#!/bin/bash

# Start Dog Angelenos Development Servers

echo "🐕 Starting Dog Angelenos Development Environment..."
echo ""

# Start Backend
echo "🐍 Starting Python Backend (port 8000)..."
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt -q
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start Frontend
echo "⚛️  Starting Next.js Frontend (port 3004)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo ""
echo "📱 Frontend: http://localhost:3004"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
