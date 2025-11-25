# MentorMap AWS EC2 Deployment Guide

## Prerequisites

1. AWS EC2 instance (Amazon Linux 2023 recommended)
2. Security group with ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Frontend), 8000 (Backend)
3. Elastic IP (optional but recommended)
4. Domain name (optional)

## Step 1: Connect to EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

## Step 2: Initial Server Setup

```bash
# Update system
sudo yum update -y

# Install required packages
sudo yum install -y python3.11 python3.11-pip git nginx

# Install Node.js 18+ using nvm (recommended for Amazon Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installations
python3.11 --version
node --version
npm --version
```

## Step 3: Clone Repository

```bash
cd /home/ec2-user
git clone https://github.com/sakomws/prehacks.git
cd prehacks/apps/mentormap
```

## Step 4: Setup Backend

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./mentormap.db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://your-domain.com/api/auth/linkedin/callback
EOF
EOF

# Initialize database
python init_db.py

# Test backend
uvicorn main:app --host 0.0.0.0 --port 8000
# Press Ctrl+C after verifying it works
```

## Step 5: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://your-ec2-ip:8000
EOF

# Build frontend
npm run build

# Test frontend
npm start
# Press Ctrl+C after verifying it works
```

## Step 6: Setup PM2 for Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend
cd /home/ec2-user/prehacks/apps/mentormap/backend
pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name mentormap-backend

# Start frontend
cd /home/ec2-user/prehacks/apps/mentormap/frontend
pm2 start npm --name mentormap-frontend -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs (it will include sudo)
```

## Step 7: Configure Nginx (Optional - for production)

```bash
sudo nano /etc/nginx/sites-available/mentormap
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/mentormap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Setup SSL with Let's Encrypt (Optional)

```bash
# Install EPEL repository (required for certbot)
sudo yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Management Commands

### View logs
```bash
pm2 logs mentormap-backend
pm2 logs mentormap-frontend
```

### Restart services
```bash
pm2 restart mentormap-backend
pm2 restart mentormap-frontend
```

### Stop services
```bash
pm2 stop mentormap-backend
pm2 stop mentormap-frontend
```

### Update application
```bash
cd /home/ec2-user/prehacks
git pull

# Update backend
cd apps/mentormap/backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart mentormap-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart mentormap-frontend
```

## Troubleshooting

### Check if services are running
```bash
pm2 status
```

### Check ports
```bash
sudo netstat -tulpn | grep -E '3000|8000'
```

### Check logs
```bash
pm2 logs
```

### Database issues
```bash
cd /home/ec2-user/prehacks/apps/mentormap/backend
source venv/bin/activate
python init_db.py
```

## Security Recommendations

1. Use environment variables for secrets
2. Enable firewall: `sudo firewall-cmd --permanent --add-service=http --add-service=https && sudo firewall-cmd --reload`
3. Configure security groups properly
4. Use SSL/TLS certificates
5. Regular security updates: `sudo yum update -y`
6. Use PostgreSQL instead of SQLite for production
7. Set up automated backups
8. Configure SELinux properly: `sudo setsebool -P httpd_can_network_connect 1`

## Monitoring

```bash
# Install monitoring tools
pm2 install pm2-logrotate

# Monitor resources
pm2 monit
```
