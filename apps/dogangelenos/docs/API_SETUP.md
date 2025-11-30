# Dog Angelenos API Setup

## Overview

The Dog Angelenos platform now uses a FastAPI backend with SQLite database for content management. All content (About page, Classes, Packages) is stored in the database and accessed via REST API.

## Backend Setup

### Prerequisites
- Python 3.8+
- pip or uv package manager

### Installation

1. Navigate to the backend directory:
```bash
cd apps/dogangelenos/backend
```

2. Install dependencies:
```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart websockets
```

Or with uv:
```bash
uv pip install fastapi uvicorn sqlalchemy pydantic python-multipart websockets
```

### Running the Backend

Start the FastAPI server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd apps/dogangelenos/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (already created):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Frontend

Start the Next.js development server:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:3004`

## API Endpoints

### Content Management

#### About Content
- `GET /api/content/about` - Get about page content
- `PUT /api/content/about` - Update about page content

#### Classes
- `GET /api/content/classes` - Get all training classes
- `POST /api/content/classes` - Create a new class
- `PUT /api/content/classes/{id}` - Update a class
- `DELETE /api/content/classes/{id}` - Delete a class

#### Packages
- `GET /api/content/packages` - Get all training packages
- `POST /api/content/packages` - Create a new package
- `PUT /api/content/packages/{id}` - Update a package
- `DELETE /api/content/packages/{id}` - Delete a package

## Database

### Location
- SQLite database: `apps/dogangelenos/backend/dogangelenos.db`

### Tables
- `about_content` - About page content
- `classes` - Training classes
- `packages` - Training packages
- `bookings` - Customer bookings
- `users` - User accounts
- `chat_messages` - Chat messages

### Initialization
The database is automatically created and initialized with default content on first run.

### Resetting Database
To reset the database to default content:
```bash
cd apps/dogangelenos/backend
rm dogangelenos.db
python main.py
```

## Data Flow

1. **Frontend loads** → Fetches content from API
2. **Admin edits content** → Sends PUT/POST/DELETE request to API
3. **API updates database** → Returns updated data
4. **Frontend updates state** → UI reflects changes immediately
5. **All users see updates** → Next page load fetches new data

## Default Content

The system automatically creates default content on first run:

### About Page
- Hero title, subtitle
- Introduction paragraph
- Mission statement

### Classes (3 default)
1. Puppy Training - $199/6 weeks
2. Basic Obedience - $249/6 weeks (Featured)
3. Advanced Training - $349/8 weeks

### Packages (3 default)
1. Puppy Training Package - $1,199
2. Basic Obedience Training - $1,599 (Featured)
3. Behavior Modification Program - Starting at $2,499

## Development Workflow

### Making Content Changes

1. Start backend server (port 8000)
2. Start frontend server (port 3004)
3. Log in as admin (admin@demo.com / admin123)
4. Navigate to Admin → Content
5. Edit, add, or delete content
6. Changes are saved to database immediately
7. Refresh any page to see updates

### Testing API

Use the interactive API docs:
```
http://localhost:8000/docs
```

Or use curl:
```bash
# Get classes
curl http://localhost:8000/api/content/classes

# Update about content
curl -X PUT http://localhost:8000/api/content/about \
  -H "Content-Type: application/json" \
  -d '{"heroTitle":"New Title","heroSubtitle":"New Subtitle","introduction":"New intro","mission":"New mission"}'
```

## Production Deployment

### Backend
1. Use PostgreSQL instead of SQLite
2. Set `DATABASE_URL` environment variable
3. Deploy to service like Railway, Render, or AWS
4. Enable HTTPS
5. Add authentication middleware
6. Set up database backups

### Frontend
1. Update `NEXT_PUBLIC_API_URL` to production API URL
2. Deploy to Vercel, Netlify, or similar
3. Enable environment variables in deployment platform

### Environment Variables

Backend:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=https://yourdomain.com
```

Frontend:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Frontend can't connect to API
- Verify backend is running on port 8000
- Check `.env.local` has correct API URL
- Check browser console for CORS errors
- Verify CORS settings in `main.py`

### Database errors
- Delete `dogangelenos.db` and restart
- Check file permissions
- Verify SQLAlchemy is installed

### Content not updating
- Check browser console for API errors
- Verify admin is logged in
- Check network tab for failed requests
- Restart both servers

## Security Notes

Current implementation:
- No authentication on API endpoints
- CORS allows localhost only
- SQLite for development

Production requirements:
- Add JWT authentication
- Validate admin role before updates
- Use PostgreSQL with SSL
- Implement rate limiting
- Add input validation and sanitization
- Enable HTTPS only
- Set up monitoring and logging

## Support

For issues:
1. Check both server logs (backend and frontend)
2. Verify database file exists and has content
3. Test API endpoints directly at `/docs`
4. Clear browser cache and localStorage
5. Check network requests in browser DevTools
