#!/bin/bash

# Production Setup Script for MentorMap on Amazon Linux EC2
# This script sets up PostgreSQL and production configurations

set -e

echo "🔧 Setting up production environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Install PostgreSQL
echo -e "${GREEN}Installing PostgreSQL...${NC}"
sudo yum install -y postgresql15-server postgresql15-contrib

# Initialize and start PostgreSQL
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo -e "${GREEN}Setting up database...${NC}"
DB_PASSWORD=$(openssl rand -hex 16)

sudo -u postgres psql << EOF
CREATE DATABASE mentormap;
CREATE USER mentormap_user WITH PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE mentormap TO mentormap_user;
\q
EOF

echo -e "${YELLOW}Database created!${NC}"
echo "Database: mentormap"
echo "User: mentormap_user"
echo "Password: ${DB_PASSWORD}"
echo ""
echo -e "${YELLOW}Update your backend/.env with:${NC}"
echo "DATABASE_URL=postgresql://mentormap_user:${DB_PASSWORD}@localhost/mentormap"

# Install psycopg2 for PostgreSQL
cd backend
source venv/bin/activate
pip install psycopg2-binary

echo -e "${GREEN}✅ Production setup complete!${NC}"
