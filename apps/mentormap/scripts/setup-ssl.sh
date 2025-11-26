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

echo -e "${GREEN}Step 1: Detecting OS and installing certbot...${NC}"

# Detect Amazon Linux version
if [ -f /etc/system-release ]; then
    if grep -q "Amazon Linux release 2023" /etc/system-release; then
        echo "Detected Amazon Linux 2023"
        # Amazon Linux 2023 uses dnf and has certbot in default repos
        dnf install -y certbot python3-certbot-nginx
    elif grep -q "Amazon Linux 2" /etc/system-release; then
        echo "Detected Amazon Linux 2"
        # Amazon Linux 2 needs EPEL
        amazon-linux-extras install epel -y
        yum install -y certbot python3-certbot-nginx
    else
        echo "Detected other Amazon Linux version"
        yum install -y certbot python3-certbot-nginx
    fi
else
    echo "Not Amazon Linux, attempting standard installation"
    yum install -y certbot python3-certbot-nginx || \
    dnf install -y certbot python3-certbot-nginx || \
    apt-get install -y certbot python3-certbot-nginx
fi

echo -e "${GREEN}Step 2: Creating directory for Let's Encrypt challenges...${NC}"
mkdir -p /var/www/certbot
chown -R nginx:nginx /var/www/certbot

echo -e "${GREEN}Step 3: Testing Nginx configuration...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}Nginx configuration test failed. Please fix errors before continuing.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 4: Reloading Nginx...${NC}"
systemctl reload nginx

echo -e "${YELLOW}Step 5: Obtaining SSL certificates...${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Make sure your DNS records are pointing to this server!${NC}"
echo ""
echo "Verify DNS before continuing:"
echo "  dig mentormap.ai"
echo "  dig www.mentormap.ai"
echo "  dig api.mentormap.ai"
echo ""
read -p "Press Enter to continue with certificate generation, or Ctrl+C to cancel..."

# Obtain certificates (certonly mode - we'll configure Nginx manually)
certbot certonly --nginx \
    -d mentormap.ai \
    -d www.mentormap.ai \
    -d api.mentormap.ai \
    --non-interactive \
    --agree-tos \
    --email admin@mentormap.ai

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificates obtained successfully!${NC}"
    
    # Configure Nginx with SSL
    echo -e "${GREEN}Step 6: Configuring Nginx with SSL certificates...${NC}"
    
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    if [ -f "$SCRIPT_DIR/configure-ssl.sh" ]; then
        bash "$SCRIPT_DIR/configure-ssl.sh"
    else
        echo -e "${YELLOW}⚠️  configure-ssl.sh not found. Configuring manually...${NC}"
        
        # Uncomment SSL lines in Nginx config
        sed -i 's|# ssl_certificate /etc/letsencrypt/live/mentormap.ai/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/mentormap.ai/fullchain.pem;|g' /etc/nginx/conf.d/mentormap.conf
        sed -i 's|# ssl_certificate_key /etc/letsencrypt/live/mentormap.ai/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/mentormap.ai/privkey.pem;|g' /etc/nginx/conf.d/mentormap.conf
        sed -i 's|# include /etc/letsencrypt/options-ssl-nginx.conf;|include /etc/letsencrypt/options-ssl-nginx.conf;|g' /etc/nginx/conf.d/mentormap.conf
        sed -i 's|# ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;|ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;|g' /etc/nginx/conf.d/mentormap.conf
        
        nginx -t && systemctl reload nginx
    fi
    
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
    
    # Install cronie if not present
    if ! command -v crontab &> /dev/null; then
        echo -e "${YELLOW}Installing cronie...${NC}"
        dnf install -y cronie || yum install -y cronie || apt-get install -y cron
        systemctl enable crond
        systemctl start crond
    fi
    
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
