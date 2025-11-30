# Dog Angelenos - Quick Start Guide

## Starting the Application

### 1. Start Backend (Terminal 1)
```bash
cd apps/dogangelenos/backend
python main.py
```

**Expected output:**
```
✅ Database initialized
INFO: Uvicorn running on http://0.0.0.0:8000
```

**API will be available at:** `http://localhost:8000`

### 2. Start Frontend (Terminal 2)
```bash
cd apps/dogangelenos/frontend
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3004
```

**Website will be available at:** `http://localhost:3004`

## Testing the System

### 1. Test API Endpoints

**Get all classes:**
```bash
curl http://localhost:8000/api/content/classes
```

**Get about content:**
```bash
curl http://localhost:8000/api/content/about
```

**Get all packages:**
```bash
curl http://localhost:8000/api/content/packages
```

### 2. Test Content Management

1. Open browser: `http://localhost:3004`
2. Click "Sign In"
3. Use admin credentials:
   - Email: `admin@demo.com`
   - Password: `admin123`
4. Navigate to "Admin" → "Content" tab
5. Try editing About page, Classes, or Packages
6. Changes should save to database immediately

### 3. Verify Changes Persist

1. Make a change in admin panel
2. Refresh the page
3. Changes should still be there (stored in database)
4. Check database file: `apps/dogangelenos/backend/dogangelenos.db`

## Demo User Accounts

### Customer Account
- **Email:** customer@demo.com
- **Password:** customer123
- **Access:** Booking, account management, events

### Trainer Account
- **Email:** trainer@demo.com
- **Password:** trainer123
- **Access:** Schedule, clients, sessions, earnings

### Admin Account
- **Email:** admin@demo.com
- **Password:** admin123
- **Access:** Full system access, content management

## Common Issues

### Backend won't start
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd apps/dogangelenos/backend
pip install fastapi uvicorn sqlalchemy pydantic python-multipart websockets
```

### Frontend can't connect to API
**Error:** `Failed to fetch` or CORS errors

**Solution:**
1. Verify backend is running on port 8000
2. Check `.env.local` file exists with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Restart frontend server

### 404 errors on API calls
**Solution:**
1. Stop backend server (Ctrl+C)
2. Restart: `python main.py`
3. Verify routes loaded in startup logs

### Database errors
**Solution:**
```bash
cd apps/dogangelenos/backend
rm dogangelenos.db
python main.py
```
This will recreate the database with default content.

## API Documentation

Interactive API docs available at:
```
http://localhost:8000/docs
```

This provides:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication details

## File Structure

```
apps/dogangelenos/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database models
│   ├── content.py           # Content management API
│   ├── admin.py             # Admin API
│   ├── chat.py              # Chat functionality
│   └── dogangelenos.db      # SQLite database (auto-created)
├── frontend/
│   ├── app/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Authentication
│   │   │   └── ContentContext.tsx   # Content management
│   │   ├── admin/page.tsx           # Admin dashboard
│   │   ├── login/page.tsx           # Login page
│   │   └── ...
│   └── .env.local           # Environment variables
```

## Development Workflow

1. **Start both servers** (backend and frontend)
2. **Make changes** in admin panel or code
3. **Test immediately** - changes reflect in real-time
4. **Database persists** - all changes saved automatically
5. **Commit changes** when ready

## Production Checklist

Before deploying to production:

- [ ] Replace SQLite with PostgreSQL
- [ ] Add authentication to API endpoints
- [ ] Set up environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Add monitoring and logging
- [ ] Test all CRUD operations
- [ ] Verify data persistence
- [ ] Load test API endpoints

## Support

If you encounter issues:

1. Check both server logs (backend terminal and frontend terminal)
2. Verify database file exists: `ls -la apps/dogangelenos/backend/dogangelenos.db`
3. Test API directly: `curl http://localhost:8000/api/content/classes`
4. Check browser console for errors (F12)
5. Verify environment variables are set correctly

## Next Steps

- Explore the admin dashboard
- Try editing content and see it update live
- Test different user roles (customer, trainer, admin)
- Review API documentation at `/docs`
- Customize content for your needs
