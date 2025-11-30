# Content Updates - Live from Database

## Overview

All content on the Dog Angelenos website now pulls from the database via API. Changes made in the admin panel immediately reflect on the public pages.

## Pages Using Dynamic Content

### 1. Homepage (`/`)
**Classes Section:**
- Displays all training classes from database
- Shows: name, icon, description, price, duration
- Respects "featured" flag (shows "MOST POPULAR" badge)
- Uses custom color gradients from database
- Updates immediately when admin edits classes

### 2. Packages Page (`/packages`)
**All Packages:**
- Displays all training packages from database
- Shows: title, subtitle, description, features, experience, price
- Respects "featured" flag
- Uses custom color gradients from database
- Updates immediately when admin edits packages

### 3. About Page (Future)
**Content:**
- Hero title and subtitle
- Introduction paragraph
- Mission statement
- Can be edited from admin panel

## How It Works

### Data Flow
```
Database (SQLite)
    ↓
Backend API (FastAPI)
    ↓
ContentContext (React)
    ↓
Page Components (Next.js)
    ↓
User sees updated content
```

### Update Process
1. Admin logs in → Admin Portal
2. Navigates to Content tab
3. Edits class/package (e.g., changes price from $199 to $249)
4. Clicks "Save Changes"
5. API updates database
6. ContentContext refreshes data
7. All pages automatically show new price

## Testing Updates

### Test Class Price Update

1. **View current price:**
   - Go to homepage: `http://localhost:3004`
   - Scroll to "Our Training Programs"
   - Note the price of "Puppy Training"

2. **Update in admin:**
   - Login as admin (admin@demo.com / admin123)
   - Go to Admin → Content → Classes
   - Click "Edit" on Puppy Training
   - Change price from "$199" to "$299"
   - Click "Save Changes"

3. **Verify update:**
   - Refresh homepage
   - Price should now show "$299"
   - Change persists across page refreshes

### Test Package Update

1. **View current package:**
   - Go to packages page: `http://localhost:3004/packages`
   - Note the price of first package

2. **Update in admin:**
   - Go to Admin → Content → Packages
   - Click "Edit" on any package
   - Change title, price, or description
   - Click "Save Changes"

3. **Verify update:**
   - Refresh packages page
   - Changes should be visible immediately

## API Endpoints Used

### Classes
- `GET /api/content/classes` - Fetched on page load
- `PUT /api/content/classes/{id}` - Called when admin saves
- `POST /api/content/classes` - Called when admin adds new
- `DELETE /api/content/classes/{id}` - Called when admin deletes

### Packages
- `GET /api/content/packages` - Fetched on page load
- `PUT /api/content/packages/{id}` - Called when admin saves
- `POST /api/content/packages` - Called when admin adds new
- `DELETE /api/content/packages/{id}` - Called when admin deletes

### About
- `GET /api/content/about` - Fetched on page load
- `PUT /api/content/about` - Called when admin saves

## Database Schema

### Classes Table
```sql
CREATE TABLE classes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    duration TEXT NOT NULL,
    color TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    order INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Packages Table
```sql
CREATE TABLE packages (
    id INTEGER PRIMARY KEY,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT NOT NULL,
    features TEXT NOT NULL,  -- JSON array
    experience TEXT NOT NULL,
    color TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    order INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Troubleshooting

### Changes not appearing

**Problem:** Updated content in admin but homepage still shows old data

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for API errors
3. Verify backend is running: `curl http://localhost:8000/api/content/classes`
4. Check ContentContext is fetching data on mount

### API 404 errors

**Problem:** `GET /api/content/classes` returns 404

**Solutions:**
1. Restart backend server
2. Verify content router is included in main.py
3. Check backend logs for startup errors
4. Test API docs: `http://localhost:8000/docs`

### Database not updating

**Problem:** Admin saves but database doesn't change

**Solutions:**
1. Check backend logs for SQL errors
2. Verify database file exists and is writable
3. Test API directly with curl:
   ```bash
   curl -X PUT http://localhost:8000/api/content/classes/1 \
     -H "Content-Type: application/json" \
     -d '{"id":1,"name":"Test","icon":"🐶","description":"Test","price":"$999","duration":"1 week","color":"from-blue-400 to-blue-600","featured":false}'
   ```

## Benefits

### For Admins
- ✅ Edit content without touching code
- ✅ Changes reflect immediately
- ✅ No deployment needed
- ✅ Can add/remove classes and packages
- ✅ Control featured items
- ✅ Update prices anytime

### For Developers
- ✅ Single source of truth (database)
- ✅ No hardcoded content
- ✅ Easy to add new fields
- ✅ API-first architecture
- ✅ Scalable and maintainable

### For Users
- ✅ Always see current prices
- ✅ Up-to-date information
- ✅ Consistent experience
- ✅ Fast page loads (API caching possible)

## Future Enhancements

Potential improvements:
1. **Image uploads** - Allow admins to upload class/package images
2. **Reordering** - Drag-and-drop to reorder classes/packages
3. **Versioning** - Track content history and allow rollback
4. **Preview mode** - Preview changes before publishing
5. **Scheduling** - Schedule content changes for future dates
6. **Multi-language** - Support for multiple languages
7. **SEO fields** - Edit meta descriptions per class/package
8. **Analytics** - Track which classes/packages are most viewed

## Maintenance

### Backup Database
```bash
cp apps/dogangelenos/backend/dogangelenos.db apps/dogangelenos/backend/dogangelenos.db.backup
```

### Reset to Defaults
```bash
cd apps/dogangelenos/backend
rm dogangelenos.db
python main.py
```

### Export Content
```bash
curl http://localhost:8000/api/content/classes > classes_backup.json
curl http://localhost:8000/api/content/packages > packages_backup.json
```

## Support

For issues with content updates:
1. Check both server logs (backend and frontend terminals)
2. Verify API is responding: `curl http://localhost:8000/api/content/classes`
3. Check browser console for errors (F12 → Console tab)
4. Test in admin panel first before checking public pages
5. Ensure you're logged in as admin when making changes
