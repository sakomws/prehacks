# Trainers API & Management System

## Overview
Complete trainers management system with API backend and admin panel integration for Dog Angelenos.

## Backend API

### Endpoints

#### GET /api/trainers
Get all trainers (active only by default)
- Query params: `active_only` (boolean, default: true)
- Returns: Array of trainer objects

#### GET /api/trainers/{id}
Get a specific trainer by ID
- Returns: Single trainer object

#### POST /api/trainers
Create a new trainer
- Body: TrainerCreate object
- Returns: Created trainer

#### PUT /api/trainers/{id}
Update a trainer
- Body: TrainerUpdate object (partial)
- Returns: Updated trainer

#### DELETE /api/trainers/{id}
Delete a trainer
- Returns: Success message

#### POST /api/trainers/seed
Seed database with default trainers
- Returns: Success message with count

### Data Model

```typescript
interface Trainer {
  id: number;
  name: string;
  title: string;
  bio: string;
  specialties: string[];  // Array of specialty areas
  experience: string;     // e.g., "15+ years"
  certifications: string[]; // Array of certifications
  image: string;          // Emoji or image URL
  availability: string;   // e.g., "Mon-Fri"
  is_active: boolean;
  order: number;          // Display order
  created_at: datetime;
  updated_at: datetime;
}
```

## Frontend Pages

### Public Trainers Page (`/trainers`)
- Displays all active trainers
- Fetches data from API
- Shows trainer profiles with:
  - Name, title, and image
  - Bio and experience
  - Specialties and certifications
  - Availability
- Click to view full profile modal
- CTA to book sessions

### Admin Panel (`/admin` - Trainers Tab)
- Full CRUD operations for trainers
- Features:
  - View all trainers (including inactive)
  - Add new trainers
  - Edit existing trainers
  - Delete trainers
  - View detailed trainer profiles
- Real-time updates from API

## Admin Modals

### Add Trainer Modal
Fields:
- Name *
- Title *
- Bio *
- Experience *
- Availability *
- Specialties (comma-separated) *
- Certifications (comma-separated) *
- Image (emoji)
- Order (number)
- Status (active/inactive)

### Edit Trainer Modal
Same fields as Add Trainer, pre-populated with existing data

### View Trainer Modal
Read-only view of trainer details with edit button

## Database

### Table: trainers
```sql
CREATE TABLE trainers (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    bio TEXT NOT NULL,
    specialties TEXT NOT NULL,  -- JSON array
    experience VARCHAR NOT NULL,
    certifications TEXT NOT NULL,  -- JSON array
    image VARCHAR NOT NULL,
    availability VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Default Trainers

The system comes with 4 default trainers:

1. **Sarah Martinez** - Lead Trainer & Behavior Specialist
   - 15+ years experience
   - Specialties: Puppy Training, Behavioral Issues, Obedience, Socialization
   - Certifications: CPDT-KA, CBCC-KA, AKC CGC Evaluator

2. **Michael Chen** - Advanced Obedience Trainer
   - 12+ years experience
   - Specialties: Advanced Training, Off-Leash Control, Competition Prep, Agility
   - Certifications: CPDT-KA, KPA CTP, AKC Canine Good Citizen

3. **Jessica Rodriguez** - Puppy Development Specialist
   - 10+ years experience
   - Specialties: Puppy Training, Early Socialization, Potty Training, Basic Manners
   - Certifications: CPDT-KA, Fear Free Certified, Puppy Start Right Instructor

4. **David Thompson** - Reactive Dog Specialist
   - 18+ years experience
   - Specialties: Reactive Dogs, Fear & Anxiety, Aggression, Behavior Modification
   - Certifications: CPDT-KA, CBCC-KA, IAABC Certified

## Usage

### Seeding Trainers
```bash
curl -X POST http://localhost:8000/api/trainers/seed
```

### Getting All Trainers
```bash
curl http://localhost:8000/api/trainers
```

### Creating a Trainer
```bash
curl -X POST http://localhost:8000/api/trainers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "title": "Senior Trainer",
    "bio": "Expert trainer with 20 years experience",
    "specialties": ["Obedience", "Agility"],
    "experience": "20+ years",
    "certifications": ["CPDT-KA", "KPA CTP"],
    "image": "👨‍🏫",
    "availability": "Mon-Fri",
    "is_active": true,
    "order": 5
  }'
```

## Features

### Public Page
- ✅ API integration
- ✅ Loading states
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Profile modals
- ✅ Stats section
- ✅ CTA sections

### Admin Panel
- ✅ Full CRUD operations
- ✅ Real-time API updates
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Confirmation dialogs
- ✅ Responsive modals

## Files Modified/Created

### Backend
- `apps/dogangelenos/backend/trainers.py` - New API router
- `apps/dogangelenos/backend/database.py` - Added TrainerModel
- `apps/dogangelenos/backend/main.py` - Included trainers router

### Frontend
- `apps/dogangelenos/frontend/app/trainers/page.tsx` - Updated with API integration
- `apps/dogangelenos/frontend/app/admin/page.tsx` - Updated TrainersManager
- `apps/dogangelenos/frontend/app/admin/TrainerModals.tsx` - New modal components
- `apps/dogangelenos/frontend/app/packages/page.tsx` - Polished UI

## Testing

1. Start backend: `cd apps/dogangelenos/backend && python -m uvicorn main:app --reload`
2. Seed trainers: `curl -X POST http://localhost:8000/api/trainers/seed`
3. Start frontend: `cd apps/dogangelenos/frontend && npm run dev`
4. Visit: http://localhost:3004/trainers
5. Admin panel: http://localhost:3004/admin (login required)

## Next Steps

- Add trainer availability calendar
- Implement trainer booking preferences
- Add trainer performance metrics
- Create trainer-specific dashboards
- Add photo upload support
- Implement trainer reviews/ratings
