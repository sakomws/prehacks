#!/bin/bash

echo "🚀 Starting MentorMap Application..."
echo ""

# Kill any processes using ports 3000 and 8000
echo "🔍 Checking for processes on ports 3000 and 8000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 3000" || echo "✓ Port 3000 is free"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 8000" || echo "✓ Port 8000 is free"
echo ""

# Start backend
echo "🐍 Starting Backend (port 8000)..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
# Skip pip install if already installed (to avoid Python 3.13 compatibility issues)
if [ ! -f "venv/.installed" ]; then
    echo "Installing Python dependencies..."
    pip install -q -r requirements.txt && touch venv/.installed
fi

# Check if database exists, if not initialize it
if [ ! -f "mentormap.db" ]; then
    echo "📊 Initializing database..."
    python init_db.py
fi

# Start backend in background
uvicorn main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) - Logs: backend.log"
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo ""
echo "⚛️  Starting Frontend (port 3000)..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start frontend in background
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) - Logs: frontend.log"
cd ..

echo ""
echo "✨ MentorMap is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop: ./stop.sh or kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
