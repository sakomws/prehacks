# Event Management Platform

A comprehensive event and community calendar platform that enables users to create calendars, organize events, and build communities around shared interests.

## Features

- Calendar-based event organization
- User authentication and profiles
- Event creation and management
- Registration and payment processing
- Real-time notifications
- Search and discovery
- Premium Calendar Plus features

## Tech Stack

**Backend:**
- FastAPI with SQLAlchemy
- PostgreSQL database
- Redis for caching
- Stripe for payments

**Frontend:**
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query

## Getting Started

1. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Documentation

Once running, visit http://localhost:8000/docs for the interactive API documentation.