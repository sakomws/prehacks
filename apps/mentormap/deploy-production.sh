#!/bin/bash

# MentorMap Production Deployment Script for mentormap.ai
# Usage: ./deploy-production.sh

set -e

echo "🚀 Starting MentorMap production deployment for mentormap.ai..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as ec2-user
if [ "$USER" != "ec2-user" ]; then
    echo -e "${YELLOW}Warning: This script is designed to run as ec2-user${NC}"
fi

echo -e "${GREEN}Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${GREEN}Step 2: Updating backend...${NC}"
cd backend

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Restart backend
pm2 restart mentormap-backend || pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name mentormap-backend

echo -e "${GREEN}Step 3: Updating frontend...${NC}"
cd ../frontend

# Install/update dependencies
npm install

# Build with production environment
NODE_ENV=production npm run build

# Restart frontend
pm2 restart mentormap-frontend || pm2 start npm --name mentormap-frontend -- start

echo -e "${GREEN}Step 4: Configuring Nginx...${NC}"
cd ..

# Copy Nginx configuration if not already present
if [ ! -f /etc/nginx/conf.d/mentormap.conf ]; then
    echo -e "${YELLOW}Installing Nginx configuration...${NC}"
    sudo cp nginx-mentormap.conf /etc/nginx/conf.d/mentormap.conf
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    echo -e "${GREEN}✓ Nginx configuration installed${NC}"
else
    echo -e "${YELLOW}Nginx configuration already exists. Skipping...${NC}"
    echo -e "${YELLOW}To update, run: sudo cp nginx-mentormap.conf /etc/nginx/conf.d/mentormap.conf && sudo nginx -t && sudo systemctl reload nginx${NC}"
fi

echo -e "${GREEN}Step 5: Setting up SSL (if not already configured)...${NC}"

# Check if SSL certificates exist
if [ ! -d /etc/letsencrypt/live/mentormap.ai ]; then
    echo -e "${YELLOW}SSL certificates not found. Setting up Let's Encrypt...${NC}"
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo -e "${YELLOW}Installing certbot...${NC}"
        sudo yum install -y certbot python3-certbot-nginx
    fi
    
    # Create directory for Let's Encrypt challenges
    sudo mkdir -p /var/www/certbot
    
    echo -e "${YELLOW}Please run the following command to obtain SSL certificates:${NC}"
    echo -e "${GREEN}sudo certbot --nginx -d mentormap.ai -d www.mentormap.ai -d api.mentormap.ai${NC}"
    echo ""
    echo -e "${YELLOW}Make sure your DNS records are pointing to this server before running certbot!${NC}"
else
    echo -e "${GREEN}✓ SSL certificates already configured${NC}"
fi

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Production deployment complete!${NC}"
echo ""
echo "Services:"
echo "  - Frontend: https://mentormap.ai"
echo "  - Backend API: https://api.mentormap.ai"
echo "  - API Docs: https://api.mentormap.ai/docs"
echo ""
echo "Management commands:"
echo "  - View logs: pm2 logs"
echo "  - Restart all: pm2 restart all"
echo "  - Status: pm2 status"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Verify DNS records point to this server"
echo "  2. Run certbot to obtain SSL certificates (if not done)"
echo "  3. Update LinkedIn OAuth redirect URI to: https://api.mentormap.ai/api/auth/linkedin/callback"
echo "  4. Test the application at https://mentormap.ai"
echo ""
echo -e "${GREEN}🎉 MentorMap is live at https://mentormap.ai${NC}"
