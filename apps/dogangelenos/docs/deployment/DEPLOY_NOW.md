# 🚀 Deploy to EC2 NOW - Quick Guide

## Step 1: Connect to EC2

```bash
ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com
```

## Step 2: Install Dependencies (One-time)

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Python 3 and pip
sudo yum install -y python3 python3-pip

# Install Git
sudo yum install -y git

# Verify
node --version
python3 --version
```

## Step 3: Upload Application

**On your local machine (new terminal):**

```bash
cd apps/dogangelenos

# Create package
tar -czf dogangelenos.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='.venv' \
  backend/ frontend/ docs/ .kiro/ *.md

# Upload to EC2
scp -i "~/Downloads/sako.pem" dogangelenos.tar.gz ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com:~/
```

## Step 4: Setup on EC2

**Back on EC2 terminal:**

```bash
# Extract
mkdir -p ~/dogangelenos
cd ~/dogangelenos
tar -xzf ~/dogangelenos.tar.gz
rm ~/dogangelenos.tar.gz

# Setup Backend
cd backend
pip3 install --user -r requirements.txt

# Setup Frontend
cd ../frontend
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://ec2-3-84-133-237.compute-1.amazonaws.com:8000
EOF

# Build frontend
npm run build
```

## Step 5: Start Services

```bash
cd ~/dogangelenos

# Start Backend
cd backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &

# Wait a moment
sleep 3

# Seed data
curl -X POST http://localhost:8000/api/trainers/seed

# Start Frontend
cd ../frontend
nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &

echo "✅ Services started!"
```

## Step 6: Configure Security Group

**In AWS Console:**

1. Go to EC2 → Instances
2. Select your instance
3. Click Security tab → Security groups
4. Click the security group link
5. Edit inbound rules → Add rules:
   - Type: Custom TCP, Port: 3004, Source: 0.0.0.0/0 (Frontend)
   - Type: Custom TCP, Port: 8000, Source: 0.0.0.0/0 (Backend)
6. Save rules

## Step 7: Access Application

**URLs:**
- Frontend: http://ec2-3-84-133-237.compute-1.amazonaws.com:3004
- Backend: http://ec2-3-84-133-237.compute-1.amazonaws.com:8000
- API Docs: http://ec2-3-84-133-237.compute-1.amazonaws.com:8000/docs

**Demo Accounts:**
- Admin: admin@dogangelenos.com / admin123
- Trainer: trainer@dogangelenos.com / trainer123
- Customer: customer@dogangelenos.com / customer123

---

## Useful Commands

### Check if services are running
```bash
ps aux | grep -E "uvicorn|npm"
```

### View logs
```bash
tail -f ~/dogangelenos/backend.log
tail -f ~/dogangelenos/frontend.log
```

### Restart services
```bash
# Kill existing
pkill -f "uvicorn main:app"
pkill -f "npm run start"

# Start again
cd ~/dogangelenos/backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &

cd ~/dogangelenos/frontend
nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
```

### Stop services
```bash
pkill -f "uvicorn main:app"
pkill -f "npm run start"
```

---

## Troubleshooting

### Port already in use
```bash
sudo lsof -i :8000
sudo lsof -i :3004
sudo kill -9 [PID]
```

### Can't access from browser
1. Check security group has ports 3004 and 8000 open
2. Check services are running: `ps aux | grep -E "uvicorn|npm"`
3. Check logs for errors

### Frontend shows API errors
Update the API URL in frontend:
```bash
cd ~/dogangelenos/frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://ec2-3-84-133-237.compute-1.amazonaws.com:8000
EOF
npm run build
pkill -f "npm run start"
nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
```

---

## Quick Update

When you make changes locally:

```bash
# On local machine
cd apps/dogangelenos
tar -czf dogangelenos.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='.venv' \
  backend/ frontend/ docs/ .kiro/ *.md
scp -i "~/Downloads/sako.pem" dogangelenos.tar.gz ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com:~/

# On EC2
cd ~/dogangelenos
tar -xzf ~/dogangelenos.tar.gz
cd frontend && npm install && npm run build && cd ..
pkill -f "uvicorn main:app"
pkill -f "npm run start"
cd backend && nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
cd ../frontend && nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
```

---

**That's it! Your app is now live on AWS EC2!** 🎃🚀
