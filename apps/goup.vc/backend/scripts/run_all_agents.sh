#!/bin/bash

# Script to run all agents independently
# Each agent runs on a different port

echo "Starting all agents..."

# Inbox Agent - Port 8001
cd inbox && python3 inbox_agent.py &
INBOX_PID=$!
echo "Inbox Agent started on port 8001 (PID: $INBOX_PID)"

# Event Agent - Port 8002
cd ../event && python3 event_agent.py &
EVENT_PID=$!
echo "Event Agent started on port 8002 (PID: $EVENT_PID)"

# Hackathon Agent - Port 8003
cd ../hackathon && python3 hackathon_agent.py &
HACKATHON_PID=$!
echo "Hackathon Agent started on port 8003 (PID: $HACKATHON_PID)"

# Community Agent - Port 8004
cd ../community && python3 community_agent.py &
COMMUNITY_PID=$!
echo "Community Agent started on port 8004 (PID: $COMMUNITY_PID)"

# Calendar Agent - Port 8005
cd ../calendar && python3 calendar_agent.py &
CALENDAR_PID=$!
echo "Calendar Agent started on port 8005 (PID: $CALENDAR_PID)"

echo ""
echo "All agents are running!"
echo "Inbox Agent:    http://localhost:8001"
echo "Event Agent:    http://localhost:8002"
echo "Hackathon Agent: http://localhost:8003"
echo "Community Agent: http://localhost:8004"
echo "Calendar Agent:  http://localhost:8005"
echo ""
echo "To start the API Gateway, run: ./run_gateway.sh"
echo "Gateway will be available at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all agents"

# Wait for all background processes
wait

