#!/bin/bash

echo "🐕 Starting Dog Angelenos Backend..."
echo ""

# Check if PostgreSQL is running
if ! docker ps | grep -q dogangelenos-db; then
    echo "🐘 Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Check if database is initialized
if [ ! -f ".db_initialized" ]; then
    echo "🗄️  Initializing database..."
    python init_db.py
    touch .db_initialized
fi

# Start the API
echo "🚀 Starting FastAPI server..."
python main.py
