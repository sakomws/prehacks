#!/bin/bash

# MentorMap Installation Script
# One-time setup for EC2 deployment
# Usage: ./install.sh

set -e

echo "🚀 MentorMap Installation Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [ -f /etc/system-release ]; then
    if grep -q "Amazon Linux release 2023" /etc/system-release; then
        OS="amazon-linux-2023"
    elif grep -q "Amazon Linux 2" /etc/system-release; then
        OS="amazon-linux-2"
    fi
elif [ -f /etc/os-release ] && grep -q "Ubuntu" /etc/os-release; then
    OS="ubuntu"
fi

echo -e "${BLUE}Detected OS: $OS${NC}"
echo ""

# ============================================================================
# STEP 1: System Dependencies
# ============================================================================
echo -e "${GREEN}[1/7] Installing system dependencies...${NC}"

if [ "$OS" == "amazon-linux-2023" ]; then
    sudo dnf update -y
    sudo dnf install -y python3.11 python3.11-pip git nginx cronie
elif [ "$OS" == "amazon-linux-2" ]; then
    sudo yum update -y
    sudo yum install -y python3.11 python3.11-pip git nginx cronie
elif [ "$OS" == "ubuntu" ]; then
    sudo apt-get update -y
    sudo apt-get install -y python3.11 python3.11-pip git nginx cron
elif [ "$OS" == "macos" ]; then
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}Homebrew required. Install from https://brew.sh${NC}"
        exit 1
    fi
    brew install python@3.11 || true
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    if [ "$OS" == "macos" ]; then
        brew install node@18
    else
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs || sudo dnf install -y nodejs || sudo apt-get install -y nodejs
    fi
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
fi

echo -e "${GREEN}✓ System dependencies installed${NC}"
echo ""

# ============================================================================
# STEP 2: Backend Setup
# ============================================================================
echo -e "${GREEN}[2/7] Setting up backend...${NC}"

cd ../backend

# Create virtual environment
if [ "$OS" == "macos" ]; then
    python3 -m venv venv
else
    python3.11 -m venv venv
fi

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database if needed
if [ ! -f mentormap.db ]; then
    echo -e "${YELLOW}Initializing database...${NC}"
    python init_db.py || echo -e "${YELLOW}Database initialization skipped${NC}"
fi

deactivate

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# ============================================================================
# STEP 3: Frontend Setup
# ============================================================================
echo -e "${GREEN}[3/7] Setting up frontend...${NC}"

cd ../frontend

# Install dependencies
npm install

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
NODE_ENV=production npm run build

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# ============================================================================
# STEP 4: Nginx Configuration
# ============================================================================
echo -e "${GREEN}[4/7] Configuring Nginx...${NC}"

cd ..

if [ "$OS" != "macos" ]; then
    # Copy Nginx config
    if [ ! -f /etc/nginx/conf.d/mentormap.conf ]; then
        echo -e "${YELLOW}Installing Nginx configuration...${NC}"
        sudo cp scripts/nginx-mentormap.conf /etc/nginx/conf.d/mentormap.conf
        sudo nginx -t
        sudo systemctl enable nginx
        sudo systemctl restart nginx
        echo -e "${GREEN}✓ Nginx configured${NC}"
    else
        echo -e "${YELLOW}Nginx config already exists${NC}"
    fi
else
    echo -e "${YELLOW}Skipping Nginx setup on macOS${NC}"
fi

echo ""

# ============================================================================
# STEP 5: SSL Certificates (Optional)
# ============================================================================
echo -e "${GREEN}[5/7] SSL Certificate Setup${NC}"

