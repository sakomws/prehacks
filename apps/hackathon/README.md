# 🚀 Hackathon Applications

This directory contains hackathon applications and projects built for rapid prototyping and demonstration.

## Available Applications

### 🎯 Prehacks Platform
**Location:** `prehacks/`

A comprehensive platform for discovering, managing, and showcasing hackathon projects. Built with a modern, clean UI inspired by OpenAI's design language.

**Key Features:**
- **Project Discovery** - Browse and search hackathon projects
- **Real-time Collaboration** - Code together with integrated editor
- **Team Building** - Find and connect with developers
- **One-click Deployment** - Deploy to multiple platforms
- **Analytics Dashboard** - Track project metrics and engagement

**Tech Stack:**
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, PostgreSQL, Redis, Docker
- **Features:** Monaco Editor, Real-time collaboration, Git integration

**Quick Start:**
```bash
cd prehacks
npm install
npm run dev
# Open http://localhost:3000
```

### 🚢 Ship.fail
**Location:** `ship.fail/`

*Coming soon...*

## Adding New Applications

To add a new hackathon application:

1. **Create a new directory** in this `hackathon/` folder
2. **Follow the naming convention:** Use kebab-case (e.g., `my-awesome-app`)
3. **Include essential files:**
   - `README.md` - Comprehensive documentation
   - `package.json` or `requirements.txt` - Dependencies
   - `.env.example` - Environment variables template
   - `LICENSE` - License file
4. **Update this README** to include your new application
5. **Follow the project structure** established by existing apps

## Guidelines

### Design Principles
- **Clean & Minimal** - Follow modern design patterns
- **Responsive** - Mobile-first approach
- **Accessible** - WCAG 2.1 compliance
- **Fast** - Optimize for performance

### Development Standards
- **TypeScript** - Use TypeScript for type safety
- **ESLint & Prettier** - Consistent code formatting
- **Testing** - Include unit and integration tests
- **Documentation** - Comprehensive README and API docs

### Deployment
- **Frontend** - Deploy to Vercel or Netlify
- **Backend** - Deploy to Railway, Render, or AWS
- **Database** - Use managed PostgreSQL (Supabase, PlanetScale)
- **Monitoring** - Include error tracking and analytics

## Contributing

1. Fork the repository
2. Create a new hackathon app in this directory
3. Follow the guidelines above
4. Update this README
5. Submit a pull request

## Support

For questions about specific hackathon applications, check their individual README files. For general questions about the hackathon directory structure, please open an issue.
