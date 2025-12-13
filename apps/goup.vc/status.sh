#!/bin/bash

echo "🚀 Goup.vc Event Management Platform - Status Check"
echo "=================================================="

# Check backend
echo "🔧 Backend API (FastAPI):"
if curl -s http://localhost:8001/health > /dev/null; then
    echo "  ✅ Running on http://localhost:8001"
    echo "  📊 Health: $(curl -s http://localhost:8001/health | jq -r '.status')"
else
    echo "  ❌ Not running"
fi

# Check frontend
echo ""
echo "🎨 Frontend (Next.js):"
if curl -s http://localhost:3000 > /dev/null; then
    echo "  ✅ Running on http://localhost:3000"
else
    echo "  ❌ Not running"
fi

# API endpoints
echo ""
echo "🔗 Available API Endpoints:"
echo "  • GET  http://localhost:8001/health"
echo "  • GET  http://localhost:8001/api/v1/events"
echo "  • GET  http://localhost:8001/api/v1/calendars"
echo "  • Docs http://localhost:8001/docs"

echo ""
echo "🌐 Access Points:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:8001"
echo "  • API Docs:  http://localhost:8001/docs"

echo ""
echo "📝 Sample API Test:"
echo "curl http://localhost:8001/api/v1/events"