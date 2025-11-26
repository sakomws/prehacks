#!/bin/bash

# Fix port conflict - Stop processes using ports 8000 and 3000

echo "🔍 Checking for processes using ports 8000 and 3000..."

# Check port 8000
PORT_8000=$(lsof -ti:8000)
if [ ! -z "$PORT_8000" ]; then
    echo "Found process on port 8000: $PORT_8000"
    echo "Killing process..."
    kill -9 $PORT_8000
    echo "✓ Port 8000 freed"
else
    echo "✓ Port 8000 is free"
fi

# Check port 3000
PORT_3000=$(lsof -ti:3000)
if [ ! -z "$PORT_3000" ]; then
    echo "Found process on port 3000: $PORT_3000"
    echo "Killing process..."
    kill -9 $PORT_3000
    echo "✓ Port 3000 freed"
else
    echo "✓ Port 3000 is free"
fi

# Stop PM2 processes if they exist
echo ""
echo "🛑 Stopping PM2 processes..."
pm2 stop all 2>/dev/null || echo "No PM2 processes to stop"
pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"

echo ""
echo "✅ All ports cleared. You can now start the services."
echo ""
echo "To start services:"
echo "  cd backend && pm2 start 'venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000' --name mentormap-backend"
echo "  cd frontend && pm2 start npm --name mentormap-frontend -- start"
