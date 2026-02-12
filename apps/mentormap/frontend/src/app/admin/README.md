# Admin Panel Architecture

This admin panel is built with a clean, modular architecture for maintainability and scalability.

## Directory Structure

```
src/app/admin/
├── components/
│   ├── dashboard/
│   │   └── DashboardView.tsx          # Main dashboard with stats and activity
│   ├── layout/
│   │   ├── Header.tsx                 # Top navigation header
│   │   ├── Sidebar.tsx                # Left navigation sidebar
│   │   └── index.ts                   # Layout exports
│   ├── managers/
│   │   ├── SessionsAndGiftsManager.tsx      # Sessions & gift sessions (merged)
│   │   ├── MenteesManager.tsx               # Mentee management
│   │   ├── MentorsAndApplicationsManager.tsx # **FULLY IMPLEMENTED** Mentors & applications with:
│   │   │                                    #   • Mentor profile editing
│   │   │                                    #   • Application review & approval
│   │   │                                    #   • Performance tracking & analytics
│   │   │                                    #   • Availability & schedule management
│   │   ├── ChatManager.tsx                  # Message management
│   │   ├── CalendarAndScheduleManager.tsx   # **FULLY IMPLEMENTED** Calendar & schedule with:
│   │   │                                    #   • Calendar overview with all sessions
│   │   │                                    #   • Individual mentor schedule management
│   │   │                                    #   • Availability slot configuration
│   │   │                                    #   • Time-off and holiday management
│   │   ├── EventsManager.tsx                # **FULLY IMPLEMENTED** Events management with:
│   │   │                                    #   • Create and edit events with detailed information
│   │   │                                    #   • Manage event registrations and attendees
│   │   │                                    #   • Event analytics and attendance tracking
│   │   │                                    #   • Integration with calendar system
│   │   ├── NewsletterManager.tsx            # Newsletter management
│   │   ├── ContentManager.tsx               # Content management
│   │   └── index.ts                         # Manager exports
│   └── ui/
│       ├── TabButton.tsx              # Reusable tab button
│       ├── StatCard.tsx               # Dashboard stat cards
│       ├── ActivityItem.tsx           # Activity list items
│       ├── LoadingSpinner.tsx         # Loading indicator
│       └── index.ts                   # UI component exports
├── hooks/
│   └── useAuth.ts                     # Authentication hook
├── utils/
│   ├── notifications.ts               # Toast notification system
│   ├── errorHandling.ts               # Error handling utilities
│   ├── export.ts                      # Data export utilities
│   └── index.ts                       # Utility exports
├── types.ts                           # TypeScript type definitions
├── page.tsx                           # Main admin page component
└── README.md                          # This documentation
```

## Key Features

### Clean Architecture
- **Separation of Concerns**: Each component has a single responsibility
- **Modular Design**: Components are organized by feature and function
- **Reusable Components**: UI components can be used across different managers
- **Type Safety**: Full TypeScript support with proper type definitions

### Merged Functionality
The admin panel consolidates related features into unified managers:

1. **Sessions & Gifts**: Combines session management and gift session tracking
2. **Mentors**: Full mentor management system with profile editing, application review, performance tracking, and availability management
3. **Calendar**: Complete calendar and schedule management system with overview, individual mentor schedules, availability configuration, and time-off management
4. **Events**: Comprehensive event management system with creation, registration management, analytics, and calendar integration

### Utility Systems
- **Toast Notifications**: User-friendly feedback system
- **Error Handling**: Centralized error management with retry logic
- **Export Functions**: CSV and JSON export capabilities
- **Authentication**: Secure auth flow with token management

## Usage

### Adding New Components
1. Create component in appropriate directory (`components/managers/`, `components/ui/`, etc.)
2. Add TypeScript types to `types.ts`
3. Export from relevant `index.ts` file
4. Import and use in main page or other components

### Implementing Manager Features
Each manager component is currently a placeholder. To implement:

1. Add state management (useState, useEffect)
2. Create API integration functions
3. Add sub-tab functionality where needed
4. Implement CRUD operations
5. Add proper error handling and loading states

### Styling Guidelines
- Uses Tailwind CSS for consistent styling
- Color scheme: Purple/pink gradients for branding
- Responsive design with mobile-first approach
- Consistent spacing and typography

## Implemented Features

### ✅ Mentors Management (Fully Implemented)
The MentorsAndApplicationsManager component includes all requested features:

#### 🎓 Mentor Management
- **Profile Editing**: Comprehensive forms for editing mentor profiles
- **Status Management**: Activate/deactivate mentors
- **Expertise Tracking**: Manage mentor skills and specializations
- **Rating & Performance**: Display mentor ratings and session counts

#### 📋 Application Review Process
- **Application Listing**: View all pending, approved, and rejected applications
- **Detailed Review**: Full application details with bio, expertise, and rates
- **Approval Workflow**: Approve or reject applications with reviewer notes
- **LinkedIn Integration**: Direct links to applicant profiles

