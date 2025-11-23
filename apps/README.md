# 🚀 Apps Directory

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

This directory contains production-ready applications and hackathon projects built for rapid prototyping, demonstration, and real-world use cases.

## 📋 Available Applications

### 🧳 Travel - Beacon Travel Agent

**Location:** `travel/beacon/`

A comprehensive AI-powered travel companion system with 7 specialized agents that provide real-time search and booking capabilities for all travel needs.

#### Features
- **7 AI Agents** - Each specialized for different travel domains
- **Real-time Data** - Live web scraping with BrightData API
- **AI Scoring** - Intelligent recommendations based on multiple factors
- **Direct Booking** - Integration with booking platforms
- **Modern UI** - Next.js 15 with TypeScript and Tailwind CSS
- **Health Monitoring** - Real-time agent status and performance metrics

#### Agents
| Agent | Port | Description |
|-------|------|-------------|
| ✈️ Flight | 8000 | Real-time flight search with multi-airline comparison |
| 🍽️ Food | 8001 | Restaurant discovery with cuisine filtering and reservations |
| 🎯 Leisure | 8002 | Activity and entertainment search with booking |
| 🛍️ Shopping | 8003 | Product search with brand matching and purchase links |
| 🏨 Stay | 8004 | Hotel search with amenity matching and booking |
| 💼 Work | 8005 | Coworking space discovery with location-based search |
| 🚌 Commute | 8006 | Transportation and commute options |

#### Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11
- **Data Sources:** BrightData API, AI21 API
- **Architecture:** Microservices with API Gateway

#### Quick Start
```bash
cd travel/beacon
./start_all.sh
# Open http://localhost:3000
```

#### Documentation
- [Complete README](travel/beacon/README.md)
- [API Documentation](travel/beacon/docs/api-documentation.md)
- [Architecture Guide](travel/beacon/docs/architecture.md)
- [Deployment Guide](travel/beacon/docs/deployment-guide.md)

---

### 💰 Finance - Personal Finance Tracker

**Location:** `finance/`

A comprehensive personal finance management application for tracking expenses, managing budgets, monitoring investments, and gaining insights into financial health.

#### Features
- **Financial Dashboard** - Real-time overview of financial status
- **Expense Tracking** - Record and categorize transactions
- **Budget Management** - Set and track spending limits
- **Investment Portfolio** - Monitor investment performance
- **Dark Mode** - Beautiful light/dark theme support

#### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components:** Radix UI, Recharts
- **Database:** Prisma, Supabase
- **Forms:** React Hook Form, Zod validation

#### Quick Start
```bash
cd finance
npm install
npm run dev
# Open http://localhost:3000
```

#### Documentation
- [Complete README](finance/README.md)
- [API Documentation](finance/API_DOCUMENTATION.md)

---

### 🧬 Longevity - EveryBallWins Health Platform

**Location:** `longevity/everyballwins/`

AI-powered health analytics platform combining food analysis, barcode scanning, and biological age assessment for informed health decisions.

#### Features
- **AI Food Analysis** - OpenAI Vision API for nutritional analysis
- **Barcode Scanning** - Instant product nutritional information
- **BioAge Analysis** - Real-time biological age assessment
- **Sugar Tracking** - Visual calendar for daily sugar consumption
- **Health Challenges** - Gamified health improvement system

#### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript
- **AI:** OpenAI Vision API, GPT-4
- **Backend:** Python WebSocket server
- **Database:** Supabase
- **Scanning:** ZXing library

#### Quick Start
```bash
cd longevity/everyballwins
yarn install
yarn dev
# Open http://localhost:3000
```

#### Documentation
- [Complete README](longevity/everyballwins/README.md)

---

### 🎯 Hackathon - Prehacks Platform

**Location:** `hackathon/prehacks/`

Comprehensive platform for discovering, managing, and showcasing hackathon projects with real-time collaboration and deployment features.

