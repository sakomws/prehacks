# Independent Python Agents

This directory contains 5 independent Python agents, each responsible for a specific domain of the Goup.VC platform.

## Agents Overview

### 1. Inbox Agent (`inbox_agent.py`)
**Purpose**: Manages conversations, messages, and inbox operations with AI-powered features.

**Key Features**:
- Get and filter conversations by intent, mode, or user
- Create and retrieve messages
- Generate AI summaries of conversations
- Generate AI replies using templates or custom prompts
- Search conversations
- Update conversation priority and action status

**Usage**:
```python
from inbox_agent import create_inbox_agent
from database import SessionLocal

db = SessionLocal()
agent = create_inbox_agent(db)

# Get conversations
conversations = agent.get_conversations(user_id=1, intent_filter="1:1")

# Generate AI summary
summary = agent.generate_ai_summary(conversation_id=1)

# Generate AI reply
reply = agent.generate_ai_reply(conversation_id=1, template_id="polite-decline")
```

### 2. Event Agent (`event_agent.py`)
**Purpose**: Manages events, RSVPs, and event-related operations.

**Key Features**:
- Get events (upcoming/past) with filtering
- Create, update, and delete events
- Manage RSVPs (create, update, retrieve)
- Add/remove co-hosts
- Generate AI insights for events
- Get event analytics

**Usage**:
```python
from event_agent import create_event_agent
from database import SessionLocal

db = SessionLocal()
agent = create_event_agent(db)

# Get upcoming events
events = agent.get_events(event_type="upcoming")

# Create RSVP
rsvp = agent.create_rsvp(event_id=1, user_id=1, status="attending")

# Get AI insights
insights = agent.get_ai_insights(event_id=1, user_id=1)
```

### 3. Hackathon Agent (`hackathon_agent.py`)
**Purpose**: Manages hackathons, teams, submissions, and hackathon operations.

**Key Features**:
- Get and create hackathons
- Register participants
- Create and manage teams
- Submit projects
- Get team and submission information
- Get AI-powered team suggestions

**Usage**:
```python
from hackathon_agent import create_hackathon_agent
from database import SessionLocal

db = SessionLocal()
agent = create_hackathon_agent(db)

# Get hackathons
hackathons = agent.get_hackathons(status="active")

# Register participant
registration = agent.register_participant(
    hackathon_id=1, 
    user_id=1,
    skills=["Python", "React"],
    interests=["AI", "Web Development"]
)

# Create team
team = agent.create_team(
    hackathon_id=1,
    team_name="Team Awesome",
    leader_id=1,
    member_ids=[2, 3]
)
```

### 4. Community Agent (`community_agent.py`)
**Purpose**: Manages communities, members, and community operations.

**Key Features**:
- Get and create communities
- Add/remove members
- Get community members and events
- Get community analytics (growth rate, engagement score)
- Manage community conversations

**Usage**:
```python
from community_agent import create_community_agent
from database import SessionLocal

db = SessionLocal()
agent = create_community_agent(db)

# Get communities
communities = agent.get_communities(user_id=1)

# Create community
community = agent.create_community(
    title="AI Enthusiasts",
    organizer_id=1,
    description="A community for AI enthusiasts"
)

# Get analytics
analytics = agent.get_community_analytics(community_id=1)
```

### 5. Calendar Agent (`calendar_agent.py`)
**Purpose**: Manages calendars, scheduling, and time management.

**Key Features**:
- Get user calendars and events
- Get availability for date ranges
- Suggest optimal event times
- Check for scheduling conflicts
- Get calendar analytics (events count, hours spent, busy days)

**Usage**:
```python
from calendar_agent import create_calendar_agent
from database import SessionLocal
from datetime import datetime, timedelta

db = SessionLocal()
agent = create_calendar_agent(db)

# Get user calendars
calendars = agent.get_user_calendars(user_id=1)

# Get availability
start_date = datetime.utcnow()
end_date = start_date + timedelta(days=7)
availability = agent.get_availability(user_id=1, start_date=start_date, end_date=end_date)

# Suggest event time
suggestions = agent.suggest_event_time(
    organizer_id=1,
    duration_minutes=60,
    participant_ids=[2, 3]
)

# Get analytics
analytics = agent.get_calendar_analytics(user_id=1, days=30)
```

## Architecture

Each agent is:
- **Independent**: Can be used separately without dependencies on other agents
- **Self-contained**: Has its own class with methods for all operations in its domain
- **Database-aware**: Uses SQLAlchemy sessions for database operations
- **Type-safe**: Uses type hints for better code clarity
- **Error-handling**: Includes proper error handling and validation

## Design Patterns

1. **Factory Functions**: Each agent has a `create_*_agent()` factory function for easy instantiation
2. **Session Management**: Agents expect a database session to be passed in (dependency injection)
3. **Return Types**: Methods return dictionaries or lists of dictionaries for easy JSON serialization
4. **Error Handling**: Methods return error dictionaries instead of raising exceptions in some cases

## Integration

These agents can be:
- Used directly in FastAPI routes
- Imported into other modules
- Used in background tasks
- Tested independently
- Extended with additional functionality

## Example: Using Multiple Agents Together

```python
from database import SessionLocal
from inbox_agent import create_inbox_agent
from event_agent import create_event_agent
from calendar_agent import create_calendar_agent

db = SessionLocal()

# Initialize agents
inbox = create_inbox_agent(db)
events = create_event_agent(db)
calendar = create_calendar_agent(db)

# Use them together
user_id = 1

# Get user's conversations
conversations = inbox.get_conversations(user_id=user_id)

# Get user's events
user_events = events.get_events(user_id=user_id)

# Get calendar availability
availability = calendar.get_availability(user_id=user_id, ...)

# Suggest event time based on availability
suggestions = calendar.suggest_event_time(organizer_id=user_id, ...)
```

## Notes

- All agents use the same database session and models from `database.py`
- Agents are designed to be stateless (except for the database session)
- Each agent focuses on a single domain following the Single Responsibility Principle
- Agents can be easily extended with additional methods as needed

