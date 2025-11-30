# Admin Dashboard Guide

Complete admin panel for managing Dog Angelenos business.

## Access

**URL**: http://localhost:3004/admin

**Demo Credentials**:
- Email: admin@dogangelenos.com
- Password: admin123

## Features

### 📊 Dashboard
- **Real-time Statistics**
  - Total bookings
  - Active customers
  - Number of trainers
  - Messages today
- **Recent Activity**
  - Latest bookings
  - Recent messages
- **Quick Actions**
  - View all sections
  - Navigate to specific areas

### 📅 Bookings Management
- **View All Bookings**
  - Customer name
  - Dog name
  - Program type
  - Date and time
  - Location
  - Status (pending, confirmed, completed, cancelled)
- **Actions**
  - Edit booking details
  - Update status
  - Delete booking
  - Open chat with customer
- **Filters**
  - By status
  - By date range
  - By program

### 👥 Customers Management
- **Customer Profiles**
  - Name and contact info
  - Email and phone
  - Dog information
  - Booking history
  - Total bookings count
- **Actions**
  - View full profile
  - Send message
  - View booking history
  - Edit customer details
- **Search**
  - Search by name
  - Search by email
  - Search by dog name

### 🎓 Trainers Management
- **Trainer Profiles**
  - Name and specialty
  - Years of experience
  - Rating (out of 5)
  - Active clients count
- **Actions**
  - View schedule
  - Assign to bookings
  - Edit profile
  - View performance
- **Add New Trainer**
  - Create trainer profile
  - Set specialty
  - Assign locations

### 💬 Chat Messages
- **Conversation List**
  - All active chats
  - Unread message count
  - Last message preview
  - Time stamps
- **Chat Interface**
  - Real-time messaging
  - Message history
  - Customer information
  - Booking context
- **Features**
  - Search conversations
  - Mark as read
  - Quick replies
  - File attachments (coming soon)

### 📆 Calendar View
- **Monthly Calendar**
  - All scheduled bookings
  - Color-coded by status
  - Training sessions
  - Trainer availability
- **Actions**
  - Add new event
  - Edit existing booking
  - View day details
  - Navigate months
- **Filters**
  - By trainer
  - By location
  - By program type

## API Endpoints

### Dashboard
```bash
GET /api/admin/stats
GET /api/admin/activity/recent
```

### Customers
```bash
GET /api/admin/customers
GET /api/admin/customers/{id}
```

### Bookings
```bash
GET /api/admin/bookings/all?status=pending
PUT /api/admin/bookings/{id}
DELETE /api/admin/bookings/{id}
```

### Chat
```bash
GET /api/admin/chat/conversations
```

### Calendar
```bash
GET /api/admin/calendar/events?start_date=2024-12-01&end_date=2024-12-31
```

### Analytics
```bash
GET /api/admin/analytics/bookings?days=30
```

## Usage Examples

### View Dashboard Stats
```bash
curl http://localhost:8000/api/admin/stats
```

### Get All Customers
```bash
curl http://localhost:8000/api/admin/customers
```

### Update Booking Status
```bash
curl -X PUT http://localhost:8000/api/admin/bookings/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### Get Calendar Events
```bash
curl "http://localhost:8000/api/admin/calendar/events?start_date=2024-12-01&end_date=2024-12-31"
```

## Security

### Authentication (Coming Soon)
- JWT token authentication
- Role-based access control
- Session management
- Password hashing

### Current Setup
- Demo login (no real auth)
- All endpoints accessible
- For development only

### Production Setup
```python
# Add authentication middleware
from fastapi import Security
from fastapi.security import HTTPBearer

security = HTTPBearer()

@router.get("/admin/stats")
def get_stats(token: str = Security(security)):
    # Verify token
    # Check admin role
    # Return data
```

## Customization

### Add New Admin Section

1. **Create Component** (frontend/app/admin/page.tsx)
```tsx
function MyNewSection() {
  return (
    <div>
      <h2>My New Section</h2>
      {/* Your content */}
    </div>
  );
}
```

2. **Add Tab Button**
```tsx
<TabButton
  icon="🆕"
  label="My Section"
  active={activeTab === "mysection"}
  onClick={() => setActiveTab("mysection")}
/>
```

3. **Add Route** (backend/admin.py)
```python
@router.get("/my-endpoint")
def my_endpoint(db: Session = Depends(get_db)):
    # Your logic
    return {"data": "value"}
```

## Best Practices

### Performance
- Paginate large lists
- Cache frequently accessed data
- Use database indexes
- Optimize queries

### User Experience
- Show loading states
- Display error messages
- Confirm destructive actions
- Auto-save changes

### Data Management
- Regular backups
- Audit logs
- Data validation
- Error handling

## Troubleshooting

### Can't Access Admin Panel
1. Check URL: http://localhost:3004/admin
2. Verify frontend is running
3. Check browser console for errors

### API Not Responding
1. Check backend is running: http://localhost:8000
2. Verify API endpoints: http://localhost:8000/docs
3. Check backend logs

### Data Not Loading
1. Check database connection
2. Verify sample data exists
3. Run `python init_db.py`

## Future Enhancements

- 📊 Advanced analytics and reports
- 📧 Email notifications
- 📱 Mobile app
- 🔔 Push notifications
- 📈 Revenue tracking
- 💳 Payment management
- 📄 Invoice generation
- 🎯 Marketing tools
- 📊 Performance metrics
- 🤖 AI-powered insights

## Support

For issues or questions:
- Check backend logs
- Review API documentation: http://localhost:8000/docs
- See main README.md
