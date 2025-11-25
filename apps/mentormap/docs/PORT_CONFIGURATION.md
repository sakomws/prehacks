# Port Configuration

## Standard Ports

MentorMap uses the following standard ports:

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

## Starting the Application

Use the start script which automatically handles port conflicts:

```bash
cd apps/mentormap
./start.sh
```

The start script will:
1. ✅ Kill any processes using ports 3000 and 8000
2. 🐍 Start backend on port 8000
3. ⚛️ Start frontend on port 3000
4. 📝 Save logs to `backend.log` and `frontend.log`

## LinkedIn OAuth Configuration

For LinkedIn OAuth to work, configure your LinkedIn app with:

**Redirect URI**: `http://localhost:8000/api/auth/linkedin/callback`

Update your `.env` file:
```bash
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/auth/linkedin/callback
```

## Stripe Configuration

Update Stripe redirect URLs in the code to use port 3000:
- Success URL: `http://localhost:3000/sessions/success`
- Cancel URL: `http://localhost:3000/mentors/{id}?canceled=true`

## Manual Port Cleanup

If you need to manually kill processes on these ports:

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

## Production Configuration

For production deployment, update:

1. **LinkedIn OAuth**:
   - Redirect URI: `https://yourdomain.com/api/auth/linkedin/callback`

2. **Stripe**:
   - Success URL: `https://yourdomain.com/sessions/success`
   - Cancel URL: `https://yourdomain.com/mentors/{id}?canceled=true`

3. **Environment Variables**:
   ```bash
   LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/auth/linkedin/callback
   ```
