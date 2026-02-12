# WhatsApp Integration Documentation

## Overview

The WhatsApp integration connects your LPM communities with WhatsApp Business API to sync members, messages, and activities. This enables automatic analysis of community interactions for LPM values alignment and feature enhancement.

## Architecture

```
Frontend (Next.js) → Backend API → WhatsApp Business API
                  ↓
              Database Storage
```

## Backend API Endpoints Required

Your backend needs to implement these endpoints:

### 1. Get WhatsApp Communities
```
GET /api/whatsapp/communities
```
Returns list of available WhatsApp communities.

**Response:**
```json
{
  "communities": [
    {
      "id": "community_id",
      "name": "Community Name",
      "description": "Community description",
      "invite_link": "https://chat.whatsapp.com/...",
      "member_count": 156,
      "admin_phone": "+1234567890",
      "created_at": "2024-01-15T00:00:00Z",
      "is_active": true
    }
  ]
}
```

### 2. Get Community Members
```
GET /api/whatsapp/communities/{id}/members
```
Returns members of a specific WhatsApp community.

**Response:**
```json
{
  "members": [
    {
      "phone": "+1234567890",
      "name": "Member Name",
      "profile_pic": "https://...",
      "joined_at": "2024-01-15T00:00:00Z",
      "is_admin": true,
      "last_seen": "2024-12-15T10:30:00Z"
    }
  ]
}
```

### 3. Get Community Messages
```
GET /api/whatsapp/communities/{id}/messages?limit=50
```
Returns recent messages from a WhatsApp community.

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_id",
      "from": "+1234567890",
      "timestamp": "2024-12-15T10:30:00Z",
      "type": "text",
      "content": "Message content",
      "community_id": "community_id"
    }
  ]
}
```

### 4. Get LMP Analysis
```
GET /api/whatsapp/communities/{id}/lmp-analysis
```
Returns analyzed data for LMP features.

**Response:**
```json
{
  "members": [...],
  "valuesAnalysis": {
    "+1234567890": {
      "integrity": 5,
      "doer": 8,
      "giver": 3,
      "passion": 6,
      "resilience": 4
    }
  },
  "helpRequests": [...],
  "collaborations": [...],
  "educationalContent": [...],
  "promotions": [...]
}
```

### 5. Send Message
```
POST /api/whatsapp/send-message
```
Sends a message to a WhatsApp community.

**Request:**
```json
{
  "communityId": "community_id",
  "message": "Message content"
}
```

### 6. Sync Hackathon
```
POST /api/whatsapp/sync-hackathon
```
Syncs hackathon information to WhatsApp community.

**Request:**
```json
{
  "hackathonId": 123,
  "communityId": "community_id"
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Backend API Configuration
BACKEND_URL=http://localhost:8001
BACKEND_API_KEY=your_backend_api_key_here

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Features

### 1. Community Sync
- Pull member lists from WhatsApp communities
- Sync member profiles and activity status
- Map WhatsApp members to LMP community members

### 2. Message Analysis
- Analyze messages for LMP values (integrity, doer, giver, passion, resilience)
- Extract help requests automatically
- Identify collaboration opportunities
- Detect educational content sharing
- Find promotion activities

### 3. Hackathon Integration
- Share hackathon announcements to WhatsApp communities
- Format hackathon details with registration links
- Track engagement and responses

### 4. Real-time Webhooks
- Receive WhatsApp messages in real-time
- Process messages for LMP analysis
- Auto-respond to specific keywords
- Store activities for community features

## Usage

### In Community Pages
1. Navigate to any community detail page
2. Click on the "WhatsApp" tab
3. Select a WhatsApp community to sync
4. Click "Sync Community Data"
5. View analyzed data and member insights

### In Hackathon Pages
1. Open any hackathon detail page
2. Click "Share to WhatsApp" button
3. Select target WhatsApp communities
4. Hackathon details are automatically formatted and sent

## Error Handling

The integration includes comprehensive error handling:

- **Connection Errors**: Shows retry options when backend is unavailable
- **API Errors**: Displays user-friendly error messages
- **Empty States**: Handles cases with no communities or data
- **Loading States**: Shows appropriate loading indicators

## Security

- All API calls use authentication tokens
- WhatsApp webhook verification for security
- Rate limiting and error boundaries
- No sensitive data stored in frontend

## Development

To test the integration:

1. Ensure your backend is running on `http://localhost:8001`
2. Configure WhatsApp Business API credentials
3. Set up webhook endpoints for real-time message processing
4. Test with actual WhatsApp communities

## Troubleshooting

**No communities showing:**
- Check backend API connection
- Verify WhatsApp Business API credentials
- Ensure communities are properly configured

**Sync failing:**
- Check network connectivity
- Verify API endpoints are responding
- Check browser console for detailed errors

**Messages not processing:**
- Verify webhook URL is accessible
- Check webhook verification token
- Ensure message processing is enabled