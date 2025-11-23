# 🚀 MyRoadmap Quick Start Guide

## Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

## Installation & Setup

### Option 1: Automated Setup (Recommended)
```bash
cd apps/myroadmap
chmod +x start.sh
./start.sh
```

This will:
1. Install all dependencies
2. Initialize the database with sample data
3. Start both frontend and backend servers

### Option 2: Manual Setup

#### Backend Setup
```bash
cd apps/myroadmap/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start backend
uvicorn main:app --reload --port 8002
```

#### Frontend Setup
```bash
cd apps/myroadmap/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs

## Sample Credentials

The database is initialized with sample users:

**Student Account:**
- Username: `john_doe`
- Password: `password123`

**Mentor Accounts:**
- Username: `sarah_mentor`, Password: `password123`
- Username: `mike_mentor`, Password: `password123`

## Features to Test

### 1. Browse Mentors
- Visit http://localhost:3000/mentors
- View mentor profiles with ratings and expertise
- See pricing and session counts

### 2. View Pricing
- Visit http://localhost:3000/pricing
- Compare different session packages
- Read FAQ section

### 3. API Testing
Visit http://localhost:8002/docs for interactive API documentation

**Try these endpoints:**
- `GET /api/mentors/` - List all mentors
- `POST /api/auth/login` - Login with credentials
- `GET /api/sessions/` - Get user sessions (requires auth)
- `GET /api/roadmaps/` - Get user roadmaps (requires auth)

## Project Structure

```
myroadmap/
├── frontend/                 # Next.js frontend
│   ├── src/app/             # Pages
│   │   ├── page.tsx         # Home page
│   │   ├── mentors/         # Browse mentors
│   │   └── pricing/         # Pricing page
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models.py        # Database models
│   │   └── schemas.py       # Pydantic schemas
│   ├── main.py              # Entry point
│   └── init_db.py           # Database initialization
└── start.sh                 # Startup script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Mentors
- `GET /api/mentors/` - List mentors
- `GET /api/mentors/{id}` - Get mentor details
- `POST /api/mentors/` - Create mentor profile (auth required)

### Sessions
- `GET /api/sessions/` - Get user sessions (auth required)
- `POST /api/sessions/` - Book a session (auth required)
- `PUT /api/sessions/{id}/cancel` - Cancel session (auth required)

### Roadmaps
- `GET /api/roadmaps/` - Get user roadmaps (auth required)
- `POST /api/roadmaps/` - Create roadmap (auth required)
- `PUT /api/roadmaps/{id}` - Update roadmap (auth required)

## Development Tips

### Backend Development
```bash
# Run with auto-reload
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8002

# Reset database
rm myroadmap.db
python init_db.py
```

### Frontend Development
```bash
# Run development server
cd frontend
npm run dev

# Build for production
npm run build
npm start
```

## Troubleshooting

### Port Already in Use
If port 3000 or 8002 is already in use:
```bash
# Frontend: Next.js will auto-assign a different port
# Backend: Change port in start command
uvicorn main:app --reload --port 8003
```

### Database Issues
```bash
# Reset database
cd backend
rm myroadmap.db
python init_db.py
```

### Module Not Found
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Customize the UI**: Edit files in `frontend/src/app/`
2. **Add Features**: Extend API in `backend/app/api/`
3. **Deploy**: Follow deployment guides in README.md

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review API docs at http://localhost:8002/docs
- Open an issue on GitHub

---

**Happy coding! 🚀**
