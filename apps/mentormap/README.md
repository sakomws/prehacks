# 🗺️ MentorMap - Mentorship & Learning Platform

![Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A comprehensive mentorship and learning roadmap platform inspired by Hello Interview. Connect with mentors, create personalized study plans, and track your learning progress.

## 🌟 Features

### 👥 Mentorship
- Browse and book sessions with expert mentors
- 1:1 video sessions for mock interviews and concept review
- Flexible session packages (1, 3, or 6 sessions)
- Private chat support with mentors

### 📚 Learning Paths
- Personalized study plans
- Track progress on learning goals
- Company-specific preparation guides
- Resource recommendations

### 💬 Communication
- Real-time chat with mentors
- Session scheduling and management
- Feedback and reviews

### 📊 Analytics
- Track your learning progress
- Session history and notes
- Performance metrics

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15, React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Database:** SQLite (development), PostgreSQL (production)
- **ORM:** SQLAlchemy
- **Authentication:** JWT
- **Real-time:** WebSockets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

1. **Clone and navigate**
```bash
cd apps/mentormap
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**
```bash
cd backend
python init_db.py
```

6. **Start development servers**
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
uvicorn main:app --reload --port 8002
```

7. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:8002
- API Docs: http://localhost:8002/docs

## 📁 Project Structure

```
mentormap/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── mentors/     # Browse mentors
│   │   │   ├── sessions/    # My sessions
│   │   │   ├── roadmap/     # Learning roadmap
│   │   │   └── pricing/     # Pricing page
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   ├── main.py              # Entry point
│   └── requirements.txt
├── .env.example             # Environment template
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8002
```

**Backend (.env):**
```bash
DATABASE_URL=sqlite:///./mentormap.db
SECRET_KEY=your-secret-key-change-in-production
```

## 📱 Features Overview

### For Students
- Browse mentor profiles
- Book mentorship sessions
- Create personalized learning roadmaps
- Track progress
- Chat with mentors

### For Mentors
- Create mentor profile
- Set availability
- Manage sessions
- Provide feedback
- Track earnings

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy using Railway or Render
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

## 🔗 Related Projects

- [Main Apps Directory](../README.md)
- [Finance Tracker](../finance/)

---

**Built with ❤️ for learners and mentors**
