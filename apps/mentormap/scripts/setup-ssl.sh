#!/bin/bash

# SSL Setup Script for MentorMap on Amazon Linux
# This script installs certbot and obtains SSL certificates

set -e

echo "🔒 Setting up SSL certificates for mentormap.ai..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo: sudo ./setup-ssl.sh${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Installing EPEL repository...${NC}"
yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm || \
yum install -y epel-release

echo -e "${GREEN}Step 2: Installing certbot...${NC}"
yum install -y certbot python3-certbot-nginx

echo -e "${GREEN}Step 3: Creating directory for Let's Encrypt challenges...${NC}"
mkdir -p /var/www/certbot
chown -R nginx:nginx /var/www/certbot

echo -e "${GREEN}Step 4: Testing Nginx configuration...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}Nginx configuration test failed. Please fix errors before continuing.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 5: Reloading Nginx...${NC}"
systemctl reload nginx

echo -e "${YELLOW}Step 6: Obtaining SSL certificates...${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Make sure your DNS records are pointing to this server!${NC}"
echo ""
echo "Verify DNS before continuing:"
echo "  dig mentormap.ai"
echo "  dig www.mentormap.ai"
echo "  dig api.mentormap.ai"
echo ""
read -p "Press Enter to continue with certificate generation, or Ctrl+C to cancel..."

# Obtain certificates
certbot --nginx \
    -d mentormap.ai \
    -d www.mentormap.ai \
    -d api.mentormap.ai \
    --non-interactive \
    --agree-tos \
    --redirect \
    --email admin@mentormap.ai

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificates obtained successfully!${NC}"
    
    # Test auto-renewal
    echo -e "${GREEN}Step 7: Testing certificate auto-renewal...${NC}"
    certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Auto-renewal test passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Auto-renewal test failed. Check certbot configuration.${NC}"
    fi
    
    # Set up auto-renewal cron job
    echo -e "${GREEN}Step 8: Setting up auto-renewal cron job...${NC}"
    
    # Check if cron job already exists
    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
        echo -e "${GREEN}✅ Auto-renewal cron job added${NC}"
    else
        echo -e "${YELLOW}Auto-renewal cron job already exists${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 SSL setup complete!${NC}"
    echo ""
    echo "Your site is now secured with HTTPS:"
    echo "  - https://mentormap.ai"
    echo "  - https://www.mentormap.ai"
    echo "  - https://api.mentormap.ai"
    echo ""
    echo "Certificates will auto-renew every 60 days."
    echo ""
    echo "Next steps:"
    echo "  1. Update LinkedIn OAuth redirect URI to: https://api.mentormap.ai/api/auth/linkedin/callback"
    echo "  2. Update backend/.env LINKEDIN_REDIRECT_URI"
    echo "  3. Restart backend: pm2 restart mentormap-backend"
    echo "  4. Test your site: https://mentormap.ai"
    
else
    echo -e "${RED}❌ Failed to obtain SSL certificates${NC}"
    echo ""
    echo "Common issues:"
    echo "  1. DNS not pointing to this server"
    echo "  2. Firewall blocking ports 80/443"
    echo "  3. Nginx not running"
    echo "  4. Domain not accessible from internet"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check DNS: dig mentormap.ai"
    echo "  - Check Nginx: systemctl status nginx"
    echo "  - Check firewall: sudo iptables -L"
    echo "  - Check security groups in AWS console"
    exit 1
fi
