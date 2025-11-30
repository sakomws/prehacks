# Dog Angelenos Backend API

Python FastAPI backend for the Dog Angelenos dog training website.

## Features

- 🔐 Google OAuth authentication
- 📅 Booking management system
- 📧 Email notifications
- 💾 Database integration (SQLite/PostgreSQL)
- 🔒 JWT token authentication
- 📊 RESTful API endpoints

## Setup

### Quick Start with Docker (Recommended)

```bash
cd apps/dogangelenos/backend
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- FastAPI server on port 8000

### Manual Setup

#### 1. Start PostgreSQL

**Option A: Docker**
```bash
docker-compose up -d postgres
```

**Option B: Local Installation**
See `POSTGRES_SETUP.md` for detailed instructions.

#### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

For PostgreSQL:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/dogangelenos
```

#### 5. Initialize Database

```bash
python init_db.py
```

This creates tables and sample data.

#### 6. Run the Server

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

API will be available at: http://localhost:8000
API Docs: http://localhost:8000/docs

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Bookings

- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get specific booking
- `PUT /api/bookings/{id}/status` - Update booking status

### Authentication

- `POST /api/auth/google` - Google OAuth login

### Programs & Locations

- `GET /api/programs` - Get training programs
- `GET /api/locations` - Get LA locations

## Example Requests

### Create Booking

```bash
curl -X POST "http://localhost:8000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "dog_name": "Max",
    "owner_name": "John Doe",
    "email": "john@example.com",
    "phone": "(310) 555-0123",
    "program": "Basic Obedience - $249",
    "preferred_date": "2024-12-01",
    "preferred_time": "Morning (9am-12pm)",
    "location": "West Hollywood"
  }'
```

### Get Programs

```bash
curl "http://localhost:8000/api/programs"
```

## Database

### SQLite (Development)

Default configuration uses SQLite for easy development.

### PostgreSQL (Production)

Update `.env`:

```
DATABASE_URL=postgresql://user:password@localhost/dogangelenos
```

### Initialize Database

```python
from database import init_db
init_db()
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - http://localhost:3004
   - Your production domain
6. Copy Client ID and Secret to `.env`

## Email Service

### SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API key
3. Add to `.env`:
   ```
   SENDGRID_API_KEY=your_api_key
   FROM_EMAIL=woof@dogangelenos.com
   ```

## Production Deployment

### Using Docker

```bash
docker build -t dogangelenos-api .
docker run -p 8000:8000 dogangelenos-api
```

### Using Heroku

```bash
heroku create dogangelenos-api
git push heroku main
```

### Environment Variables

Set these in production:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Strong random key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `SENDGRID_API_KEY` - SendGrid API key

## Testing

```bash
pytest tests/
```

## Security

- ✅ CORS configured for frontend
- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection protection (SQLAlchemy)
- ✅ Input validation (Pydantic)

## Next Steps

1. Integrate with PostgreSQL database
2. Implement Google OAuth verification
3. Add SendGrid email integration
4. Add payment processing (Stripe)
5. Add admin dashboard
6. Add booking reminders
7. Add analytics tracking

## Support

For issues or questions, see the main project README.
