#!/bin/bash

# Script to run the API Gateway
# Make sure all agents are running before starting the gateway

echo "Starting API Gateway..."
echo "Make sure all agents are running on their respective ports:"
echo "  - Inbox Agent:     http://localhost:8001"
echo "  - Event Agent:     http://localhost:8002"
echo "  - Hackathon Agent: http://localhost:8003"
echo "  - Community Agent: http://localhost:8004"
echo "  - Calendar Agent:  http://localhost:8005"
echo ""
echo "Gateway will run on: http://localhost:8080"
echo ""

cd "$(dirname "$0")/gateway" && python3 gateway.py

