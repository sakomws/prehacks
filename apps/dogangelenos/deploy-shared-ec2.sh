#!/bin/bash

# Dog Angelenos - Shared EC2 Deployment (with MentorMap AI)
# This script deploys to an EC2 instance that already has Nginx configured

set -e

echo "🎃 Dog Angelenos - Shared EC2 Deployment"
echo "========================================="

# Configuration
EC2_HOST="ec2-3-84-133-237.compute-1.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="~/Downloads/sako.pem"
APP_DIR="/home/ec2-user/dogangelenos"
SUBDOMAIN="dogangelenos.mentormap.ai"

echo "📦 Step 1: Preparing deployment package..."
cd "$(dirname "$0")"

# Create deployment package
echo "Creating tarball..."
tar -czf dogangelenos-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.venv' \
  --exclude='dogangelenos.db' \
  backend/ frontend/ docs/ .kiro/ *.md

echo "✅ Package created"

echo ""
echo "📤 Step 2: Uploading to EC2..."
scp -i "$PEM_FILE" dogangelenos-deploy.tar.gz "$EC2_USER@$EC2_HOST:/tmp/"

echo ""
echo "🚀 Step 3: Setting up application..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

echo "Creating application directory..."
mkdir -p /home/ec2-user/dogangelenos
cd /home/ec2-user/dogangelenos

echo "Extracting files..."
tar -xzf /tmp/dogangelenos-deploy.tar.gz
rm /tmp/dogangelenos-deploy.tar.gz

echo "Setting up backend..."
cd backend
pip3 install --user -r requirements.txt

echo "Setting up frontend..."
cd ../frontend

# Create environment file with subdomain
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://dogangelenos.mentormap.ai/api
EOF

npm install
npm run build

echo "✅ Setup complete!"
ENDSSH

echo ""
echo "🔧 Step 4: Configuring Nginx..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/dogangelenos << 'EOF'
server {
    listen 80;
    server_name dogangelenos.mentormap.ai;

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

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /_next/static {
        proxy_pass http://localhost:3004;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/dogangelenos_access.log;
    error_log /var/log/nginx/dogangelenos_error.log;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/dogangelenos /etc/nginx/sites-enabled/

# Test configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Nginx configured!"
ENDSSH

echo ""
echo "🎯 Step 5: Starting services..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd /home/ec2-user/dogangelenos

# Kill existing processes
pkill -f "uvicorn main:app" || true
pkill -f "npm run start.*3004" || true

# Start backend
cd backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
echo "Backend started on port 8000"

# Wait for backend to start
sleep 3

# Seed data
curl -X POST http://localhost:8000/api/trainers/seed || echo "Seed failed (may already exist)"

# Start frontend
cd ../frontend
nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
echo "Frontend started on port 3004"

sleep 2

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Service Status:"
ps aux | grep -E "uvicorn|npm.*3004" | grep -v grep
ENDSSH

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://$SUBDOMAIN"
echo "   Backend:  http://$SUBDOMAIN/api"
echo "   API Docs: http://$SUBDOMAIN/docs"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1. Configure DNS:"
echo "   Add A record: dogangelenos.mentormap.ai → 3.84.133.237"
echo ""
echo "2. Setup SSL certificate:"
echo "   ssh -i $PEM_FILE $EC2_USER@$EC2_HOST"
echo "   sudo certbot --nginx -d dogangelenos.mentormap.ai"
echo ""
echo "3. Update backend CORS:"
echo "   Add 'https://dogangelenos.mentormap.ai' to allowed origins"
echo ""
echo "📝 View logs:"
echo "   ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'tail -f ~/dogangelenos/backend.log'"
echo "   ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'tail -f ~/dogangelenos/frontend.log'"
echo ""
echo "📚 Full documentation: NGINX_SHARED_CONFIG.md"
echo ""

# Cleanup
rm dogangelenos-deploy.tar.gz

echo "🎃 Happy Kiroween! 👻"
