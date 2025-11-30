# Demo User Accounts

This document contains the demo user credentials for testing the Dog Angelenos platform with different role-based access levels.

## Demo Accounts

### 1. Customer Account
**Role:** Customer  
**Email:** `customer@demo.com`  
**Password:** `customer123`  
**Access:**
- View and book training classes
- Manage personal profile and dog information
- View booking history and upcoming sessions
- Access payment methods and history
- Subscribe to newsletter
- Register for events

**Portal:** `/account` - Customer Account Dashboard

---

### 2. Trainer Account
**Role:** Trainer  
**Email:** `trainer@demo.com`  
**Password:** `trainer123`  
**Access:**
- View daily schedule and upcoming sessions
- Manage client list and session details
- Track earnings and payments
- Start and complete training sessions
- Contact clients through messaging
- View available time slots

**Portal:** `/trainer` - Trainer Portal

---

### 3. Admin Account
**Role:** Admin  
**Email:** `admin@demo.com`  
**Password:** `admin123`  
**Access:**
- Full dashboard with business analytics
- Manage all bookings and customers
- Manage trainer profiles and schedules
- Handle chat messages and support
- Create and manage events
- Newsletter management (subscribers, compose, send)
- Calendar view of all activities
- Complete system administration

**Portal:** `/admin` - Admin Dashboard

---

## Quick Login

Visit `/login` to access the login page. The page includes quick-login buttons for each demo account, making it easy to test different roles without typing credentials.

## Role-Based Features

### Customer Features
- ✅ Book training sessions
- ✅ Manage dog profiles
- ✅ View booking history
- ✅ Payment management
- ✅ Event registration
- ✅ Newsletter subscription

### Trainer Features
- ✅ Daily schedule management
- ✅ Client management
- ✅ Session tracking
- ✅ Earnings overview
- ✅ Client communication
- ✅ Availability management

### Admin Features
- ✅ Complete business dashboard
- ✅ Booking management
- ✅ Customer database
- ✅ Trainer management
- ✅ Chat/messaging system
- ✅ Event creation and management
- ✅ Newsletter campaigns
- ✅ Calendar overview
- ✅ Analytics and reporting

## Navigation

After logging in, the header navigation automatically adjusts based on your role:

- **Customers** see: "My Account"
- **Trainers** see: "Trainer Portal"
- **Admins** see: "Trainer Portal" + "Admin"

## Testing Workflow

1. **Test Customer Flow:**
   - Login as customer
   - Browse classes and packages
   - Book a training session
   - Register for an event
   - Subscribe to newsletter
   - View account dashboard

2. **Test Trainer Flow:**
   - Login as trainer
   - View today's schedule
   - Check client list
   - Review earnings
   - Manage sessions

3. **Test Admin Flow:**
   - Login as admin
   - View dashboard analytics
   - Manage bookings
   - Create new event
   - Compose newsletter
   - View all customers and trainers

## Security Notes

- Passwords are stored in localStorage for demo purposes only
- In production, implement proper backend authentication
- Use JWT tokens or session-based auth
- Implement password hashing and secure storage
- Add email verification and password reset flows

## Development

The authentication system is built using React Context API:
- `AuthContext.tsx` - Authentication state management
- `Header.tsx` - Role-based navigation
- Protected routes redirect to `/login` if not authenticated
- Role-based access control prevents unauthorized access
