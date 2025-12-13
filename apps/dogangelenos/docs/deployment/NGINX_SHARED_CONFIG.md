# 🔧 Nginx Configuration for Shared EC2 Instance

## Overview

This guide shows how to add Dog Angelenos to an existing EC2 instance that already hosts MentorMap AI with Nginx.

---

## Architecture

```
EC2 Instance (ec2-3-84-133-237.compute-1.amazonaws.com)
├── MentorMap AI (existing)
│   ├── Domain: mentormap.ai
│   └── Nginx config: /etc/nginx/sites-available/mentormap
├── Dog Angelenos (new)
│   ├── Subdomain: dogangelenos.mentormap.ai (or separate domain)
│   ├── Backend: localhost:8000
│   └── Frontend: localhost:3004
```

---

## Step 1: Deploy Application

Follow the deployment steps but don't configure Nginx yet:

```bash
# Connect to EC2
ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com

# Create directory
mkdir -p ~/dogangelenos
cd ~/dogangelenos

# Upload and extract (from local machine)
# ... follow DEPLOY_NOW.md steps 3-5
```

---

## Step 2: Add Nginx Configuration

### Option A: Using Subdomain (Recommended)

**Create new Nginx config:**

```bash
sudo tee /etc/nginx/sites-available/dogangelenos << 'EOF'
# Dog Angelenos - Kiroween Submission
server {
    listen 80;
    server_name dogangelenos.mentormap.ai;

    # Frontend
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket for real-time chat
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # API docs
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3004;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/dogangelenos /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option B: Using Path-Based Routing

**Update existing Nginx config to add Dog Angelenos under a path:**

```bash
sudo nano /etc/nginx/sites-available/mentormap
```

Add this location block to the existing server configuration:

```nginx
# Add to existing server block
server {
    # ... existing mentormap config ...

    # Dog Angelenos
    location /dogangelenos {
        rewrite ^/dogangelenos(/.*)$ $1 break;
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /dogangelenos/api {
        rewrite ^/dogangelenos/api(/.*)$ /api$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

---

## Step 3: Update Frontend Environment

Update the API URL in the frontend:

```bash
cd ~/dogangelenos/frontend

# For subdomain setup
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://dogangelenos.mentormap.ai/api
EOF

# OR for path-based setup
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://mentormap.ai/dogangelenos/api
EOF

# Rebuild
npm run build

# Restart frontend
pkill -f "npm run start"
nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
```

---

## Step 4: Configure DNS (For Subdomain)

**In your DNS provider (e.g., Route 53, Cloudflare):**

Add A record:
- **Name**: `dogangelenos.mentormap.ai`
- **Type**: A
- **Value**: `3.84.133.237` (your EC2 IP)
- **TTL**: 300

Wait for DNS propagation (5-30 minutes).

---

## Step 5: Setup SSL Certificate

### For Subdomain

```bash
# Install certbot if not already installed
sudo yum install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d dogangelenos.mentormap.ai

# Certbot will automatically update Nginx config for HTTPS
```

### For Path-Based (Uses Existing Certificate)

The existing SSL certificate for mentormap.ai will cover the path-based routing automatically.

---

## Step 6: Update Backend CORS

Update backend to allow the new domain:

```bash
cd ~/dogangelenos/backend
nano main.py
```

Update CORS origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3004",
        "http://localhost:3000",
        "https://dogangelenos.mentormap.ai",  # Add this
        "https://mentormap.ai",  # If using path-based
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Restart backend:

```bash
pkill -f "uvicorn main:app"
cd ~/dogangelenos/backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
```

---

## Complete Nginx Configuration Example

### Full config for subdomain setup:

```nginx
# /etc/nginx/sites-available/dogangelenos

server {
    listen 80;
    server_name dogangelenos.mentormap.ai;

    # Redirect HTTP to HTTPS (after SSL setup)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dogangelenos.mentormap.ai;

    # SSL certificates (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/dogangelenos.mentormap.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dogangelenos.mentormap.ai/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Frontend
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # API documentation
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static files with caching
    location /_next/static {
        proxy_pass http://localhost:3004;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
        expires 1y;
    }

    # Favicon
    location /favicon.ico {
        proxy_pass http://localhost:3004;
        access_log off;
        log_not_found off;
    }

    # Logs
    access_log /var/log/nginx/dogangelenos_access.log;
    error_log /var/log/nginx/dogangelenos_error.log;
}
```

---

## Port Management

Since you're running multiple applications:

```
MentorMap AI:
- Frontend: Port 3000 (or other)
- Backend: Port 5000 (or other)

Dog Angelenos:
- Frontend: Port 3004
- Backend: Port 8000
```

Make sure ports don't conflict!

---

## Process Management with PM2

### Install PM2 (if not already installed)

```bash
sudo npm install -g pm2
```

### Create PM2 config for Dog Angelenos

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
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      time: true
    },
    {
      name: 'dogangelenos-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run start -- -p 3004',
      env: {
        NEXT_PUBLIC_API_URL: 'https://dogangelenos.mentormap.ai/api'
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      time: true
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs

# Start services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# View all services (including MentorMap)
pm2 list

# View logs
pm2 logs dogangelenos-backend
pm2 logs dogangelenos-frontend
```

---

## Testing

### Test Backend

```bash
curl https://dogangelenos.mentormap.ai/api/
curl https://dogangelenos.mentormap.ai/api/trainers
```

### Test Frontend

Open in browser:
- https://dogangelenos.mentormap.ai

### Test WebSocket

Check real-time chat functionality in the application.

---

## Monitoring

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check Nginx Logs

```bash
sudo tail -f /var/log/nginx/dogangelenos_access.log
sudo tail -f /var/log/nginx/dogangelenos_error.log
```

### Check Application Logs

```bash
# If using PM2
pm2 logs dogangelenos-backend
pm2 logs dogangelenos-frontend

# If using nohup
tail -f ~/dogangelenos/backend.log
tail -f ~/dogangelenos/frontend.log
```

### Check All Running Services

```bash
pm2 list
ps aux | grep -E "uvicorn|npm|node"
sudo netstat -tlnp | grep -E "3004|8000"
```

---

## Troubleshooting

### Nginx won't reload

```bash
# Check syntax
sudo nginx -t

# Check for conflicts
sudo nginx -T | grep "server_name"

# Restart Nginx
sudo systemctl restart nginx
```

### Port conflicts

```bash
# Check what's using ports
sudo lsof -i :3004
sudo lsof -i :8000

# Kill if needed
sudo kill -9 [PID]
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew

# Check certificate
sudo certbot certificates
```

### Frontend can't reach backend

1. Check CORS settings in backend
2. Verify API URL in frontend .env.local
3. Check Nginx proxy_pass configuration
4. Test backend directly: `curl http://localhost:8000/api/`

---

## Quick Commands Reference

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart Dog Angelenos (PM2)
pm2 restart dogangelenos-backend
pm2 restart dogangelenos-frontend

# Restart Dog Angelenos (manual)
pkill -f "uvicorn main:app"
pkill -f "npm run start"
cd ~/dogangelenos/backend && nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
cd ~/dogangelenos/frontend && nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &

# View all services
pm2 list
ps aux | grep -E "uvicorn|npm"

# Check ports
sudo netstat -tlnp | grep -E "3004|8000"
```

---

## Final URLs

After setup:

- **Frontend**: https://dogangelenos.mentormap.ai
- **Backend API**: https://dogangelenos.mentormap.ai/api
- **API Docs**: https://dogangelenos.mentormap.ai/docs
- **WebSocket**: wss://dogangelenos.mentormap.ai/ws

---

## Security Checklist

- [ ] SSL certificate installed and working
- [ ] HTTPS redirect configured
- [ ] Security headers added
- [ ] CORS properly configured
- [ ] Firewall rules updated
- [ ] Demo passwords changed (for production)
- [ ] Regular backups configured
- [ ] Monitoring setup

---

**Deployed alongside MentorMap AI!** 🎃🚀
