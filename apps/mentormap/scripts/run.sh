#!/bin/bash

# MentorMap Run Script
# Start, stop, restart, or check services
# Usage: ./run.sh [start|stop|restart|status|logs|update]

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ACTION=${1:-status}

# ============================================================================
# Helper Functions
# ============================================================================

fix_ports() {
    echo -e "${YELLOW}Fixing port conflicts...${NC}"
    
    # Kill processes on port 8000
    PORT_8000=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$PORT_8000" ]; then
        echo "Killing process on port 8000: $PORT_8000"
        kill -9 $PORT_8000 2>/dev/null || sudo kill -9 $PORT_8000
    fi
    
    # Kill processes on port 3000
    PORT_3000=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$PORT_3000" ]; then
        echo "Killing process on port 3000: $PORT_3000"
        kill -9 $PORT_3000 2>/dev/null || sudo kill -9 $PORT_3000
    fi
    
    echo -e "${GREEN}✓ Ports cleared${NC}"
}

start_services() {
    echo -e "${GREEN}Starting MentorMap services...${NC}"
    
    # Fix any port conflicts first
    fix_ports
    
    # Stop existing PM2 processes
    pm2 delete mentormap-backend 2>/dev/null || true
    pm2 delete mentormap-frontend 2>/dev/null || true
    
    # Get the project root directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    # Start backend
    echo -e "${BLUE}Starting backend...${NC}"
    cd "$PROJECT_ROOT/backend"
    pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name mentormap-backend
    
    # Start frontend
    echo -e "${BLUE}Starting frontend...${NC}"
    cd "$PROJECT_ROOT/frontend"
    pm2 start npm --name mentormap-frontend -- start
    
    # Save PM2 config
    pm2 save
    
    echo ""
    echo -e "${GREEN}✅ Services started${NC}"
    echo ""
    pm2 status
}

stop_services() {
    echo -e "${YELLOW}Stopping MentorMap services...${NC}"
    
    pm2 stop mentormap-backend 2>/dev/null || true
    pm2 stop mentormap-frontend 2>/dev/null || true
    
    echo -e "${GREEN}✓ Services stopped${NC}"
    pm2 status
}

restart_services() {
    echo -e "${BLUE}Restarting MentorMap services...${NC}"
    
    pm2 restart mentormap-backend 2>/dev/null || start_services
    pm2 restart mentormap-frontend 2>/dev/null || start_services
    
    echo ""
    echo -e "${GREEN}✅ Services restarted${NC}"
    echo ""
    pm2 status
}

show_status() {
    echo -e "${BLUE}MentorMap Services Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # PM2 Status
    echo "PM2 Processes:"
    pm2 status
    echo ""
    
    # Port Status
    echo "Port Status:"
    PORT_3000=$(lsof -ti:3000 2>/dev/null)
    PORT_8000=$(lsof -ti:8000 2>/dev/null)
    
    if [ ! -z "$PORT_3000" ]; then
        echo -e "  ${GREEN}✓ Port 3000 (Frontend) - Active${NC}"
    else
        echo -e "  ${RED}✗ Port 3000 (Frontend) - Not running${NC}"
    fi
    
    if [ ! -z "$PORT_8000" ]; then
        echo -e "  ${GREEN}✓ Port 8000 (Backend) - Active${NC}"
    else
        echo -e "  ${RED}✗ Port 8000 (Backend) - Not running${NC}"
    fi
    echo ""
    
    # Nginx Status (if not macOS)
    if [[ ! "$OSTYPE" == "darwin"* ]]; then
        echo "Nginx Status:"
        if systemctl is-active --quiet nginx 2>/dev/null; then
            echo -e "  ${GREEN}✓ Nginx is running${NC}"
        else
            echo -e "  ${RED}✗ Nginx is not running${NC}"
        fi
        echo ""
    fi
    
    # Test endpoints
    echo "Endpoint Tests:"
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Frontend responding (localhost:3000)${NC}"
    else
        echo -e "  ${RED}✗ Frontend not responding${NC}"
    fi
    
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Backend responding (localhost:8000)${NC}"
    else
        echo -e "  ${RED}✗ Backend not responding${NC}"
    fi
    echo ""
}

show_logs() {
    echo -e "${BLUE}Showing logs (Ctrl+C to exit)...${NC}"
    pm2 logs
}

update_app() {
    echo -e "${BLUE}Updating MentorMap...${NC}"
    
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    cd "$PROJECT_ROOT"
    
    # Pull latest code
    echo -e "${YELLOW}Pulling latest code...${NC}"
    git pull origin main || git pull
    
    # Update backend
    echo -e "${YELLOW}Updating backend...${NC}"
    cd backend
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    
    # Update frontend
    echo -e "${YELLOW}Updating frontend...${NC}"
    cd ../frontend
    npm install
    NODE_ENV=production npm run build
    
    # Restart services
    echo -e "${YELLOW}Restarting services...${NC}"
    pm2 restart all
    
    echo ""
    echo -e "${GREEN}✅ Update complete${NC}"
    echo ""
    pm2 status
}

show_help() {
    echo "MentorMap Run Script"
    echo ""
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  status   - Show service status (default)"
    echo "  logs     - Show service logs"
    echo "  update   - Pull latest code and restart"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run.sh start"
    echo "  ./run.sh restart"
    echo "  ./run.sh logs"
    echo ""
}

# ============================================================================
# Main Script
# ============================================================================

case $ACTION in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    update)
        update_app
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $ACTION${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
