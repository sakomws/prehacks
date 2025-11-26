#!/bin/bash

# Configure SSL certificates in Nginx for MentorMap
# Run this AFTER obtaining SSL certificates with certbot

set -e

echo "🔒 Configuring SSL certificates in Nginx..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo: sudo ./configure-ssl.sh${NC}"
    exit 1
fi

# Check if certificates exist
if [ ! -d /etc/letsencrypt/live/mentormap.ai ]; then
    echo -e "${RED}SSL certificates not found!${NC}"
    echo ""
    echo "Please obtain certificates first by running:"
    echo "  sudo certbot certonly --nginx -d mentormap.ai -d www.mentormap.ai -d api.mentormap.ai"
    exit 1
fi

echo -e "${GREEN}✓ SSL certificates found${NC}"

# Backup current config
echo -e "${GREEN}Backing up current Nginx config...${NC}"
cp /etc/nginx/conf.d/mentormap.conf /etc/nginx/conf.d/mentormap.conf.backup-$(date +%Y%m%d-%H%M%S)

# Uncomment SSL certificate lines
echo -e "${GREEN}Enabling SSL in Nginx configuration...${NC}"

sed -i 's|# ssl_certificate /etc/letsencrypt/live/mentormap.ai/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/mentormap.ai/fullchain.pem;|g' /etc/nginx/conf.d/mentormap.conf
sed -i 's|# ssl_certificate_key /etc/letsencrypt/live/mentormap.ai/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/mentormap.ai/privkey.pem;|g' /etc/nginx/conf.d/mentormap.conf
sed -i 's|# include /etc/letsencrypt/options-ssl-nginx.conf;|include /etc/letsencrypt/options-ssl-nginx.conf;|g' /etc/nginx/conf.d/mentormap.conf
sed -i 's|# ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;|ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;|g' /etc/nginx/conf.d/mentormap.conf

# Also update api.mentormap.ai SSL lines
sed -i 's|# ssl_certificate /etc/letsencrypt/live/api.mentormap.ai/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/mentormap.ai/fullchain.pem;|g' /etc/nginx/conf.d/mentormap.conf
sed -i 's|# ssl_certificate_key /etc/letsencrypt/live/api.mentormap.ai/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/mentormap.ai/privkey.pem;|g' /etc/nginx/conf.d/mentormap.conf

echo -e "${GREEN}Testing Nginx configuration...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}Nginx configuration test failed!${NC}"
    echo "Restoring backup..."
    mv /etc/nginx/conf.d/mentormap.conf.backup-* /etc/nginx/conf.d/mentormap.conf
    exit 1
fi

echo -e "${GREEN}Reloading Nginx...${NC}"
systemctl reload nginx

echo ""
echo -e "${GREEN}✅ SSL configuration complete!${NC}"
echo ""
echo "Your site is now secured with HTTPS:"
echo "  - https://mentormap.ai"
echo "  - https://www.mentormap.ai"
echo "  - https://api.mentormap.ai"
echo ""
echo "Test your site:"
echo "  curl -I https://mentormap.ai"
echo "  curl -I https://api.mentormap.ai/health"
echo ""
echo "Next steps:"
echo "  1. Update LinkedIn OAuth redirect URI to: https://api.mentormap.ai/api/auth/linkedin/callback"
echo "  2. Update backend/.env LINKEDIN_REDIRECT_URI"
echo "  3. Restart backend: pm2 restart mentormap-backend"
echo "  4. Test the application at https://mentormap.ai"
