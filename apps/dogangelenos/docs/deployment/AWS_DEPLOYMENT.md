# 🚀 AWS EC2 Deployment Guide

## Quick Deploy

```bash
cd apps/dogangelenos
chmod +x deploy-to-ec2.sh
./deploy-to-ec2.sh
```

This will automatically:
1. Package the application
2. Upload to EC2
3. Install dependencies
4. Build frontend
5. Start services

---

## Manual Deployment Steps

### 1. Prepare EC2 Instance

**Security Group Settings:**
- Port 22 (SSH) - Your IP
- Port 3004 (Frontend) - 0.0.0.0/0
- Port 8000 (Backend) - 0.0.0.0/0
- Port 80 (HTTP) - 0.0.0.0/0 (optional, for nginx)
- Port 443 (HTTPS) - 0.0.0.0/0 (optional, for SSL)

### 2. Connect to EC2

```bash
ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com
```

### 3. Install Dependencies

```bash
# Update system
sudo yum update -y

# Install Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Python 3
sudo yum install -y python3 python3-pip

# Install Git
sudo yum install -y git

# Verify installations
node --version
npm --version
python3 --version
```

### 4. Upload Application

**Option A: Using SCP**
```bash
# From your local machine
cd apps/dogangelenos
tar -czf dogangelenos.tar.gz backend/ frontend/ docs/ .kiro/ *.md
scp -i "~/Downloads/sako.pem" dogangelenos.tar.gz ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com:~/
```

**Option B: Using Git**
```bash
# On EC2
cd ~
git clone [your-repo-url]
cd [repo-name]/apps/dogangelenos
```

### 5. Setup Backend

```bash
cd ~/dogangelenos/backend

# Install Python dependencies
pip3 install --user -r requirements.txt

# Create environment file (optional)
cat > .env << EOF
DATABASE_URL=sqlite:///./dogangelenos.db
EOF

# Initialize database
python3 -c "from database import init_db; init_db()"

# Seed trainers data
curl -X POST http://localhost:8000/api/trainers/seed
```

### 6. Setup Frontend

```bash
cd ~/dogangelenos/frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://ec2-3-84-133-237.compute-1.amazonaws.com:8000
EOF

# Build for production
npm run build
```

### 7. Start Services

**Backend:**
```bash
cd ~/dogangelenos/backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
```

**Frontend:**
```bash
cd ~/dogangelenos/frontend
nohup npm run start -- -p 3004 > frontend.log 2>&1 &
```

### 8. Verify Services

```bash
# Check processes
ps aux | grep -E "uvicorn|npm"

# Check backend
curl http://localhost:8000/

# Check frontend
curl http://localhost:3004/
```

---

## Access Application

- **Frontend:** http://ec2-3-84-133-237.compute-1.amazonaws.com:3004
- **Backend:** http://ec2-3-84-133-237.compute-1.amazonaws.com:8000
- **API Docs:** http://ec2-3-84-133-237.compute-1.amazonaws.com:8000/docs

**Demo Accounts:**
- Admin: admin@dogangelenos.com / admin123
- Trainer: trainer@dogangelenos.com / trainer123
- Customer: customer@dogangelenos.com / customer123

---

## Production Setup with PM2

For better process management, use PM2:

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Configuration

```bash
cd ~/dogangelenos
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'dogangelenos-backend',
      cwd: './backend',
      script: 'python3',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8000',
      env: {
        DATABASE_URL: 'sqlite:///./dogangelenos.db'
      }
    },
    {
      name: 'dogangelenos-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run start -- -p 3004',
      env: {
        NEXT_PUBLIC_API_URL: 'http://ec2-3-84-133-237.compute-1.amazonaws.com:8000'
      }
    }
  ]
};
EOF
```

### Start with PM2

```bash
# Start services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# View status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all
```

---

## Setup Nginx Reverse Proxy (Optional)

### Install Nginx

```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configure Nginx

```bash
sudo tee /etc/nginx/conf.d/dogangelenos.conf << 'EOF'
# Frontend
server {
    listen 80;
    server_name ec2-3-84-133-237.compute-1.amazonaws.com;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

Now access via: http://ec2-3-84-133-237.compute-1.amazonaws.com

---

## SSL Setup with Let's Encrypt (Optional)

### Install Certbot

```bash
sudo yum install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
```

---

## Monitoring & Logs

### View Logs

```bash
# Backend logs
tail -f ~/dogangelenos/backend.log

# Frontend logs
tail -f ~/dogangelenos/frontend.log

# PM2 logs (if using PM2)
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status

```bash
# Check processes
ps aux | grep -E "uvicorn|npm"

# Check ports
sudo netstat -tlnp | grep -E "3004|8000"

# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python3 --version

# Reinstall dependencies
cd ~/dogangelenos/backend
pip3 install --user --upgrade -r requirements.txt

# Check for errors
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Won't Start

```bash
# Check Node version
node --version

# Clear cache and rebuild
cd ~/dogangelenos/frontend
rm -rf .next node_modules
npm install
npm run build
npm run start -- -p 3004
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8000
sudo lsof -i :3004

# Kill process
sudo kill -9 [PID]
```

### Database Issues

```bash
cd ~/dogangelenos/backend

# Backup database
cp dogangelenos.db dogangelenos.db.backup

# Reinitialize
rm dogangelenos.db
python3 -c "from database import init_db; init_db()"

# Reseed data
curl -X POST http://localhost:8000/api/trainers/seed
```

### Security Group Issues

1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Add inbound rules:
   - Type: Custom TCP, Port: 3004, Source: 0.0.0.0/0
   - Type: Custom TCP, Port: 8000, Source: 0.0.0.0/0

---

## Updating the Application

### Quick Update Script

```bash
cd ~/dogangelenos
cat > update.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Updating Dog Angelenos..."

# Pull latest code (if using git)
git pull

# Update backend
cd backend
pip3 install --user -r requirements.txt

# Update frontend
cd ../frontend
npm install
npm run build

# Restart services
if command -v pm2 &> /dev/null; then
    pm2 restart all
else
    pkill -f "uvicorn main:app"
    pkill -f "npm run start"
    
    cd ../backend
    nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
    
    cd ../frontend
    nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
fi

echo "✅ Update complete!"
EOF

chmod +x update.sh
./update.sh
```

---

## Backup & Restore

### Backup Database

```bash
cd ~/dogangelenos/backend
cp dogangelenos.db "dogangelenos.db.backup.$(date +%Y%m%d_%H%M%S)"
```

### Restore Database

```bash
cd ~/dogangelenos/backend
cp dogangelenos.db.backup.YYYYMMDD_HHMMSS dogangelenos.db
```

---

## Performance Optimization

### Enable Gzip in Nginx

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Cache Static Assets

```nginx
location /_next/static {
    proxy_pass http://localhost:3004;
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Checklist

- [ ] Change default demo passwords
- [ ] Setup firewall rules
- [ ] Enable HTTPS with SSL certificate
- [ ] Regular security updates: `sudo yum update -y`
- [ ] Setup automated backups
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets
- [ ] Restrict SSH access to specific IPs

---

## Cost Optimization

- Use t2.micro or t3.micro for testing (free tier eligible)
- Stop instance when not in use
- Use Elastic IP to maintain same address
- Monitor CloudWatch metrics
- Set up billing alerts

---

## Support

For issues:
1. Check logs: `tail -f ~/dogangelenos/*.log`
2. Verify services: `ps aux | grep -E "uvicorn|npm"`
3. Check ports: `sudo netstat -tlnp`
4. Review documentation in `docs/` folder

---

**Deployed with 🖤 for Kiroween 2024** 🎃👻
