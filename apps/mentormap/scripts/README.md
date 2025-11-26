# MentorMap Scripts

Simple deployment and management scripts for MentorMap.

## 📦 Main Scripts

### `install.sh` - One-Time Setup
Complete installation script for first-time deployment.

**Usage:**
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

**What it does:**
1. Installs system dependencies (Python, Node.js, Nginx, PM2)
2. Sets up backend (virtual environment, dependencies, database)
3. Sets up frontend (dependencies, build)
4. Configures Nginx
5. Optionally sets up SSL certificates
6. Starts all services

**When to use:** First-time deployment on a new server

---

### `run.sh` - Service Management
Manage running services (start, stop, restart, status, logs, update).

**Usage:**
```bash
chmod +x scripts/run.sh

# Show status (default)
./scripts/run.sh
./scripts/run.sh status

# Start services
./scripts/run.sh start

# Stop services
./scripts/run.sh stop

# Restart services
./scripts/run.sh restart

# View logs
./scripts/run.sh logs

# Update application
./scripts/run.sh update

# Show help
./scripts/run.sh help
```

**Commands:**
- `start` - Start all services (fixes port conflicts automatically)
- `stop` - Stop all services
- `restart` - Restart all services
- `status` - Show service status and health checks
- `logs` - Show real-time logs (Ctrl+C to exit)
- `update` - Pull latest code, rebuild, and restart
- `help` - Show help message

---

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/your-repo/prehacks.git
cd prehacks/apps/mentormap

# 2. Run installation
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Configure environment variables
nano backend/.env
nano frontend/.env.production

# 4. Restart services
./scripts/run.sh restart
```

### Daily Operations

```bash
# Check status
./scripts/run.sh status

# View logs
./scripts/run.sh logs

# Restart services
./scripts/run.sh restart

# Deploy updates
./scripts/run.sh update
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
