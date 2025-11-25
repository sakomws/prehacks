#!/bin/bash

# MentorMap EC2 Deployment Script
# Usage: ./deploy-ec2.sh

set -e

echo "🚀 Starting MentorMap deployment on EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Ubuntu
if [ ! -f /etc/lsb-release ]; then
    echo -e "${RED}This script is designed for Ubuntu. Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}Step 2: Installing dependencies...${NC}"
sudo apt install -y python3.11 python3.11-venv python3-pip git nginx

# Install Node.js 18+
if ! command -v node &> /dev/null || [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]; then
    echo -e "${YELLOW}Installing Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
fi

echo -e "${GREEN}Step 3: Setting up backend...${NC}"
cd backend

# Create virtual environment
python3.11 -m venv venv
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
