# In-App Chat System

Real-time chat between trainers and customers using WebSockets.

## Features

✅ **Real-time messaging** - Instant message delivery using WebSockets
✅ **Persistent chat history** - All messages saved to database
✅ **Unread message counter** - Badge showing unread messages
✅ **Online status indicator** - Shows connection status
✅ **Read receipts** - Mark messages as read
✅ **Typing indicators** - See when someone is typing (coming soon)
✅ **Mobile responsive** - Works on all devices
✅ **Booking-specific chats** - Each booking has its own chat room

## How It Works

### Backend (Python FastAPI)

1. **WebSocket Server** - Real-time bidirectional communication
2. **Connection Manager** - Manages active WebSocket connections
3. **Database Storage** - Stores all messages in PostgreSQL
4. **REST API** - Get chat history, unread counts, mark as read

### Frontend (Next.js/React)

1. **Chat Component** - Reusable chat UI component
2. **WebSocket Client** - Connects to backend WebSocket
3. **Message Display** - Shows messages with timestamps
4. **Unread Badge** - Shows count of unread messages

## Usage

### For Customers

1. Book a training session
2. Click the chat button (💬) in bottom right
3. Start chatting with your trainer
4. Get real-time responses

### For Trainers

1. View bookings dashboard
2. Click chat for any booking
3. Respond to customer questions
4. Provide training updates

## Testing the Chat

### Option 1: Chat Demo Page

Visit: http://localhost:3004/chat

1. Open in two browser windows
2. Set one as "Customer" and one as "Trainer"
3. Use the same Booking ID
4. Start chatting!

### Option 2: API Testing

```bash
# Get chat history
curl http://localhost:8000/api/chat/1/history

# Get unread count
curl http://localhost:8000/api/chat/1/unread?user_email=sarah@example.com

# Mark as read
curl -X POST http://localhost:8000/api/chat/1/mark-read?user_email=sarah@example.com

# Check active connections
curl http://localhost:8000/api/chat/active-connections/1
```

### Option 3: WebSocket Testing

Use a WebSocket client like `wscat`:

```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws/chat/1

# Send a message
{"sender_email":"test@example.com","sender_name":"Test User","sender_type":"customer","message":"Hello!"}
```

## Integration

### Add Chat to Any Page

```tsx
import Chat from "@/app/components/Chat";

<Chat
  bookingId={1}
  userEmail="customer@example.com"
  userName="John Doe"
  userType="customer"
/>
```

### Props

- `bookingId` - The booking ID for this chat
- `userEmail` - Current user's email
- `userName` - Current user's name
- `userType` - Either "customer" or "trainer"

## Database Schema

### chat_messages Table

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    sender_email VARCHAR NOT NULL,
    sender_name VARCHAR NOT NULL,
    sender_type VARCHAR NOT NULL,  -- 'customer' or 'trainer'
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);
```

## API Endpoints

### WebSocket

- `WS /ws/chat/{booking_id}` - Real-time chat connection

### REST API

- `GET /api/chat/{booking_id}/history` - Get chat history
- `GET /api/chat/{booking_id}/unread?user_email=` - Get unread count
- `POST /api/chat/{booking_id}/mark-read?user_email=` - Mark as read
- `GET /api/chat/active-connections/{booking_id}` - Check online status

## Features Coming Soon

- 🔔 Push notifications for new messages
- ⌨️ Typing indicators
- 📎 File attachments (images, documents)
- 🎤 Voice messages
- 📹 Video call integration
- 🤖 AI-powered auto-responses
- 📊 Chat analytics for trainers
- 🔍 Message search
- 📱 Mobile app integration

## Security

- ✅ WebSocket authentication (coming soon)
- ✅ Message encryption (coming soon)
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ SQL injection protection

## Performance

- Connection pooling for database
- Message pagination (100 messages per load)
- Efficient WebSocket broadcasting
- Automatic reconnection on disconnect

## Troubleshooting

### Chat not connecting

1. Check backend is running: `http://localhost:8000`
2. Check WebSocket endpoint: `ws://localhost:8000/ws/chat/1`
3. Check browser console for errors
4. Verify booking ID exists

### Messages not sending

1. Check WebSocket connection status
2. Verify user email and name are set
3. Check backend logs for errors
4. Try refreshing the page

### Messages not appearing

1. Check if both users are in same booking
2. Verify WebSocket is connected
3. Check database for messages
4. Try clearing browser cache

## Production Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379  # For scaling WebSockets

# Frontend
NEXT_PUBLIC_WS_URL=wss://api.dogangelenos.com
NEXT_PUBLIC_API_URL=https://api.dogangelenos.com
```

### Scaling WebSockets

For production with multiple servers, use Redis pub/sub:

```python
# Install redis
pip install redis

# Update chat.py to use Redis for broadcasting
```

### SSL/TLS

Use `wss://` instead of `ws://` for secure WebSocket connections.

## Resources

- FastAPI WebSockets: https://fastapi.tiangolo.com/advanced/websockets/
- React WebSocket: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- PostgreSQL: https://www.postgresql.org/docs/