#### Features
- **Project Discovery** - Browse and search hackathon projects
- **Code Editor** - Integrated Monaco editor
- **Real-time Collaboration** - Team coding features
- **One-click Deployment** - Deploy to multiple platforms
- **Analytics Dashboard** - Track project metrics

#### Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, PostgreSQL, Redis
- **Editor:** Monaco Editor
- **Infrastructure:** Docker, Git integration

#### Quick Start
```bash
cd hackathon/prehacks
npm install
npm run dev
# Open http://localhost:3000
```

#### Documentation
- [Complete README](hackathon/prehacks/README.md)

---

### 💼 Recruitment - JobHax Automation Suite

**Location:** `recruitment/jobhax/`

Comprehensive job application automation platform with AI-powered form filling, browser extension, and autonomous application system.

#### Features
- **Web Platform** - Full-featured job application interface
- **Browser Extension** - One-click applications
- **AI Form Filling** - LLM-powered intelligent form completion
- **Autonomous Agent** - Fully automated job applications
- **Real-time Monitoring** - Live progress tracking

#### Tech Stack
- **Frontend:** Web UI with real-time updates
- **Backend:** Python, Selenium automation
- **AI:** LLM integration for form filling
- **Browser:** Chrome extension

#### Quick Start
```bash
cd recruitment/jobhax
./setup.sh
# Follow platform-specific instructions
```

#### Documentation
- [Complete README](recruitment/README.md)
- [Demo Video](https://www.youtube.com/shorts/7ZRMaisLEjs)

---

### 🌐 Community - Social Platforms

**Location:** `community/`

Collection of community-focused social platforms and networking applications.

#### Platforms
- **lpm.vc** - Community platform
- **goup.vc** - Group networking
- **svaze.com** - Social engagement
- **sako.blog** - Blogging platform

#### Documentation
- [Complete README](community/README.md)

---

### 🏢 Platform - Business Solutions

**Location:** `platform/`

Enterprise-grade platform solutions for business automation and analytics.

#### Platforms
- **covibe.ai** - AI-powered business intelligence
- **phlanx.io** - Platform analytics and insights

#### Documentation
- [Complete README](platform/README.md)

## Adding New Applications

To add a new hackathon application:

1. **Create a new directory** in this `apps/` folder
2. **Follow the naming convention:** Use kebab-case (e.g., `my-awesome-app`)
3. **Include essential files:**
   - `README.md` - Comprehensive documentation
   - `package.json` or `requirements.txt` - Dependencies
   - `.env.example` - Environment variables template
   - `LICENSE` - License file
4. **Update this README** to include your new application
5. **Follow the project structure** established by existing apps

### Recommended Structure
```
apps/
├── my-new-app/
│   ├── README.md              # Comprehensive documentation
│   ├── package.json           # or requirements.txt
│   ├── .env.example          # Environment variables
│   ├── LICENSE               # License file
│   ├── src/                  # Source code
│   ├── docs/                 # Documentation
│   ├── tests/                # Test files
│   └── deploy/               # Deployment configs
└── README.md                 # This file
```

## Guidelines

### Documentation
- Each app should have comprehensive documentation
- Include setup instructions, API documentation, and examples
- Document the tech stack and architecture decisions
- Provide troubleshooting guides

### Code Quality
- Follow established coding standards
- Include proper error handling
- Write tests where appropriate
- Use meaningful variable and function names

### Deployment
- Provide clear deployment instructions
- Include environment variable documentation
- Consider containerization (Docker)
- Document any external dependencies

### Performance
- Optimize for hackathon demos
- Include performance metrics where relevant
- Document any known limitations
- Provide scaling recommendations

## Contributing

1. Fork the repository
2. Create a new app in the `apps/` directory
3. Follow the guidelines above
4. Update this README
5. Submit a pull request

## Support

For questions about specific applications, check their individual README files. For general questions about the apps directory structure, please open an issue.