#### 📊 Performance Tracking
- **Performance Analytics**: Comprehensive performance reports
- **Completion Rates**: Track session completion percentages
- **Revenue Tracking**: Monitor mentor earnings and hourly rates
- **Rating Analysis**: Average ratings and session counts
- **Export Functionality**: Export performance data to CSV

#### 🕒 Availability & Schedule Management
- **Time Slot Management**: Add/remove availability slots by day
- **Weekly Schedule**: Visual weekly availability overview
- **Timezone Support**: Handle different timezone configurations
- **Bulk Operations**: Manage multiple time slots efficiently

### ✅ Calendar Management (Fully Implemented)
The CalendarAndScheduleManager component includes all requested features:

#### 📅 Calendar Overview
- **Multi-View Calendar**: Month, week, and day view modes
- **Session Visualization**: All sessions displayed with color coding
- **Real-time Stats**: Today's sessions, weekly totals, active mentors
- **Event Management**: View and manage all calendar events
- **Navigation Controls**: Easy date navigation and view switching

#### 🗓️ Individual Mentor Schedule Management
- **Mentor Selection**: Choose specific mentors to manage
- **Schedule Overview**: Visual weekly availability display
- **Session Tracking**: View all scheduled sessions per mentor
- **Time Conflict Detection**: Prevent scheduling conflicts

#### 🕒 Availability Slot Configuration
- **Weekly Availability**: Configure availability by day of week
- **Time Slot Management**: Add/remove specific time slots
- **Bulk Operations**: Manage multiple availability periods
- **Timezone Support**: Handle different timezone configurations

### ✅ Events Management (Fully Implemented)
The EventsManager component includes all requested features:

#### 🎯 Create and Edit Events
- **Event Creation**: Comprehensive forms for creating events with all details
- **Event Editing**: Full editing capabilities for existing events
- **Event Types**: Support for workshops, webinars, networking, conferences, and other events
- **Scheduling**: Date/time management with start and end times
- **Location Management**: Support for both physical and virtual events
- **Capacity Control**: Set maximum attendees or unlimited capacity
- **Pricing**: Free or paid events with flexible pricing

#### 📋 Registration and Attendee Management
- **Registration Tracking**: View all event registrations in real-time
- **Attendee Management**: Manage attendee information and contact details
- **Attendance Tracking**: Mark attendees as present, no-show, or cancelled
- **Payment Status**: Track payment status for paid events
- **Registration Deadlines**: Set and enforce registration cutoff dates
- **Bulk Operations**: Export attendee lists and manage multiple registrations

#### 📊 Event Analytics and Tracking
- **Comprehensive Analytics**: Detailed performance metrics for each event
- **Attendance Rates**: Track and analyze attendance vs registration rates
- **Revenue Tracking**: Monitor event revenue and financial performance
- **Registration Trends**: Visual representation of registration patterns over time
- **Demographics Analysis**: Breakdown by attendee roles and locations
- **Performance Insights**: Event success metrics and recommendations

#### 📅 Calendar System Integration
- **Calendar Integration**: Events automatically appear in the calendar system
- **Schedule Coordination**: Prevent conflicts with mentor sessions and availability
- **Multi-view Support**: Events visible in month, week, and day calendar views
- **Real-time Updates**: Calendar updates immediately when events are created/modified
- **Status Management**: Draft, published, completed, and cancelled event states

### 🔧 Technical Implementation

#### API Integration
- **No Mock Data**: All data is fetched from backend APIs
- **Error Handling**: Graceful error handling with user notifications
- **Loading States**: Proper loading indicators for all API calls
- **Fallback Behavior**: Empty states when API calls fail
- **Real-time Updates**: Data refreshes after operations

#### Backend API Endpoints Used
- **Dashboard**: `/api/admin/dashboard/stats`, `/api/admin/sessions/recent`, `/api/admin/applications/recent`
- **Mentors**: `/api/admin/mentors`, `/api/admin/mentors/{id}`, `/api/admin/mentors/performance`
- **Applications**: `/api/admin/applications`, `/api/admin/applications/{id}/review`
- **Calendar**: `/api/admin/calendar/events`, `/api/admin/calendar/stats`
- **Schedule**: `/api/admin/schedule/mentors`, `/api/admin/mentors/{id}/availability`
- **Time-off**: `/api/admin/time-off`, `/api/admin/time-off/{id}/approve`
- **Sessions**: `/api/admin/sessions`, `/api/admin/sessions/{id}`
- **Events**: `/api/admin/events`, `/api/admin/events/{id}`, `/api/admin/events/{id}/registrations`, `/api/admin/events/{id}/analytics`
- **Registrations**: `/api/admin/registrations/{id}/attendance`

#### Technical Features
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Robust error management with user-friendly notifications
- **Responsive Design**: Mobile-friendly interface
- **Modal System**: Clean modal interfaces for detailed operations
- **Export Features**: CSV export for all data types

## Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for all async operations
- Use semantic HTML and accessibility features
- Keep components small and focused
- Write self-documenting code with clear naming