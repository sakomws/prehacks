#!/bin/bash

# MentorMap EC2 Deployment Script for Amazon Linux
# Usage: ./deploy-ec2.sh

set -e

echo "🚀 Starting MentorMap deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo -e "${YELLOW}Detected macOS - Running in local development mode${NC}"
elif [ -f /etc/system-release ] && grep -q "Amazon Linux" /etc/system-release; then
    OS="amazon-linux"
    echo -e "${GREEN}Detected Amazon Linux${NC}"
elif [ -f /etc/os-release ] && grep -q "Ubuntu" /etc/os-release; then
    OS="ubuntu"
    echo -e "${GREEN}Detected Ubuntu${NC}"
else
    echo -e "${YELLOW}Warning: Unknown OS, attempting to continue...${NC}"
fi

# Update system packages based on OS
if [ "$OS" == "amazon-linux" ]; then
    echo -e "${GREEN}Step 1: Updating system packages...${NC}"
    sudo yum update -y
elif [ "$OS" == "ubuntu" ]; then
    echo -e "${GREEN}Step 1: Updating system packages...${NC}"
    sudo apt-get update -y
elif [ "$OS" == "macos" ]; then
    echo -e "${GREEN}Step 1: Checking Homebrew...${NC}"
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}Homebrew not found. Please install it from https://brew.sh${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Skipping system package update${NC}"
fi

echo -e "${GREEN}Step 2: Installing dependencies...${NC}"

# Install dependencies based on OS
if [ "$OS" == "amazon-linux" ]; then
    sudo yum install -y python3.11 python3.11-pip git nginx
elif [ "$OS" == "ubuntu" ]; then
    sudo apt-get install -y python3.11 python3.11-pip git nginx
elif [ "$OS" == "macos" ]; then
    echo -e "${YELLOW}Checking Python 3...${NC}"
    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}Installing Python 3...${NC}"
        brew install python@3.11
    fi
    echo -e "${GREEN}Python 3 is installed${NC}"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

echo -e "${GREEN}Step 3: Setting up backend...${NC}"
cd backend

# Create virtual environment
if [ "$OS" == "macos" ]; then
    python3 -m venv venv
else
    python3.11 -m venv venv
fi
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    SECRET_KEY=$(openssl rand -hex 32)
    cat > .env << EOF
DATABASE_URL=sqlite:///./mentormap.db
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/auth/linkedin/callback
EOF
    echo -e "${YELLOW}⚠️  Please update .env with your actual credentials${NC}"
fi

# Initialize database
if [ ! -f mentormap.db ]; then
    echo -e "${GREEN}Initializing database...${NC}"
    python init_db.py
fi

echo -e "${GREEN}Step 4: Setting up frontend...${NC}"
cd ../frontend

# Install Node dependencies
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
fi

# Build frontend
echo -e "${GREEN}Building frontend...${NC}"
npm run build

echo -e "${GREEN}Step 5: Starting services with PM2...${NC}"
cd ..

# Stop existing processes if any
pm2 delete mentormap-backend 2>/dev/null || true
pm2 delete mentormap-frontend 2>/dev/null || true

# Start backend
cd backend
pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name mentormap-backend

# Start frontend
cd ../frontend
pm2 start npm --name mentormap-frontend -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup
echo -e "${YELLOW}Setting up PM2 to start on boot...${NC}"
pm2 startup | tail -n 1 | sudo bash

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "Management commands:"
echo "  - View logs: pm2 logs"
echo "  - Restart: pm2 restart all"
echo "  - Status: pm2 status"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "  1. Update backend/.env with your credentials"
echo "  2. Configure security groups (ports 80, 443, 3000, 8000)"
echo "  3. Set up Nginx for production (see EC2_DEPLOYMENT.md)"
echo "  4. Configure SSL with Let's Encrypt"
