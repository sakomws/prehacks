#!/bin/bash

# Install Nginx Configuration for MentorMap
# This script copies the Nginx config and installs SSL certificates

set -e

echo "📝 Installing Nginx configuration for mentormap.ai..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo: sudo ./install-nginx-config.sh${NC}"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}Step 1: Backing up existing Nginx config (if any)...${NC}"
if [ -f /etc/nginx/conf.d/mentormap.conf ]; then
    cp /etc/nginx/conf.d/mentormap.conf /etc/nginx/conf.d/mentormap.conf.backup-$(date +%Y%m%d-%H%M%S)
    echo -e "${YELLOW}Existing config backed up${NC}"
fi

echo -e "${GREEN}Step 2: Copying Nginx configuration...${NC}"
cp "$SCRIPT_DIR/nginx-mentormap.conf" /etc/nginx/conf.d/mentormap.conf

echo -e "${GREEN}Step 3: Testing Nginx configuration...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}Nginx configuration test failed!${NC}"
    echo "Restoring backup..."
    if [ -f /etc/nginx/conf.d/mentormap.conf.backup-* ]; then
        mv /etc/nginx/conf.d/mentormap.conf.backup-* /etc/nginx/conf.d/mentormap.conf
    fi
    exit 1
fi

echo -e "${GREEN}Step 4: Reloading Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✅ Nginx configuration installed successfully!${NC}"
echo ""

# Check if SSL certificates exist
if [ -d /etc/letsencrypt/live/mentormap.ai ]; then
    echo -e "${GREEN}Step 5: Installing SSL certificates in Nginx config...${NC}"
    
    # Update Nginx config to use SSL certificates
    sed -i 's|# ssl_certificate /etc/letsencrypt|ssl_certificate /etc/letsencrypt|g' /etc/nginx/conf.d/mentormap.conf
    sed -i 's|# include /etc/letsencrypt|include /etc/letsencrypt|g' /etc/nginx/conf.d/mentormap.conf
    
    echo -e "${GREEN}Testing Nginx configuration with SSL...${NC}"
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Reloading Nginx with SSL configuration...${NC}"
        systemctl reload nginx
        echo -e "${GREEN}✅ SSL certificates installed in Nginx!${NC}"
    else
        echo -e "${RED}SSL configuration test failed. Reverting...${NC}"
        cp "$SCRIPT_DIR/nginx-mentormap.conf" /etc/nginx/conf.d/mentormap.conf
        systemctl reload nginx
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  SSL certificates not found at /etc/letsencrypt/live/mentormap.ai${NC}"
    echo ""
    echo "To install SSL certificates, run:"
    echo "  sudo certbot --nginx -d mentormap.ai -d www.mentormap.ai -d api.mentormap.ai"
    echo ""
    echo "Or use the setup-ssl.sh script:"
    echo "  sudo ./setup-ssl.sh"
fi

echo ""
echo "🎉 Configuration complete!"
echo ""
echo "Your Nginx is now configured for:"
echo "  - Frontend: http://mentormap.ai → http://localhost:3000"
echo "  - Backend: http://api.mentormap.ai → http://localhost:8000"
echo ""
if [ -d /etc/letsencrypt/live/mentormap.ai ]; then
    echo "HTTPS is enabled:"
    echo "  - https://mentormap.ai"
    echo "  - https://api.mentormap.ai"
fi
