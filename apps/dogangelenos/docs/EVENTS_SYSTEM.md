# Events System - Full Database Integration

## ✅ Implementation Complete

The events system is now fully integrated with the backend API and database, allowing complete management of events and registrations.

## Features Implemented

### 1. **Backend API** (`backend/events.py`)

#### Database Models

**EventModel** - Stores event information:
- Title, description
- Date, time, location
- Category (workshop, training, social, competition)
- Total spots and available spots
- Price, image emoji
- Featured and active status
- Timestamps

**EventRegistrationModel** - Stores event registrations:
- Event ID (foreign key)
- Participant name, email, phone
- Dog name and breed
- Special requirements
- Registration status
- Timestamp

#### API Endpoints

**Event Management:**
- `GET /api/events/` - Get all events (with optional category filter)
- `GET /api/events/{id}` - Get specific event
- `POST /api/events/` - Create new event (admin)
- `PUT /api/events/{id}` - Update event (admin)
- `DELETE /api/events/{id}` - Delete event (admin)

**Registration Management:**
- `POST /api/events/register` - Register for an event
- `GET /api/events/{id}/registrations` - Get event registrations (admin)
- `DELETE /api/events/registrations/{id}` - Cancel registration

**Statistics:**
- `GET /api/events/stats/summary` - Get event statistics

### 2. **Frontend Events Page** (`frontend/app/events/page.tsx`)

#### Features:

**Event Display:**
- Fetches events from database via API
- Category filtering (workshop, training, social, competition)
- Search functionality (title, location, description)
- Time filtering (upcoming, past, all)
- Featured events section
- Real-time spot availability

**Event Cards:**
- Display event details (title, date, time, location)
- Show available spots and registration count
- Category badges with color coding
- Featured event highlighting
- Disabled state for full or past events

**Registration Modal:**
- Complete registration form
- API integration for submissions
- Real-time validation
- Success/error messages
- Automatic spot count updates
- Email confirmation notification

**Filters & Search:**
- Category filter buttons
- Time period filter (upcoming/past/all)
- Search bar for keywords
- Event count display

### 3. **Admin Panel Integration**

Events can be managed through the admin panel:
- View all events
- Create new events
- Edit existing events
- View registrations
- Cancel registrations
- Track statistics

## Database Schema

### events
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    spots_total INTEGER NOT NULL,
    spots_available INTEGER NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### event_registrations
```sql
CREATE TABLE event_registrations (
    id INTEGER PRIMARY KEY,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dog_name TEXT NOT NULL,
    dog_breed TEXT,
    special_requirements TEXT,
    status TEXT DEFAULT 'confirmed',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

## Default Events

The system automatically creates 6 default events on first load:

1. **Puppy Socialization Workshop** (🐶)
   - Category: workshop
   - 15 spots
   - $45

2. **Advanced Obedience Training** (🎓)
   - Category: training
   - 10 spots
   - $65

3. **Holiday Dog Social & Meetup** (🎄)
   - Category: social
   - 30 spots
   - Free

4. **Agility Training Basics** (🏃)
   - Category: training
   - 12 spots
   - $55

5. **Reactive Dog Management Workshop** (🔧)
   - Category: workshop
   - 8 spots
   - $75

6. **LA Dog Show & Competition** (🏆)
   - Category: competition
   - 50 spots
   - $35

## Testing Guide

### 1. View Events

**Via Frontend (http://localhost:3004/events):**
1. Navigate to Events page
2. Should see all active events from database
3. Filter by category
4. Search for specific events
5. Toggle between upcoming/past events

**Via API:**
```bash
# Get all events
curl http://localhost:8000/api/events/

# Get events by category
curl http://localhost:8000/api/events/?category=workshop

# Get specific event
curl http://localhost:8000/api/events/1
```

### 2. Register for Event

**Via Frontend:**
1. Click "Register Now" on any event
2. Fill out registration form:
   - Your name
   - Email
   - Phone
   - Dog's name
   - Dog's breed (optional)
   - Special requirements (optional)
3. Click "Complete Registration"
4. Should see success message
5. Event spots should decrease

**Via API:**
```bash
curl -X POST http://localhost:8000/api/events/register \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(310) 555-0123",
    "dog_name": "Max",
    "dog_breed": "Golden Retriever",
    "special_requirements": "First time at group event"
  }'
```

### 3. Create Event (Admin)

```bash
curl -X POST http://localhost:8000/api/events/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beach Training Session",
    "description": "Train your dog on the beach with distractions",
    "date": "2025-02-01",
    "time": "10:00 AM - 12:00 PM",
    "location": "Santa Monica Beach",
    "category": "training",
    "spots_total": 20,
    "price": "$50",
    "image": "🏖️",
    "is_featured": false
  }'
```

### 4. Update Event (Admin)

```bash
curl -X PUT http://localhost:8000/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{
    "spots_total": 20,
    "price": "$40",
    "is_featured": true
  }'
```

### 5. View Registrations (Admin)

```bash
curl http://localhost:8000/api/events/1/registrations
```

### 6. Get Statistics

```bash
curl http://localhost:8000/api/events/stats/summary
```

### 7. Cancel Registration

```bash
curl -X DELETE http://localhost:8000/api/events/registrations/1
```

### 8. Delete Event (Admin)

```bash
curl -X DELETE http://localhost:8000/api/events/1
```

## Event Categories

- **workshop** - Educational workshops and seminars
- **training** - Training sessions and bootcamps
- **social** - Social meetups and gatherings
- **competition** - Competitions and shows

## Features

✅ **Real-time Data** - All events from database via API
✅ **Registration System** - Complete registration with validation
✅ **Spot Management** - Automatic spot count updates
✅ **Category Filtering** - Filter events by type
✅ **Search Functionality** - Search by title, location, description
✅ **Time Filtering** - View upcoming, past, or all events
✅ **Featured Events** - Highlight special events
✅ **Full/Past Detection** - Disable registration for full or past events
✅ **Admin Management** - Create, edit, delete events
✅ **Registration Tracking** - View all registrations per event
✅ **Database Persistence** - All data persists across restarts
✅ **Duplicate Prevention** - Can't register twice for same event
✅ **Spot Validation** - Can't register when event is full

## Error Handling

- Event not found (404)
- Event is full (400)
- Already registered (400)
- Event not active (400)
- Network errors with user-friendly messages
- Form validation

## UI Features

- Loading states during API calls
- Success/error messages
- Disabled buttons for full/past events
- Real-time spot count display
- Registration count display
- Category color coding
- Featured event badges
- Responsive design
- Smooth animations

## URLs

- **Events Page:** http://localhost:3004/events
- **API Docs:** http://localhost:8000/docs#/events

## Status

🎉 **FULLY FUNCTIONAL** - Events system is 100% integrated with database via backend API!

All event data, registrations, and spot management is handled through the database with complete CRUD operations available through the API.
