# Independent Agents Setup

All 5 agents are now organized in separate folders and can run independently.

## Folder Structure

```
backend/
├── inbox/
│   ├── __init__.py
│   └── inbox_agent.py      # Port 8001
├── event/
│   ├── __init__.py
│   └── event_agent.py      # Port 8002
├── hackathon/
│   ├── __init__.py
│   └── hackathon_agent.py  # Port 8003
├── community/
│   ├── __init__.py
│   └── community_agent.py  # Port 8004
└── calendar/
    ├── __init__.py
    └── calendar_agent.py    # Port 8005
```

## Running Agents Individually

Each agent can be run independently as a FastAPI service:

### Inbox Agent (Port 8001)
```bash
cd backend/inbox
python3 inbox_agent.py
```

Access at: http://localhost:8001

### Event Agent (Port 8002)
```bash
cd backend/event
python3 event_agent.py
```

Access at: http://localhost:8002

### Hackathon Agent (Port 8003)
```bash
cd backend/hackathon
python3 hackathon_agent.py
```

Access at: http://localhost:8003

### Community Agent (Port 8004)
```bash
cd backend/community
python3 community_agent.py
```

Access at: http://localhost:8004

### Calendar Agent (Port 8005)
```bash
cd backend/calendar
python3 calendar_agent.py
```

Access at: http://localhost:8005

## Running All Agents at Once

Use the provided script to run all agents simultaneously:

```bash
cd backend
./run_all_agents.sh
```

This will start all 5 agents in the background, each on their respective ports.

## API Endpoints

Each agent exposes its own FastAPI endpoints:

### Inbox Agent (8001)
- `GET /` - Agent status
- `GET /conversations/{user_id}` - Get conversations
- `GET /conversations/{conversation_id}/messages` - Get messages
- `POST /conversations/{conversation_id}/summary` - Generate AI summary
- `POST /conversations/{conversation_id}/reply` - Generate AI reply

### Event Agent (8002)
- `GET /` - Agent status
- `GET /events` - Get events
- `GET /events/{event_id}` - Get event details
- `POST /events/{event_id}/rsvp` - Create RSVP

### Hackathon Agent (8003)
- `GET /` - Agent status
- `GET /hackathons` - Get hackathons
- `GET /hackathons/{hackathon_id}` - Get hackathon details
- `POST /hackathons/{hackathon_id}/register` - Register participant

### Community Agent (8004)
- `GET /` - Agent status
- `GET /communities` - Get communities
- `GET /communities/{community_id}` - Get community details
- `GET /communities/{community_id}/analytics` - Get analytics

### Calendar Agent (8005)
- `GET /` - Agent status
- `GET /calendars/{user_id}` - Get user calendars
- `GET /calendars/{user_id}/events` - Get calendar events
- `GET /calendars/{user_id}/analytics` - Get calendar analytics

## Using Agents as Modules

You can also import and use agents as Python modules:

```python
from inbox import create_inbox_agent
from database import SessionLocal

db = SessionLocal()
agent = create_inbox_agent(db)

# Use the agent
conversations = agent.get_conversations(user_id=1)
```

## Notes

- All agents share the same database (`goup_vc.db`)
- Each agent initializes the database tables on startup
- Agents use CORS middleware to allow cross-origin requests
- Each agent is completely independent and can be deployed separately

