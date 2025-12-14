# AI Parenting Guide Platform

An interactive educational platform for ethical AI development based on De Kai's "Raising AI" concepts. This platform transforms complex AI ethics concepts into accessible learning experiences through the metaphor of "parenting" AI systems.

## 🎯 Project Overview

The AI Parenting Guide Platform serves diverse audiences - from curious general users to technical professionals and educators - helping them understand their role as ethical guides for AI development. The platform combines structured learning modules, interactive tools, community discussions, and practical resources.

## 🏗️ Project Structure

```
apps/ai-parenting-guide/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Configuration and database
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js 14 app directory
│   ├── components/     # React components
│   ├── lib/           # Utilities and configurations
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript type definitions
├── shared/             # Shared types and utilities
│   └── types/         # Common TypeScript interfaces
├── docker-compose.yml  # Development environment
├── start-dev.sh       # Development startup script
└── package.json       # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Docker** and Docker Compose
- **Google AI Studio** account (for Gemini API)

### 1. Clone and Setup

```bash
cd apps/ai-parenting-guide

# Make startup script executable
chmod +x start-dev.sh

# Run the development setup
./start-dev.sh
```

### 2. Environment Configuration

The startup script will create a `.env` file from `.env.example`. **Important**: Update these values:

```bash
# Required: Get from Google AI Studio
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Required: Generate a secure secret
JWT_SECRET_KEY=your_super_secret_jwt_key_here

# Optional: Configure for production
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_parenting_guide
REDIS_URL=redis://localhost:6379/0
```

### 3. Access the Platform

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: PostgreSQL on port 5432
- **Redis**: Redis on port 6379

## 🛠️ Development Commands

```bash
# Start full development environment
npm run dev

# Start individual services
npm run dev:frontend    # Next.js frontend only
npm run dev:backend     # FastAPI backend only

# Build for production
npm run build

# Run tests
npm run test
npm run test:frontend
npm run test:backend

# Code quality
npm run lint
npm run lint:fix
```

## 🏛️ Architecture

### Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, React Query
- **Backend**: Python FastAPI, SQLAlchemy, Pydantic, Redis
- **Database**: PostgreSQL 15 with full-text search
- **AI Integration**: Google Gemini API for multimodal processing
- **Authentication**: JWT with role-based access control
- **Deployment**: Docker containers with health checks

### Key Features

- **Multimodal AI Integration**: Text, image, audio, and video processing
- **Personalized Learning**: AI-driven content adaptation
- **Community Platform**: Forums with AI-powered moderation
- **Interactive Tools**: Bias assessment and ethics simulations
- **Accessibility**: Screen reader support, keyboard navigation
- **Mobile Responsive**: Progressive Web App capabilities

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

### Database Management

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# View logs
docker-compose logs postgres
docker-compose logs redis

# Connect to database
docker exec -it ai-parenting-postgres psql -U postgres -d ai_parenting_guide
```

## 🧪 Testing Strategy

The platform uses comprehensive testing approaches:

- **Unit Tests**: Individual component and function testing
- **Property-Based Tests**: Using Hypothesis (Python) and fast-check (TypeScript)
- **Integration Tests**: End-to-end user journey validation
- **AI Testing**: Gemini API response consistency and safety validation

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Property-based testing
cd backend && python -m pytest tests/property/
```

## 📋 Requirements Validation

This implementation addresses the following requirements:

- **Requirements 1.1**: Intuitive platform interface with clear navigation
- **Requirements 1.2**: Accessible content for non-technical audiences
- **Requirements 2.1**: Interactive bias assessment tools
- **Requirements 3.1**: Community forum with threaded discussions
- **Requirements 4.1**: Advanced content for technical professionals
- **Requirements 5.1**: Age-appropriate educational materials
- **Requirements 6.1**: Content management and moderation tools
- **Requirements 7.1**: Misinformation detection education
- **Requirements 8.1**: Philosophical AI discussion platform

## 🔒 Security Features

- JWT authentication with secure token management
- Role-based access control (learner, educator, expert, admin)
- AI-powered content moderation
- Rate limiting and DDoS protection
- HTTPS enforcement in production
- Child safety and privacy protections

## 🌐 Deployment

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Health checks
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

### Environment Variables for Production

```bash
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql://user:pass@prod-db:5432/ai_parenting_guide
REDIS_URL=redis://prod-redis:6379/0
FRONTEND_URL=https://ai-parenting-guide.com
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier for frontend, Black + Flake8 for backend)
2. Write tests for new features
3. Update documentation for API changes
4. Ensure all tests pass before submitting PRs

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Troubleshooting

### Common Issues

1. **Docker services not starting**: Check Docker is running and ports are available
2. **Database connection errors**: Ensure PostgreSQL is healthy (`docker-compose ps`)
3. **Gemini API errors**: Verify your API key in `.env` file
4. **Frontend build errors**: Clear `.next` folder and reinstall dependencies
5. **Backend import errors**: Activate virtual environment and check Python path

### Getting Help

- Check the logs: `docker-compose logs [service-name]`
- Verify environment variables are set correctly
- Ensure all prerequisites are installed
- Review the API documentation at `/docs` endpoint