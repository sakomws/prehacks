# API Gateway

The API Gateway provides a central entry point to access all agents through a unified API.

## Overview

The gateway routes requests to the appropriate agent services and can aggregate data from multiple agents. It runs on port **8080** and acts as a reverse proxy to the individual agent services.

## Architecture

```
Client Request
    ↓
API Gateway (Port 8080)
    ↓
    ├──→ Inbox Agent (Port 8001)
    ├──→ Event Agent (Port 8002)
    ├──→ Hackathon Agent (Port 8003)
    ├──→ Community Agent (Port 8004)
    └──→ Calendar Agent (Port 8005)
```

## Running the Gateway

### Prerequisites
All agent services must be running before starting the gateway.

1. Start all agents:
```bash
./run_all_agents.sh
```

2. Start the gateway:
```bash
./run_gateway.sh
```

Or run directly:
```bash
cd gateway
python3 gateway.py
```

## API Endpoints

### Health Check
- `GET /` - Check gateway and all agent statuses

### Inbox Routes
- `GET /inbox/conversations/{user_id}` - Get user conversations
- `GET /inbox/conversations/{conversation_id}/messages` - Get conversation messages
- `POST /inbox/conversations/{conversation_id}/summary` - Generate AI summary
- `POST /inbox/conversations/{conversation_id}/reply` - Generate AI reply

### Event Routes
- `GET /events` - Get events (upcoming/past)
- `GET /events/{event_id}` - Get event details
- `POST /events/{event_id}/rsvp` - Create/update RSVP

### Hackathon Routes
- `GET /hackathons` - Get hackathons
- `GET /hackathons/{hackathon_id}` - Get hackathon details
- `POST /hackathons/{hackathon_id}/register` - Register participant

### Community Routes
- `GET /communities` - Get communities
- `GET /communities/{community_id}` - Get community details
- `GET /communities/{community_id}/analytics` - Get community analytics

### Calendar Routes
- `GET /calendars/{user_id}` - Get user calendars
- `GET /calendars/{user_id}/events` - Get calendar events
- `GET /calendars/{user_id}/analytics` - Get calendar analytics

### Aggregated Routes
- `GET /users/{user_id}/dashboard` - Get aggregated dashboard data from all agents

## Example Usage

### Get User Dashboard (Aggregated)
```bash
curl http://localhost:8080/users/1/dashboard
```

This returns data from all agents:
```json
{
  "user_id": 1,
  "inbox": {
    "conversations": [...],
    "count": 5
  },
  "events": {
    "events": [...]
  },
  "hackathons": [...],
  "communities": [...],
  "calendar": {...}
}
```

### Get Conversations
```bash
curl "http://localhost:8080/inbox/conversations/1?intent_filter=1:1&mode=focus"
```

### Get Events
```bash
curl "http://localhost:8080/events?event_type=upcoming&limit=10"
```

### Create RSVP
```bash
curl -X POST "http://localhost:8080/events/1/rsvp" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "status": "attending"}'
```

## Error Handling

The gateway handles errors gracefully:
- If an agent is offline, the gateway returns a 502 error with details
- Health check endpoint shows status of all agents
- Aggregated endpoints return partial data if some agents are unavailable

## Configuration

Agent URLs are configured in `gateway/gateway.py`:
```python
AGENT_URLS = {
    "inbox": "http://localhost:8001",
    "event": "http://localhost:8002",
    "hackathon": "http://localhost:8003",
    "community": "http://localhost:8004",
    "calendar": "http://localhost:8005"
}
```

For production, update these URLs to point to your deployed agent services.

## Benefits

1. **Single Entry Point**: One API endpoint for all services
2. **Aggregation**: Combine data from multiple agents in one request
3. **Load Balancing**: Can be extended to distribute load across agent instances
4. **Monitoring**: Centralized health checks and status monitoring
5. **Authentication**: Can add authentication/authorization at the gateway level
6. **Rate Limiting**: Can implement rate limiting centrally

## Development

The gateway uses `httpx` for async HTTP requests to agent services. It's built with FastAPI and follows the same patterns as the agent services.

