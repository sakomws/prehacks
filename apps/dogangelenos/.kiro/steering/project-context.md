# Dog Angelenos - Project Context

## Project Overview
Dog Angelenos is a comprehensive dog training business management platform for Los Angeles, featuring a modern Apple-inspired design with full dark mode support.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python FastAPI, SQLAlchemy, WebSockets
- **Database**: SQLite (PostgreSQL-ready)

## Key Features
1. **Public Website**: Homepage, classes, packages, trainers, events, about, newsletter
2. **Booking System**: Real-time booking with email notifications
3. **Authentication**: Role-based access (customer, trainer, admin)
4. **Admin Dashboard**: Complete business management interface
5. **Real-time Chat**: WebSocket-based communication
6. **Content Management**: Dynamic content via API
7. **Events System**: Event registration and management
8. **Newsletter**: Subscriber management and distribution
9. **Trainers Management**: Full CRUD for trainer profiles
10. **Dark Mode**: System-wide theme support with user preferences

## Architecture Patterns
- RESTful API design
- Component-based UI architecture
- Context providers for global state
- Real-time WebSocket connections
- Database-driven content management

## Development Guidelines
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Implement responsive mobile-first design
- Maintain dark mode compatibility
- Use Tailwind utility classes
- Implement proper error handling
- Add loading states for async operations

## API Endpoints
- `/api/bookings` - Booking management
- `/api/trainers` - Trainer CRUD operations
- `/api/events` - Event management
- `/api/newsletter` - Newsletter operations
- `/api/content/*` - Dynamic content management
- `/api/admin/*` - Admin operations
- `/ws/chat/{booking_id}` - WebSocket chat

## Design System
- **Colors**: Pink-500, Purple-500, Orange-500 gradients
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent 4px/8px grid
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Emoji-based for simplicity and charm

## Los Angeles Focus
All content, SEO, and features are optimized for Los Angeles dog training market with specific neighborhood targeting (West Hollywood, Santa Monica, Downtown LA, Silver Lake, Venice Beach).
