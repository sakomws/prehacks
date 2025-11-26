# Hardcoded URLs Fix Guide

## Problem
All API calls in the frontend are hardcoded to `http://localhost:8000`, which breaks in production.

## Solution
Use environment variables via `NEXT_PUBLIC_API_URL`.

## Quick Fix (Temporary)

On EC2, ensure the environment variable is set:

```bash
cd ~/prehacks/apps/mentormap/frontend

# Create/update .env.production
cat > .env.production << EOF
PORT=3001
NEXT_PUBLIC_API_URL=https://api.mentormap.ai
EOF

# Rebuild
npm run build

# Restart
pm2 restart mentormap-frontend
```

## Files with Hardcoded URLs

### Frontend Files (17 files):
1. `src/app/login/page.tsx` - 2 occurrences
2. `src/app/signup/page.tsx` - 2 occurrences
3. `src/app/become-mentor/page.tsx` - 1 occurrence
4. `src/app/mentors/page.tsx` - 1 occurrence
5. `src/app/mentors/[id]/page.tsx` - 3 occurrences
6. `src/app/sessions/page.tsx` - 3 occurrences
7. `src/app/sessions/success/page.tsx` - 1 occurrence
8. `src/app/dashboard/page.tsx` - 1 occurrence
9. `src/app/mentor-dashboard/page.tsx` - 3 occurrences
10. `src/app/roadmap/page.tsx` - 5 occurrences
11. `src/app/register/page.tsx` - 1 occurrence
12. `src/app/debug-auth/page.tsx` - 1 occurrence

### Backend Files:
1. `backend/app/api/auth.py` - LinkedIn redirect URL (FIXED ✅)
2. `backend/main.py` - CORS origins (FIXED ✅)

## Proper Fix (Recommended)

### Step 1: Use the API config

In each file, add at the top:
```typescript
import API_URL from '@/config/api';
```

### Step 2: Replace hardcoded URLs

Change:
```typescript
const response = await fetch("http://localhost:8000/api/auth/login", {
```

To:
```typescript
const response = await fetch(`${API_URL}/api/auth/login`, {
```

### Step 3: For window.location.href

Change:
```typescript
window.location.href = "http://localhost:8000/api/auth/linkedin"
```

To:
```typescript
window.location.href = `${API_URL}/api/auth/linkedin`
```

## Automated Fix Script

Run this to fix all files automatically:

```bash
cd ~/prehacks/apps/mentormap

# Make script executable
chmod +x scripts/fix-hardcoded-urls.sh

# Run the fix
./scripts/fix-hardcoded-urls.sh

# Review changes
git diff

# Test locally
cd frontend
npm run dev

# If good, commit
git add .
git commit -m "Replace hardcoded API URLs with environment variables"
git push
```

## Environment Variables

### Development (.env.local):
```env
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (.env.production):
```env
PORT=3001
NEXT_PUBLIC_API_URL=https://api.mentormap.ai
```

## Verification

After fixing, verify:

```bash
# Check no hardcoded localhost URLs remain
cd frontend/src
grep -r "localhost:8000" . --include="*.tsx" --include="*.ts"

# Should return no results
```

## Testing

1. **Local Development:**
   ```bash
   cd frontend
   npm run dev
   # Should use http://localhost:8000
   ```

2. **Production Build:**
   ```bash
   cd frontend
   NODE_ENV=production npm run build
   npm start
   # Should use https://api.mentormap.ai
   ```

3. **Browser Console:**
   - Open DevTools (F12)
   - Network tab
   - Check API calls go to correct domain

## Status

- ✅ Backend CORS fixed
- ✅ Backend LinkedIn redirect fixed
- ✅ API config file created
- ⚠️ Frontend files need updating (17 files)
- ⚠️ Environment variables set on EC2

## Priority

**HIGH** - This breaks production functionality. All API calls fail with CORS errors.

## Next Steps

1. Run the automated fix script
2. Test locally
3. Deploy to production
4. Verify all API calls work
