# 🤖 Covibe.ai - AI-Powered Coding Agent

![Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

An intelligent AI-powered coding agent that assists developers with code generation, debugging, refactoring, and architectural decisions. Built with advanced LLM integration and real-time collaboration features.

**Website:** [covibe.ai](https://covibe.ai)

## 🔗 Quick Links

- [Main Apps Directory](../README.md)
- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## 🌟 Features

### 🧠 AI-Powered Code Generation
- **Smart Code Completion** - Context-aware code suggestions
- **Multi-language Support** - Support for 50+ programming languages
- **Framework Integration** - React, Vue, Angular, Django, FastAPI, and more
- **Best Practices** - Follows industry standards and patterns
- **Documentation Generation** - Auto-generate comprehensive docs

### 🔍 Intelligent Code Analysis
- **Bug Detection** - Identify potential issues before runtime
- **Security Scanning** - Detect vulnerabilities and security risks
- **Performance Optimization** - Suggest performance improvements
- **Code Quality Metrics** - Track complexity, maintainability, and coverage
- **Dependency Analysis** - Manage and update dependencies

### 🛠️ Refactoring & Optimization
- **Automated Refactoring** - Improve code structure and readability
- **Design Pattern Suggestions** - Apply appropriate design patterns
- **Code Smell Detection** - Identify and fix code smells
- **Test Generation** - Auto-generate unit and integration tests
- **Migration Assistance** - Help migrate between frameworks/versions

### 💬 Interactive Chat Interface
- **Natural Language Queries** - Ask questions in plain English
- **Code Explanations** - Understand complex code snippets
- **Debugging Assistance** - Step-by-step debugging help
- **Architecture Advice** - Get guidance on system design
- **Real-time Collaboration** - Work with team members

### 🚀 Development Tools
- **Integrated Terminal** - Execute commands directly
- **Git Integration** - Commit, push, pull with AI assistance
- **Project Scaffolding** - Generate project templates
- **API Testing** - Test endpoints with AI-generated test cases
- **Database Query Builder** - Generate optimized SQL queries

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15, React 19
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS, Radix UI
- **Editor:** Monaco Editor (VS Code)
- **State Management:** Zustand, React Query
- **Real-time:** WebSocket, Server-Sent Events

### Backend
- **API:** FastAPI, Python 3.11+
- **AI/ML:** OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Code Analysis:** Tree-sitter, AST parsing
- **Database:** PostgreSQL, Redis
- **Search:** Elasticsearch
- **Queue:** Celery, Redis

### Infrastructure
- **Deployment:** Vercel (Frontend), Railway (Backend)
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, DataDog
- **Analytics:** PostHog, Mixpanel

## 📁 Project Structure

```
covibe.ai/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── chat/        # Chat interface
│   │   │   ├── editor/      # Code editor
│   │   │   ├── projects/    # Project management
│   │   │   └── dashboard/   # Analytics dashboard
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # Base UI components
│   │   │   ├── editor/      # Editor components
│   │   │   ├── chat/        # Chat components
│   │   │   └── code/        # Code display components
│   │   ├── lib/             # Utilities
│   │   │   ├── api.ts       # API client
│   │   │   ├── ai.ts        # AI utilities
│   │   │   └── utils.ts     # Helper functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   ├── chat.py      # Chat endpoints
│   │   │   ├── code.py      # Code analysis
│   │   │   ├── projects.py  # Project management
│   │   │   └── ai.py        # AI endpoints
│   │   ├── core/            # Core functionality
│   │   │   ├── ai/          # AI integrations
│   │   │   ├── analysis/    # Code analysis
│   │   │   ├── generation/  # Code generation
│   │   │   └── refactor/    # Refactoring engine
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── config.py        # Configuration
│   ├── tests/               # Test suite
│   ├── requirements.txt     # Python dependencies
│   └── main.py              # Entry point
├── docs/                     # Documentation
│   ├── API.md               # API documentation
│   ├── ARCHITECTURE.md      # Architecture guide
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── CONTRIBUTING.md      # Contributing guide
├── scripts/                  # Utility scripts
│   ├── setup.sh             # Setup script
│   ├── dev.sh               # Development script
│   └── deploy.sh            # Deployment script
├── docker-compose.yml        # Docker setup
├── .env.example             # Environment template
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Installation

1. **Clone and navigate**
```bash
cd apps/covibe.ai
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

5. **Set up database**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
cd backend
alembic upgrade head
```

6. **Start development servers**
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 3: Worker (optional)
cd backend
celery -A app.worker worker --loglevel=info
```

7. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Quick Start with Docker

```bash
docker-compose up
# Open http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env):**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/covibe
REDIS_URL=redis://localhost:6379/0

# AI APIs
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_API_KEY=your-google-key

# Authentication
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## 📱 Usage

### Chat Interface
1. Open the chat interface
2. Ask questions in natural language
3. Get code suggestions, explanations, and debugging help
4. Copy code snippets directly to your project

### Code Editor
1. Create or open a project
2. Use the integrated Monaco editor
3. Get real-time AI suggestions
4. Run code analysis and tests
5. Commit changes with AI-generated messages

### Project Management
1. Create a new project from templates
2. Invite team members
3. Track progress and metrics
4. Deploy with one click

## 🧪 API Endpoints

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/{id}` - Delete chat

### Code Analysis
- `POST /api/code/analyze` - Analyze code
- `POST /api/code/explain` - Explain code
- `POST /api/code/refactor` - Refactor code
- `POST /api/code/generate` - Generate code

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### AI
- `POST /api/ai/complete` - Code completion
- `POST /api/ai/debug` - Debug assistance
- `POST /api/ai/test` - Generate tests
- `POST /api/ai/document` - Generate documentation

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway)
```bash
cd backend
railway login
railway link
railway up
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app tests/
```

### E2E Tests
```bash
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Join our Discord community
- Email: support@covibe.ai

## 🔗 Related Projects

- [Main Apps Directory](../README.md)
- [Finance Apps](../finance/)
- [Platform Apps](../platform/)
- [Hackathon Apps](../hackathon/)

## 🎯 Roadmap

- [ ] Multi-model AI support (GPT-4, Claude, Gemini)
- [ ] Voice-to-code interface
- [ ] Mobile app (iOS/Android)
- [ ] VS Code extension
- [ ] JetBrains plugin
- [ ] Self-hosted option
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] Team collaboration tools
- [ ] Custom model training

## 🏆 Features Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Code Generation | ✅ Limited | ✅ Unlimited | ✅ Unlimited |
| Code Analysis | ✅ Basic | ✅ Advanced | ✅ Advanced |
| AI Models | GPT-3.5 | GPT-4, Claude | All + Custom |
| Projects | 3 | Unlimited | Unlimited |
| Team Members | 1 | 5 | Unlimited |
| API Access | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ 24/7 |
| Custom Deployment | ❌ | ❌ | ✅ |

---

**Built with ❤️ for developers by developers**
