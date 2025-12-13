# Goup.vc - Event Management Platform

A comprehensive event and community calendar platform that enables users to create calendars, organize events, and build communities around shared interests.

## Features

- **Calendar Management**: Create branded calendars with customizable settings
- **Event Organization**: Create, publish, and manage events with detailed information
- **Event Discovery**: Search and filter events by date, location, and category
- **Registration System**: Handle event registrations with approval workflows
- **Payment Processing**: Integrated Stripe payment processing for paid events
- **Notification System**: Multi-channel notifications (email, push, in-app)
- **Premium Features**: Calendar Plus subscription with enhanced capabilities
- **Community Building**: Calendar subscriptions and follower system

## Technology Stack

### Backend
- **FastAPI**: High-performance REST API framework
- **SQLAlchemy**: Database ORM with async support
- **Alembic**: Database migration management
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Pydantic**: Data validation and serialization

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **TanStack Query**: Data fetching and caching
- **NextAuth**: Authentication solution

### Infrastructure
- **Docker**: Containerized development environment
- **Stripe**: Payment processing
- **Email Service**: Transactional email delivery

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

1. Navigate to the project directory:
   ```bash
   cd apps/goup.vc
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   alembic upgrade head
   ```

5. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
apps/goup.vc/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Core configuration
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── api/            # API routes
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # Application entry point
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript types
│   ├── package.json       # Node.js dependencies
│   └── next.config.js     # Next.js configuration
├── scripts/               # Development scripts
├── docker-compose.yml     # Docker services
├── Makefile              # Development commands
└── README.md             # This file
```

## Development Commands

Use the Makefile for common development tasks:

```bash
# Set up development environment
make setup

# Start Docker services
make docker-up

# Stop Docker services
make docker-down

# Check service health
make health-check

# Start backend development server
make dev-backend

# Start frontend development server
make dev-frontend

# Run database migrations
make migrate

# Create new migration
make create-migration MSG="your migration message"

# Test project structure
make test-structure

# Clean up environment
make clean
```

## API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Migrations

To create a new migration:
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:
```bash
alembic upgrade head
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

### Security
- `SECRET_KEY`: JWT secret key (change in production)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

### External Services
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `EMAIL_SERVICE_API_KEY`: Email service API key

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXTAUTH_URL`: NextAuth URL
- `NEXTAUTH_SECRET`: NextAuth secret

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.