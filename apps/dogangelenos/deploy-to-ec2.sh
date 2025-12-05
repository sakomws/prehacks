#!/bin/bash

# Dog Angelenos - AWS EC2 Deployment Script
# This script deploys the application to EC2

set -e

echo "🎃 Dog Angelenos - EC2 Deployment"
echo "=================================="

# Configuration
EC2_HOST="ec2-3-84-133-237.compute-1.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="~/Downloads/sako.pem"
APP_DIR="/home/ec2-user/dogangelenos"

echo "📦 Step 1: Preparing deployment package..."
cd "$(dirname "$0")"

# Create deployment package (exclude node_modules, .next, etc.)
echo "Creating tarball..."
tar -czf dogangelenos-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.venv' \
  --exclude='dogangelenos.db' \
  backend/ frontend/ docs/ .kiro/ *.md *.sh

echo "✅ Package created: dogangelenos-deploy.tar.gz"

echo ""
echo "📤 Step 2: Uploading to EC2..."
scp -i "$PEM_FILE" dogangelenos-deploy.tar.gz "$EC2_USER@$EC2_HOST:/tmp/"

echo ""
echo "🚀 Step 3: Setting up on EC2..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

echo "Creating application directory..."
mkdir -p /home/ec2-user/dogangelenos
cd /home/ec2-user/dogangelenos

echo "Extracting files..."
tar -xzf /tmp/dogangelenos-deploy.tar.gz
rm /tmp/dogangelenos-deploy.tar.gz

echo "Installing system dependencies..."
sudo yum update -y
sudo yum install -y python3 python3-pip nodejs npm git

echo "Setting up backend..."
cd backend
pip3 install --user -r requirements.txt

echo "Setting up frontend..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "✅ Setup complete!"
ENDSSH

echo ""
echo "🎯 Step 4: Starting services..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd /home/ec2-user/dogangelenos

# Kill existing processes
pkill -f "uvicorn main:app" || true
pkill -f "npm run start" || true

# Start backend
cd backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
echo "Backend started on port 8000"

# Seed data
sleep 3
curl -X POST http://localhost:8000/api/trainers/seed || true

# Start frontend
cd ../frontend
nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
echo "Frontend started on port 3004"

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Service Status:"
ps aux | grep -E "uvicorn|npm" | grep -v grep
ENDSSH

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://$EC2_HOST:3004"
echo "   Backend:  http://$EC2_HOST:8000"
echo "   API Docs: http://$EC2_HOST:8000/docs"
echo ""
echo "📝 View logs:"
echo "   ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'tail -f ~/dogangelenos/backend.log'"
echo "   ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'tail -f ~/dogangelenos/frontend.log'"
echo ""
echo "🔒 Don't forget to configure EC2 Security Group:"
echo "   - Allow inbound TCP 3004 (Frontend)"
echo "   - Allow inbound TCP 8000 (Backend)"
echo ""

# Cleanup
rm dogangelenos-deploy.tar.gz

echo "🎃 Happy Kiroween! 👻"
