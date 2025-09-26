# 🚀 Prehacks Platform

A comprehensive platform for discovering, managing, and showcasing hackathon projects. Built for developers who want to quickly prototype, share, and collaborate on innovative ideas.

## 🌟 Features

### 🎯 Project Discovery
- **Browse Projects** - Discover hackathon projects by category, technology, and status
- **Advanced Search** - Filter by tech stack, difficulty level, and completion status
- **Trending Projects** - See what's popular and gaining traction
- **Featured Projects** - Highlighted projects from the community

### 🛠️ Project Management
- **Quick Setup** - One-click project templates for popular frameworks
- **Live Preview** - Real-time preview of your project as you build
- **Version Control** - Built-in Git integration for project history
- **Collaboration** - Invite team members and manage permissions

### 📊 Analytics & Insights
- **Project Metrics** - Track views, forks, and engagement
- **Tech Stack Analysis** - See what technologies are trending
- **Performance Monitoring** - Built-in performance tracking
- **Community Stats** - Leaderboards and achievement system

### 🔧 Developer Tools
- **Code Editor** - Integrated Monaco editor with syntax highlighting
- **Terminal** - Built-in terminal for running commands
- **Package Manager** - One-click dependency management
- **Deployment** - Deploy to multiple platforms with one click

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Monaco Editor** - VS Code editor in browser
- **React Query** - Data fetching and caching

### Backend
- **FastAPI** - High-performance Python API
- **PostgreSQL** - Relational database
- **Redis** - Caching and session storage
- **Docker** - Containerization
- **Git Integration** - Git operations via API

### Infrastructure
- **Vercel** - Frontend deployment
- **Railway/Render** - Backend deployment
- **GitHub** - Code repository and CI/CD
- **Cloudflare** - CDN and security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone and setup**
```bash
cd apps/hackathon/prehacks
git clone <repository-url> .
npm install
pip install -r requirements.txt
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**
```bash
# Start PostgreSQL and Redis
# Run migrations
python manage.py migrate
```

4. **Start development servers**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
python main.py

# Terminal 3: Worker (optional)
python worker.py
```

5. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
prehacks/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities and configs
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── migrations/         # Database migrations
│   └── requirements.txt
├── shared/                  # Shared types and utilities
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
└── docker-compose.yml      # Local development setup
```

## 🎨 Key Components

### Project Browser
- Grid/list view toggle
- Advanced filtering
- Search with autocomplete
- Infinite scroll pagination

### Project Editor
- File tree navigation
- Multi-tab editor
- Live preview panel
- Integrated terminal

### Project Dashboard
- Project overview
- Team management
- Deployment status
- Analytics charts

### Community Features
- User profiles
- Project reviews
- Discussion forums
- Achievement system

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/{id}/projects` - Get user's projects

### Collaboration
- `POST /api/projects/{id}/collaborators` - Add collaborator
- `DELETE /api/projects/{id}/collaborators/{user_id}` - Remove collaborator

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Railway)
```bash
railway login
railway link
railway up
```

### Database
- Production: Managed PostgreSQL (Railway/Supabase)
- Development: Local PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../../LICENSE) for details.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-org/prehacks/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/prehacks/discussions)

---

**Built with ❤️ for the hackathon community**