if [ "$OS" != "macos" ]; then
    echo ""
    read -p "Do you want to set up SSL certificates now? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Install certbot
        echo -e "${YELLOW}Installing certbot...${NC}"
        if [ "$OS" == "amazon-linux-2023" ]; then
            sudo dnf install -y certbot python3-certbot-nginx
        elif [ "$OS" == "amazon-linux-2" ]; then
            sudo amazon-linux-extras install epel -y
            sudo yum install -y certbot python3-certbot-nginx
        else
            sudo apt-get install -y certbot python3-certbot-nginx
        fi
        
        # Create directory for challenges
        sudo mkdir -p /var/www/certbot
        sudo chown -R nginx:nginx /var/www/certbot || sudo chown -R www-data:www-data /var/www/certbot
        
        echo ""
        echo -e "${YELLOW}Make sure DNS is pointing to this server before continuing!${NC}"
        echo "Verify: dig mentormap.ai"
        echo ""
        read -p "Press Enter to continue with SSL setup, or Ctrl+C to skip..."
        
        # Obtain certificates
        sudo certbot certonly --nginx \
            -d mentormap.ai \
            -d www.mentormap.ai \
            -d api.mentormap.ai \
            --non-interactive \
            --agree-tos \
            --email admin@mentormap.ai || echo -e "${YELLOW}SSL setup skipped or failed${NC}"
        
        # Configure SSL in Nginx
        if [ -d /etc/letsencrypt/live/mentormap.ai ]; then
            echo -e "${GREEN}Configuring SSL in Nginx...${NC}"
            sudo sed -i 's|# ssl_certificate /etc/letsencrypt|ssl_certificate /etc/letsencrypt|g' /etc/nginx/conf.d/mentormap.conf
            sudo sed -i 's|# include /etc/letsencrypt|include /etc/letsencrypt|g' /etc/nginx/conf.d/mentormap.conf
            sudo nginx -t && sudo systemctl reload nginx
            
            # Setup auto-renewal
            if ! sudo crontab -l 2>/dev/null | grep -q "certbot renew"; then
                (sudo crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sudo crontab -
                echo -e "${GREEN}✓ Auto-renewal configured${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}SSL setup skipped. Run manually later if needed.${NC}"
    fi
else
    echo -e "${YELLOW}SSL not needed for local development${NC}"
fi

echo ""

# ============================================================================
# STEP 6: Environment Configuration
# ============================================================================
echo -e "${GREEN}[6/7] Environment Configuration${NC}"

echo ""
echo -e "${YELLOW}⚠️  Important: Update environment variables!${NC}"
echo ""
echo "Backend (.env):"
echo "  - LINKEDIN_CLIENT_ID"
echo "  - LINKEDIN_CLIENT_SECRET"
echo "  - LINKEDIN_REDIRECT_URI=https://api.mentormap.ai/api/auth/linkedin/callback"
echo "  - STRIPE_SECRET_KEY"
echo "  - SMTP credentials"
echo ""
echo "Frontend (.env.production):"
echo "  - NEXT_PUBLIC_API_URL=https://api.mentormap.ai"
echo ""

# ============================================================================
# STEP 7: Start Services
# ============================================================================
echo -e "${GREEN}[7/7] Starting services...${NC}"

# Stop any existing processes
pm2 delete all 2>/dev/null || true

# Kill any processes on ports 3000 and 8000
sudo lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sudo lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
cd backend
pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name mentormap-backend

# Start frontend
cd ../frontend
pm2 start npm --name mentormap-frontend -- start

# Save PM2 config
pm2 save

# Setup PM2 startup
if [ "$OS" != "macos" ]; then
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
fi

echo ""
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Services Status:"
pm2 status
echo ""
echo "Access your application:"
if [ "$OS" == "macos" ]; then
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
else
    echo "  - Frontend: https://mentormap.ai"
    echo "  - Backend: https://api.mentormap.ai"
    echo "  - API Docs: https://api.mentormap.ai/docs"
fi
echo ""
echo "Management Commands:"
echo "  - View logs: pm2 logs"
echo "  - Restart: pm2 restart all"
echo "  - Stop: pm2 stop all"
echo "  - Status: pm2 status"
echo ""
echo "Next Steps:"
echo "  1. Update backend/.env with your credentials"
echo "  2. Update LinkedIn OAuth redirect URI"
echo "  3. Restart services: pm2 restart all"
echo "  4. Test your application"
echo ""
