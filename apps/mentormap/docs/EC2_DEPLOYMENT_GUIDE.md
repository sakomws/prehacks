# MentorMap EC2 Deployment Guide

Complete guide to deploy MentorMap on Amazon Linux 2023 EC2 instance.

## Prerequisites

- AWS Account
- EC2 instance (t2.medium or larger recommended)
- Domain name (optional, for production)
- LinkedIn OAuth credentials
- Stripe API keys

## Step 1: Launch EC2 Instance

1. **Launch Instance:**
   - AMI: Amazon Linux 2023
   - Instance Type: t2.medium (minimum)
   - Storage: 20GB GP3
   - Key Pair: Create or use existing

2. **Configure Security Group:**
   ```
   Inbound Rules:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (3000) - 0.0.0.0/0 (Frontend - temporary)
   - Custom TCP (8000) - 0.0.0.0/0 (Backend API - temporary)
   ```

3. **Allocate Elastic IP** (recommended for production)

## Step 2: Connect to EC2

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

## Step 3: Clone Repository

```bash
# Install git if not present
sudo yum install -y git

# Clone your repository
git clone https://github.com/your-username/your-repo.git
cd your-repo/apps/mentormap
```

## Step 4: Configure Environment Variables

### Backend Configuration

```bash
cd backend
nano .env
```

Add your credentials:

```env
# Database
DATABASE_URL=sqlite:///./mentormap.db

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://your-domain.com/api/auth/linkedin/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@mentormap.ai
FROM_NAME=MentorMap
```

### Frontend Configuration

```bash
cd ../frontend
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=http://your-domain.com
```

## Step 5: Run Deployment Script

```bash
cd ..
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

The script will:
- Update system packages
- Install Python 3.11, Node.js 18, Nginx
- Set up Python virtual environment
- Install dependencies
- Initialize database
- Build frontend
- Start services with PM2

## Step 6: Verify Deployment

Check services are running:

```bash
pm2 status
```

You should see:
- `mentormap-backend` - running
- `mentormap-frontend` - running

View logs:

```bash
pm2 logs mentormap-backend
pm2 logs mentormap-frontend
```

Test endpoints:

```bash
# Backend health check
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

## Step 7: Configure Nginx (Production)

Create Nginx configuration:

```bash
sudo nano /etc/nginx/conf.d/mentormap.conf
```

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and start Nginx:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

## Step 8: Configure SSL with Let's Encrypt

Install Certbot:

```bash
sudo yum install -y certbot python3-certbot-nginx
```

Get SSL certificates:

```bash
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

Auto-renewal is configured automatically. Test it:

```bash
sudo certbot renew --dry-run
```

## Step 9: Update DNS Records

Point your domain to EC2 Elastic IP:

```
A Record: your-domain.com → EC2_ELASTIC_IP
A Record: api.your-domain.com → EC2_ELASTIC_IP
```

## Step 10: Update OAuth Redirect URIs

Update LinkedIn OAuth settings:
- Redirect URI: `https://api.your-domain.com/api/auth/linkedin/callback`

Update backend .env:
```bash
LINKEDIN_REDIRECT_URI=https://api.your-domain.com/api/auth/linkedin/callback
```

Restart backend:
```bash
pm2 restart mentormap-backend
```

## Management Commands

### PM2 Commands

```bash
# View all processes
pm2 status

# View logs
pm2 logs
pm2 logs mentormap-backend
pm2 logs mentormap-frontend

# Restart services
pm2 restart all
pm2 restart mentormap-backend
pm2 restart mentormap-frontend

# Stop services
pm2 stop all

# Delete processes
pm2 delete all
```

### Update Application

```bash
cd /path/to/mentormap

# Pull latest changes
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart mentormap-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart mentormap-frontend
```

### Database Backup

```bash
# Backup database
cp backend/mentormap.db backend/mentormap.db.backup-$(date +%Y%m%d)

# Restore database
cp backend/mentormap.db.backup-20240101 backend/mentormap.db
pm2 restart mentormap-backend
```

### View System Resources

```bash
# CPU and Memory usage
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

## Troubleshooting

### Backend not starting

```bash
# Check logs
pm2 logs mentormap-backend

# Check if port 8000 is in use
sudo lsof -i :8000

# Restart backend
pm2 restart mentormap-backend
```

### Frontend not starting

```bash
# Check logs
pm2 logs mentormap-frontend

# Check if port 3000 is in use
sudo lsof -i :3000

# Rebuild and restart
cd frontend
npm run build
pm2 restart mentormap-frontend
```

### Database issues

```bash
# Reinitialize database (WARNING: deletes all data)
cd backend
rm mentormap.db
python init_db.py
pm2 restart mentormap-backend
```

### Nginx issues

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

## Security Best Practices

1. **Firewall Configuration:**
   ```bash
   # Only allow necessary ports
   # Remove public access to 3000 and 8000 after Nginx setup
   ```

2. **Keep System Updated:**
   ```bash
   sudo yum update -y
   ```

3. **Regular Backups:**
   - Database backups
   - Configuration backups
   - Use AWS Backup or snapshots

4. **Monitor Logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/access.log
   ```

5. **Use Environment Variables:**
   - Never commit secrets to git
   - Use AWS Secrets Manager for production

## Performance Optimization

### Enable PM2 Cluster Mode

```bash
# Stop current processes
pm2 delete all

# Start in cluster mode
pm2 start backend/venv/bin/uvicorn --name mentormap-backend -i max -- main:app --host 0.0.0.0 --port 8000
```

### Configure Nginx Caching

Add to Nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    # ... rest of config
}
```

### Database Optimization

For production, consider PostgreSQL:

```bash
# Install PostgreSQL
sudo yum install -y postgresql15 postgresql15-server

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost/mentormap
```

## Monitoring

### Set up CloudWatch

1. Install CloudWatch agent
2. Monitor:
   - CPU utilization
   - Memory usage
   - Disk I/O
   - Network traffic

### Application Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Cost Optimization

1. **Right-size instance** - Start with t2.medium, scale as needed
2. **Use Reserved Instances** - Save up to 75% for long-term
3. **Enable Auto Scaling** - Scale based on demand
4. **Use CloudFront** - CDN for static assets
5. **Optimize images** - Compress and use WebP format

## Support

For issues or questions:
- Check logs: `pm2 logs`
- Review documentation
- Check GitHub issues
- Contact support team

## Next Steps

1. Set up monitoring and alerts
2. Configure automated backups
3. Implement CI/CD pipeline
4. Set up staging environment
5. Configure auto-scaling
6. Add application monitoring (Sentry, DataDog)
7. Implement rate limiting
8. Add WAF (Web Application Firewall)
