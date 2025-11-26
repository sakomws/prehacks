# MentorMap Deployment Scripts

This folder contains all deployment and maintenance scripts for MentorMap.

## Scripts Overview

### 🚀 Deployment Scripts

#### `deploy-ec2.sh`
Initial deployment script for EC2 instances (Amazon Linux, Ubuntu, or macOS).

**Usage:**
```bash
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

**What it does:**
- Detects OS and installs dependencies
- Sets up Python virtual environment
- Installs Node.js and PM2
- Initializes database
- Builds frontend
- Starts services with PM2

**When to use:** First-time deployment on a new server

---

#### `deploy-production.sh`
Production deployment script for mentormap.ai domain.

**Usage:**
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

**What it does:**
- Pulls latest code from git
- Updates backend dependencies
- Rebuilds frontend with production settings
- Restarts services
- Configures Nginx (if needed)
- Guides SSL setup

**When to use:** Deploying updates to production

---

### 🔒 SSL Setup

#### `setup-ssl.sh`
Installs certbot and obtains SSL certificates for mentormap.ai.

**Usage:**
```bash
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

**What it does:**
- Installs certbot and nginx plugin
- Obtains SSL certificates for all domains
- Configures HTTPS redirect
- Sets up auto-renewal cron job

**Prerequisites:**
- DNS records pointing to server
- Nginx running with correct configuration
- Ports 80 and 443 open

**When to use:** After initial deployment, before going live

---

### 🔧 Maintenance Scripts

#### `fix-port-conflict.sh`
Resolves port conflicts on 8000 and 3000.

**Usage:**
```bash
chmod +x fix-port-conflict.sh
./fix-port-conflict.sh
```

**What it does:**
- Finds processes using ports 8000 and 3000
- Kills conflicting processes
- Stops and removes PM2 processes
- Provides commands to restart services

**When to use:** When you get "address already in use" errors

---

## Quick Start Guide

### First Time Deployment

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-repo/prehacks.git
   cd prehacks/apps/mentormap
   ```

2. **Run initial deployment:**
   ```bash
   chmod +x scripts/deploy-ec2.sh
   ./scripts/deploy-ec2.sh
   ```

3. **Configure environment variables:**
   ```bash
   nano backend/.env
   nano frontend/.env.production
   ```

4. **Set up Nginx:**
   ```bash
   sudo cp nginx-mentormap.conf /etc/nginx/conf.d/mentormap.conf
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Get SSL certificates:**
   ```bash
   chmod +x scripts/setup-ssl.sh
   sudo ./scripts/setup-ssl.sh
   ```

### Deploying Updates

```bash
cd /path/to/mentormap
./scripts/deploy-production.sh
```

### Troubleshooting Port Conflicts

```bash
./scripts/fix-port-conflict.sh
```

Then restart services:
```bash
cd backend
pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name mentormap-backend

cd ../frontend
pm2 start npm --name mentormap-frontend -- start
```

## Common Commands

### Check Service Status
```bash
pm2 status
pm2 logs
```

### Restart Services
```bash
pm2 restart all
# or
pm2 restart mentormap-backend
pm2 restart mentormap-frontend
```

### View Logs
```bash
pm2 logs mentormap-backend
pm2 logs mentormap-frontend
```

### Nginx Commands
```bash
sudo nginx -t                    # Test configuration
sudo systemctl restart nginx     # Restart
sudo systemctl status nginx      # Check status
```

### SSL Certificate Management
```bash
sudo certbot certificates        # List certificates
sudo certbot renew              # Renew certificates
sudo certbot renew --dry-run    # Test renewal
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:///./mentormap.db
SECRET_KEY=your-secret-key
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_REDIRECT_URI=https://api.mentormap.ai/api/auth/linkedin/callback
STRIPE_SECRET_KEY=your-stripe-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.mentormap.ai
```

## Support

For detailed documentation, see the `docs/` folder:
- `EC2_DEPLOYMENT_GUIDE.md` - Complete EC2 setup guide
- `PRODUCTION_SETUP.md` - Production deployment guide

## Notes

- All scripts should be run from the `apps/mentormap` directory
- Make scripts executable with `chmod +x script-name.sh`
- Use `sudo` only when required (SSL setup, Nginx config)
- Always test in staging before deploying to production
