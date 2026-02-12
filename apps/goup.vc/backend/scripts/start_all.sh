#!/bin/bash

# Master script to start all agents and the gateway

echo "=========================================="
echo "Starting Goup.VC Services"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Start Inbox Agent - Port 8001
cd inbox && python3 inbox_agent.py > /dev/null 2>&1 &
INBOX_PID=$!
echo "✓ Inbox Agent started on port 8001 (PID: $INBOX_PID)"

# Start Event Agent - Port 8002
cd ../event && python3 event_agent.py > /dev/null 2>&1 &
EVENT_PID=$!
echo "✓ Event Agent started on port 8002 (PID: $EVENT_PID)"

# Start Hackathon Agent - Port 8003
cd ../hackathon && python3 hackathon_agent.py > /dev/null 2>&1 &
HACKATHON_PID=$!
echo "✓ Hackathon Agent started on port 8003 (PID: $HACKATHON_PID)"

# Start Community Agent - Port 8004
cd ../community && python3 community_agent.py > /dev/null 2>&1 &
COMMUNITY_PID=$!
echo "✓ Community Agent started on port 8004 (PID: $COMMUNITY_PID)"

# Start Calendar Agent - Port 8005
cd ../calendar && python3 calendar_agent.py > /dev/null 2>&1 &
CALENDAR_PID=$!
echo "✓ Calendar Agent started on port 8005 (PID: $CALENDAR_PID)"

# Wait for agents to initialize
echo ""
echo "Waiting for agents to initialize..."
sleep 5

# Start Gateway - Port 8080
cd ../gateway && python3 gateway.py > /dev/null 2>&1 &
GATEWAY_PID=$!
echo "✓ API Gateway started on port 8080 (PID: $GATEWAY_PID)"

echo ""
echo "=========================================="
echo "All services are running!"
echo "=========================================="
echo ""
echo "Agents:"
echo "  - Inbox Agent:     http://localhost:8001"
echo "  - Event Agent:     http://localhost:8002"
echo "  - Hackathon Agent: http://localhost:8003"
echo "  - Community Agent: http://localhost:8004"
echo "  - Calendar Agent:  http://localhost:8005"
echo ""
echo "API Gateway:"
echo "  - Gateway:        http://localhost:8080"
echo "  - Health Check:   http://localhost:8080/"
echo "  - Dashboard:      http://localhost:8080/users/1/dashboard"
echo ""
echo "Process IDs:"
echo "  - Inbox: $INBOX_PID"
echo "  - Event: $EVENT_PID"
echo "  - Hackathon: $HACKATHON_PID"
echo "  - Community: $COMMUNITY_PID"
echo "  - Calendar: $CALENDAR_PID"
echo "  - Gateway: $GATEWAY_PID"
echo ""
echo "To stop all services, run:"
echo "  kill $INBOX_PID $EVENT_PID $HACKATHON_PID $COMMUNITY_PID $CALENDAR_PID $GATEWAY_PID"
echo ""
echo "Press Ctrl+C to exit (services will continue running in background)"

# Keep script running
wait
