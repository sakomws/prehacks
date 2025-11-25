# MentorMap - Amazon Linux EC2 Quick Setup

This guide is specifically for Amazon Linux 2023 AMI.

## Quick Start

### 1. Launch EC2 Instance

- **AMI**: Amazon Linux 2023
- **Instance Type**: t2.medium or larger
- **Security Group**: Allow ports 22, 80, 443, 3000, 8000
- **Storage**: 20GB minimum

### 2. Connect to Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 3. Run Deployment Script

```bash
# Clone repository
git clone https://github.com/sakomws/prehacks.git
cd prehacks/apps/mentormap

# Run deployment
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

## Manual Setup (Alternative)

### Install System Dependencies

```bash
# Update system
sudo yum update -y

# Install Python 3.11
sudo yum install -y python3.11 python3.11-pip

# Install Git and Nginx
sudo yum install -y git nginx

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# Install PM2
npm install -g pm2
```

### Setup Application

```bash
# Clone repository
cd /home/ec2-user
git clone https://github.com/sakomws/prehacks.git
cd prehacks/apps/mentormap

# Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
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
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@mentormap.ai
FROM_NAME=MentorMap
EOF

# Initialize database
python init_db.py

# Setup frontend
cd ../frontend
npm install
npm run build

# Start services with PM2
cd ..
pm2 start backend/venv/bin/uvicorn --name mentormap-backend -- main:app --host 0.0.0.0 --port 8000 --app-dir backend
pm2 start npm --name mentormap-frontend --cwd frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Configure Nginx

```bash
sudo tee /etc/nginx/conf.d/mentormap.conf > /dev/null << 'EOF'
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
EOF

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Setup Firewall

```bash
# Allow HTTP and HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Configure SELinux for Nginx
sudo setsebool -P httpd_can_network_connect 1
```

### Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
sudo yum install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## PostgreSQL Setup (Production)

```bash
# Install PostgreSQL
sudo yum install -y postgresql15-server postgresql15-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE mentormap;
CREATE USER mentormap_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE mentormap TO mentormap_user;
\q
EOF

# Update backend/.env
# DATABASE_URL=postgresql://mentormap_user:your-secure-password@localhost/mentormap

# Install psycopg2
cd /home/ec2-user/prehacks/apps/mentormap/backend
source venv/bin/activate
pip install psycopg2-binary

# Restart backend
pm2 restart mentormap-backend
```

## Useful Commands

### System Management

```bash
# Check system info
cat /etc/system-release

# Update system
sudo yum update -y

# Check running services
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Application Management

```bash
# View logs
pm2 logs mentormap-backend
pm2 logs mentormap-frontend

# Restart services
pm2 restart all

# Check status
pm2 status

# Monitor resources
pm2 monit
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Firewall Management

```bash
# List rules
sudo firewall-cmd --list-all

# Add port
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --state
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R ec2-user:ec2-user /home/ec2-user/prehacks

# Fix SELinux context
sudo restorecon -Rv /home/ec2-user/prehacks
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check SELinux
sudo setsebool -P httpd_can_network_connect 1

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -U mentormap_user -d mentormap -h localhost
```

## Performance Optimization

### Enable Swap (for t2.micro/small)

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### PM2 Cluster Mode

```bash
# Use all CPU cores
pm2 start backend/venv/bin/uvicorn --name mentormap-backend -i max -- main:app --host 0.0.0.0 --port 8000 --app-dir backend
```

## Monitoring

### Setup CloudWatch Agent

```bash
# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Configure and start
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### PM2 Monitoring

```bash
# Enable PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Strategy

```bash
# Backup database
pg_dump -U mentormap_user mentormap > backup_$(date +%Y%m%d).sql

# Backup .env files
tar -czf env_backup_$(date +%Y%m%d).tar.gz backend/.env

# Automate with cron
crontab -e
# Add: 0 2 * * * /home/ec2-user/backup.sh
```

---

**Need help?** Check the main [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md) for more details.
