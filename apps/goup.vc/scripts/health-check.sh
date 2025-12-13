#!/bin/bash

# Health check script for Event Management Platform

echo "🔍 Checking Event Management Platform health..."

# Check if backend is running
echo "Checking backend health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
fi

# Check if frontend is running
echo "Checking frontend health..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
fi

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running"
fi

# Check if Redis is running
echo "Checking Redis..."
if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running"
fi

echo "🏁 Health check complete!"