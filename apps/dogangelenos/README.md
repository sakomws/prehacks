# Dog Angelenos - LA's Premier Dog Training Platform

A comprehensive dog training business management system built with Next.js and FastAPI.

## 🌟 Overview

Dog Angelenos is a full-stack web application designed for managing a luxury dog training business in Los Angeles. It features a customer-facing website, real-time chat, booking system, and a complete admin dashboard.

## 🚀 Quick Start

```bash
# Start development servers
./start-dev.sh
```

- **Frontend:** http://localhost:3004
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:3004/admin

## 📚 Documentation

All documentation is located in the [`docs/`](./docs/) folder:

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

- 🐕 **Booking System** - Schedule training sessions
- 💬 **Real-time Chat** - WebSocket-based trainer-customer communication
- 👥 **User Management** - Customer, trainer, and admin roles
- 📧 **Newsletter System** - Subscriber management and content distribution
- 📅 **Events Calendar** - Training events and workshops
- 📦 **Training Packages** - Customizable training programs
- 🎨 **Content Management** - Dynamic content editing via admin panel
- 📊 **Admin Dashboard** - Complete business management interface
- 🔐 **Authentication** - Role-based access control
- 📱 **Responsive Design** - Mobile-first approach

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

**Built with ❤️ for LA's dog community** 🌴🐾
