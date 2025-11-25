# 🔗 LinkedIn OAuth Setup Guide

## Step 1: Create LinkedIn App

1. **Go to LinkedIn Developers**
   - Visit: https://www.linkedin.com/developers/apps
   - Sign in with your LinkedIn account

2. **Create New App**
   - Click "Create app" button
   - Fill in the required information:
     - **App name**: MentorMap (or your preferred name)
     - **LinkedIn Page**: Select or create a LinkedIn page
     - **App logo**: Upload a logo (optional)
     - **Legal agreement**: Check the box to agree

3. **Get Your Credentials**
   - After creating the app, go to the "Auth" tab
   - You'll see:
     - **Client ID**: Copy this value
     - **Client Secret**: Click "Show" and copy this value

## Step 2: Configure OAuth Settings

1. **In the LinkedIn App Settings**
   - Go to "Auth" tab
   - Scroll to "OAuth 2.0 settings"

2. **Add Redirect URLs**
   - Click "Add redirect URL"
   - Add: `http://localhost:8000/api/auth/linkedin/callback`
   - For production, add: `https://yourdomain.com/api/auth/linkedin/callback`
   - Click "Update"

3. **Request OAuth Scopes**
   - Go to "Products" tab
   - Request access to "Sign In with LinkedIn using OpenID Connect"
   - This gives you access to:
     - `openid`
     - `profile`
     - `email`

## Step 3: Add Credentials to Your App

### Option 1: Using .env file (Recommended)

1. **Copy the example file**
   ```bash
   cd apps/mentormap
   cp .env.example .env
   ```

2. **Edit the .env file**
   ```bash
   # Add your LinkedIn credentials
   LINKEDIN_CLIENT_ID=your-actual-client-id-here
   LINKEDIN_CLIENT_SECRET=your-actual-client-secret-here
   LINKEDIN_REDIRECT_URI=http://localhost:8000/api/auth/linkedin/callback
   ```

3. **Copy to backend folder**
   ```bash
   cp .env backend/.env
   ```

### Option 2: Set Environment Variables Directly

**macOS/Linux:**
```bash
export LINKEDIN_CLIENT_ID="your-client-id"
export LINKEDIN_CLIENT_SECRET="your-client-secret"
export LINKEDIN_REDIRECT_URI="http://localhost:8000/api/auth/linkedin/callback"
```

**Windows (PowerShell):**
```powershell
$env:LINKEDIN_CLIENT_ID="your-client-id"
$env:LINKEDIN_CLIENT_SECRET="your-client-secret"
$env:LINKEDIN_REDIRECT_URI="http://localhost:8000/api/auth/linkedin/callback"
```

## Step 4: Restart the Backend

After adding your credentials, restart the backend server:

```bash
cd apps/mentormap/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8002
```

## Step 5: Test LinkedIn Login

1. **Open the login page**
   - Visit: http://localhost:3000/login

2. **Click "Sign in with LinkedIn"**
   - You'll be redirected to LinkedIn
   - Authorize the app
   - You'll be redirected back to your app with a token

## 📁 File Locations

### Environment Variables
```
apps/mentormap/
├── .env                    # Root .env file
└── backend/
    └── .env                # Backend .env file (copy from root)
```

### Configuration Files
```
apps/mentormap/
├── .env.example            # Template with all variables
├── backend/
│   └── app/
│       └── api/
│           └── auth.py     # OAuth implementation
└── frontend/
    └── src/app/
        └── login/
            └── page.tsx    # Login page with LinkedIn button
```

## 🔧 Configuration Details

### Backend (.env or backend/.env)
```bash
# Required for LinkedIn OAuth
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=WPLxxxxxxxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/auth/linkedin/callback

# Other required settings
DATABASE_URL=sqlite:///./mentormap.db
SECRET_KEY=your-secret-key-here
```

### Frontend (No changes needed)
The frontend automatically uses the backend OAuth endpoints.

## 🧪 Testing

### Test the OAuth Flow

1. **Check LinkedIn redirect**
   ```bash
   curl -L http://localhost:8000/api/auth/linkedin
   ```
   Should redirect to LinkedIn authorization page

2. **Test with browser**
   - Visit: http://localhost:3000/login
   - Click "Sign in with LinkedIn"
   - Should redirect to LinkedIn
   - After authorization, redirects back with token

### Verify Environment Variables

```bash
cd apps/mentormap/backend
source venv/bin/activate
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Client ID:', os.getenv('LINKEDIN_CLIENT_ID'))"
```

## 🚀 Production Setup

For production deployment:

1. **Update redirect URI in LinkedIn app**
   - Add: `https://yourdomain.com/api/auth/linkedin/callback`

2. **Update environment variables**
   ```bash
   LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/auth/linkedin/callback
   ```

3. **Update frontend OAuth button**
   - Change `http://localhost:8002` to your production API URL

## 🔒 Security Best Practices

1. **Never commit .env files**
   - Already in .gitignore
   - Use .env.example as template

2. **Keep secrets secure**
   - Don't share Client Secret
   - Rotate secrets periodically
   - Use environment variables in production

3. **Use HTTPS in production**
   - LinkedIn requires HTTPS for production apps
   - Update redirect URIs accordingly

## 📊 Current Implementation

### OAuth Flow
```
User clicks "Sign in with LinkedIn"
    ↓
Frontend redirects to: /api/auth/linkedin
    ↓
Backend redirects to: LinkedIn OAuth page
    ↓
User authorizes on LinkedIn
    ↓
LinkedIn redirects to: /api/auth/linkedin/callback
    ↓
Backend creates/finds user and generates JWT
    ↓
Backend redirects to: /login?token=<jwt>
    ↓
Frontend stores token and redirects to /roadmap
```

### API Endpoints

**Initiate OAuth:**
```
GET http://localhost:8000/api/auth/linkedin
```

**OAuth Callback:**
```
GET http://localhost:8000/api/auth/linkedin/callback?code=<auth_code>
```

## ❓ Troubleshooting

### "Invalid client_id" error
- Check that LINKEDIN_CLIENT_ID is set correctly
- Verify the Client ID in LinkedIn Developer Console
- Restart the backend server after adding credentials

### "Redirect URI mismatch" error
- Ensure redirect URI in LinkedIn app matches exactly
- Check for trailing slashes
- Verify protocol (http vs https)

### "Access denied" error
- Check that "Sign In with LinkedIn" product is approved
- Verify OAuth scopes are requested
- Check app status in LinkedIn Developer Console

### Backend not reading .env file
```bash
# Make sure .env is in the backend folder
cd apps/mentormap
cp .env backend/.env

# Restart backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8002
```

## 📚 Additional Resources

- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

**Need Help?**
- Check the [FAQ](../frontend/src/app/faq/page.tsx)
- Contact support at support@mentormap.ai
- Review the [API Documentation](http://localhost:8000/docs)
