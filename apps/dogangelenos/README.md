# 🎃 Dog Angelenos - LA's Premier Dog Training Platform

> **Kiroween 2024 Hackathon Submission - Costume Contest Category**

A comprehensive dog training business management system with a haunting, Apple-inspired dark mode UI. Built with Next.js and FastAPI, powered by Kiro AI.

## 🌟 Overview

Dog Angelenos is a full-stack web application designed for managing a luxury dog training business in Los Angeles. It features a customer-facing website, real-time chat, booking system, and a complete admin dashboard.

**🎭 Kiroween Submission:** This project showcases Kiro's vibe coding, steering docs, and iterative refinement capabilities through a polished, dark mode UI that transforms dog training into a premium experience. See [KIROWEEN_SUBMISSION.md](./KIROWEEN_SUBMISSION.md) for full details.

## 🚀 Quick Start

```bash
# Start development servers
./start-dev.sh
```

- **Frontend:** http://localhost:3004
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:3004/admin

## 📚 Documentation

### Quick Start
- **[START_HERE.md](./START_HERE.md)** - Main entry point for judges and developers

### Hackathon Submission
- **[KIROWEEN_SUBMISSION.md](./docs/hackathon/KIROWEEN_SUBMISSION.md)** - Official submission
- **[JUDGES_QUICK_START.md](./docs/hackathon/JUDGES_QUICK_START.md)** - 5-minute quick start
- **[HACKATHON_STORY.md](./docs/hackathon/HACKATHON_STORY.md)** - Inspiration and journey
- **[KIRO_USAGE_GUIDE.md](./docs/hackathon/KIRO_USAGE_GUIDE.md)** - Detailed Kiro usage

### Deployment
- **[DEPLOY_NOW.md](./docs/deployment/DEPLOY_NOW.md)** - Quick deployment guide
- **[AWS_DEPLOYMENT.md](./docs/deployment/AWS_DEPLOYMENT.md)** - Comprehensive AWS guide
- **[NGINX_SHARED_CONFIG.md](./docs/deployment/NGINX_SHARED_CONFIG.md)** - Shared instance setup

### Feature Documentation

All feature documentation is in the [`docs/`](./docs/) folder:

### Getting Started
- [Quick Start Guide](./docs/QUICK_START.md) - Get up and running quickly
- [Setup Guide](./docs/SETUP.md) - Detailed setup instructions
- [Demo Users](./docs/DEMO_USERS.md) - Test accounts and credentials

### Features & Guides
- [Features Overview](./docs/FEATURES.md) - Complete feature list
- [Admin Guide](./docs/ADMIN_GUIDE.md) - Admin panel documentation
- [Content Management](./docs/CONTENT_MANAGEMENT.md) - Managing site content
- [Newsletter Functionality](./docs/NEWSLETTER_FUNCTIONALITY.md) - Newsletter system guide
- [Chat Features](./docs/CHAT_FEATURES.md) - Real-time chat system

### Technical Documentation
- [API Setup](./docs/API_SETUP.md) - Backend API documentation
- [SEO Guide](./docs/SEO_GUIDE.md) - SEO optimization details
- [Logo Guide](./docs/LOGO_GUIDE.md) - Branding guidelines

### Updates & Testing
- [Content Updates](./docs/CONTENT_UPDATES.md) - Live content update functionality
- [About Page Updates](./docs/ABOUT_UPDATE_TEST.md) - Testing about page updates

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** React Context API

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (dev) / PostgreSQL (production)
- **ORM:** SQLAlchemy
- **WebSockets:** Real-time chat support
- **Email:** SMTP integration

## 📁 Project Structure

```
dogangelenos/
├── frontend/           # Next.js frontend application
│   ├── app/           # App router pages and components
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # FastAPI backend application
│   ├── main.py       # Main API server
│   ├── database.py   # Database models
│   ├── content.py    # Content management API
│   ├── newsletter.py # Newsletter API
│   └── requirements.txt
├── docs/             # Documentation
└── start-dev.sh      # Development startup script
```

## ✨ Key Features

### Core Functionality
- 🐕 **Booking System** - Schedule training sessions
- 💬 **Real-time Chat** - WebSocket-based trainer-customer communication
- 👥 **User Management** - Customer, trainer, and admin roles
- 📧 **Newsletter System** - Subscriber management and content distribution
- 📅 **Events Calendar** - Training events and workshops
- 📦 **Training Packages** - Customizable training programs
- 🎓 **Trainers Management** - Full CRUD for trainer profiles
- 🎨 **Content Management** - Dynamic content editing via admin panel
- 📊 **Admin Dashboard** - Complete business management interface
- 🔐 **Authentication** - Role-based access control

### 👻 Haunting UI Features (Kiroween Special)
- 🌙 **Dark Mode Mastery** - Complete dark theme with smooth transitions
- 🎨 **Gradient Sorcery** - Mesmerizing pink-purple-orange gradients
- ✨ **Smooth Animations** - Ghost-like transitions using Framer Motion
- 💎 **Apple-Inspired Design** - Premium, polished interface
- 📱 **Responsive Design** - Mobile-first approach with perfect scaling

## 🎯 Demo Accounts

### Admin
- Email: `admin@dogangelenos.com`
- Password: `admin123`

### Trainer
- Email: `trainer@dogangelenos.com`
- Password: `trainer123`

### Customer
- Email: `customer@dogangelenos.com`
- Password: `customer123`

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd apps/dogangelenos
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **Start development servers**
```bash
cd ..
./start-dev.sh
```

## 📝 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend
```env
DATABASE_URL=sqlite:///./dogangelenos.db
```

## 🚢 Deployment

See [API Setup Guide](./docs/API_SETUP.md) for production deployment instructions.

## 📄 License

Copyright © 2025 Dog Angelenos. All rights reserved.

## 🤝 Support

For questions or support, contact: woof@dogangelenos.com

---

## 🎃 Kiroween Hackathon

This project was built for the Kiroween 2024 Hackathon in the **Costume Contest** category. It demonstrates:

- **Vibe Coding**: Natural language development with Kiro
- **Steering Docs**: Project context and coding standards
- **Iterative Refinement**: Building features through conversation
- **Polished UI**: Haunting dark mode with Apple-inspired design

See [KIROWEEN_SUBMISSION.md](./KIROWEEN_SUBMISSION.md) for complete submission details.

---

**Built with 🖤 using Kiro for LA's dog community** 🌴🐾🎃
