# ⚡ Quick LinkedIn OAuth Setup

## 🎯 3-Minute Setup

### 1️⃣ Get LinkedIn Credentials (2 min)

1. Go to: https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in app details and create
4. Go to "Auth" tab
5. Copy **Client ID** and **Client Secret**

### 2️⃣ Add Redirect URL (30 sec)

In LinkedIn app "Auth" tab:
- Add redirect URL: `http://localhost:8002/api/auth/linkedin/callback`
- Click "Update"

### 3️⃣ Add to Your App (30 sec)

**Edit `apps/myroadmap/backend/.env`:**
```bash
LINKEDIN_CLIENT_ID=your-client-id-here
LINKEDIN_CLIENT_SECRET=your-client-secret-here
LINKEDIN_REDIRECT_URI=http://localhost:8002/api/auth/linkedin/callback
```

### 4️⃣ Restart Backend

```bash
# Stop the backend (Ctrl+C)
# Start again:
cd apps/myroadmap/backend
source venv/bin/activate
uvicorn main:app --reload --port 8002
```

### 5️⃣ Test It! ✨

1. Visit: http://localhost:3002/login
2. Click "Sign in with LinkedIn"
3. Done! 🎉

---

## 📝 Example .env File

```bash
# Database
DATABASE_URL=sqlite:///./myroadmap.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=WPLxxxxxxxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:8002/api/auth/linkedin/callback
```

---

## 🔍 Where to Find Things

**LinkedIn App Settings:**
- Dashboard: https://www.linkedin.com/developers/apps
- Your App → Auth tab → Client ID & Secret

**Your App Files:**
- Config: `apps/myroadmap/backend/.env`
- OAuth Code: `apps/myroadmap/backend/app/api/auth.py`
- Login Page: `apps/myroadmap/frontend/src/app/login/page.tsx`

---

## ⚠️ Common Issues

**"Invalid client_id"**
→ Check LINKEDIN_CLIENT_ID in backend/.env

**"Redirect URI mismatch"**
→ Add `http://localhost:8002/api/auth/linkedin/callback` to LinkedIn app

**Not working after adding credentials**
→ Restart the backend server

---

## 📚 Full Guide

For detailed instructions, see: [LINKEDIN_SETUP.md](LINKEDIN_SETUP.md)
