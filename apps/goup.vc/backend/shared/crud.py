from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional
from datetime import datetime, timedelta
import database
import models

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(database.User).filter(database.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(database.User).filter(database.User.email == email).first()

def create_user(db: Session, user: models.UserCreate):
    db_user = database.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Conversation CRUD
def get_conversations(db: Session, user_id: int, intent_filter: Optional[str] = None, mode: Optional[str] = None):
    query = db.query(database.Conversation).join(
        database.conversation_participants
    ).filter(database.conversation_participants.c.user_id == user_id)
    
    if intent_filter and intent_filter != 'all':
        query = query.filter(database.Conversation.intent == intent_filter)
    
    if mode == 'focus':
        query = query.filter(database.Conversation.needs_action == True)
    elif mode == 'event':
        query = query.filter(database.Conversation.intent == 'event')
    elif mode == 'people':
        query = query.filter(database.Conversation.intent == '1:1')
    
    return query.order_by(desc(database.Conversation.priority), desc(database.Conversation.updated_at)).all()

def get_conversation(db: Session, conversation_id: int):
    return db.query(database.Conversation).filter(database.Conversation.id == conversation_id).first()

def create_conversation(db: Session, conversation: models.ConversationCreate):
    db_conversation = database.Conversation(
        title=conversation.title,
        intent=conversation.intent,
        status=conversation.status,
        needs_action=conversation.needs_action,
        action_type=conversation.action_type,
        ai_summary=conversation.ai_summary,
        priority=conversation.priority
    )
    db.add(db_conversation)
    db.commit()
    
    # Add participants
    for user_id in conversation.participant_ids:
        user = get_user(db, user_id)
        if user:
            db_conversation.participants.append(user)
    
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def update_conversation(db: Session, conversation_id: int, conversation_update: models.ConversationUpdate):
    db_conversation = get_conversation(db, conversation_id)
    if db_conversation:
        update_data = conversation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_conversation, field, value)
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_conversation)
    return db_conversation

# Message CRUD
def get_messages(db: Session, conversation_id: int, limit: int = 50):
    return db.query(database.Message).filter(
        database.Message.conversation_id == conversation_id
    ).order_by(desc(database.Message.created_at)).limit(limit).all()

def create_message(db: Session, message: models.MessageCreate):
    db_message = database.Message(**message.dict())
    db.add(db_message)
    
    # Update conversation timestamp
    conversation = get_conversation(db, message.conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_message)
    return db_message

# Mute setting CRUD
def create_mute_setting(db: Session, mute_setting: models.MuteSettingCreate):
    # Deactivate existing mute settings for this conversation/user
    db.query(database.MuteSetting).filter(
        database.MuteSetting.conversation_id == mute_setting.conversation_id,
        database.MuteSetting.user_id == mute_setting.user_id
    ).update({"is_active": False})
    
    db_mute = database.MuteSetting(**mute_setting.dict())
    db.add(db_mute)
    db.commit()
    db.refresh(db_mute)
    return db_mute

def get_active_mute_setting(db: Session, conversation_id: int, user_id: int):
    return db.query(database.MuteSetting).filter(
        database.MuteSetting.conversation_id == conversation_id,
        database.MuteSetting.user_id == user_id,
        database.MuteSetting.is_active == True
    ).first()

# Event CRUD
def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Event).offset(skip).limit(limit).all()

def get_event(db: Session, event_id: int):
    return db.query(database.Event).filter(database.Event.id == event_id).first()

def delete_event(db: Session, event_id: int):
    event = get_event(db, event_id)
    if event:
        # Delete related host approval requests first (they don't have cascade delete)
        db.query(database.HostApprovalRequest).filter(
            database.HostApprovalRequest.event_id == event_id
        ).delete()
        
        # Delete the event (RSVPs will be deleted automatically due to cascade)
        db.delete(event)
        db.commit()
        return True
    return False

def create_event(db: Session, event: models.EventCreate):
    # Extract cohost_ids before creating event
    cohost_ids = event.cohost_ids or []
    event_data = event.dict()
    del event_data['cohost_ids']
    
    db_event = database.Event(**event_data)
    db.add(db_event)
    db.commit()
    
    # Add co-hosts
    for cohost_id in cohost_ids:
        cohost = get_user(db, cohost_id)
        if cohost:
            db_event.cohosts.append(cohost)
    
    db.commit()
    db.refresh(db_event)
    return db_event

def add_cohost(db: Session, event_id: int, user_id: int):
    event = get_event(db, event_id)
    user = get_user(db, user_id)
    if event and user and user not in event.cohosts:
        event.cohosts.append(user)
        db.commit()
        db.refresh(event)
    return event

def remove_cohost(db: Session, event_id: int, user_id: int):
    event = get_event(db, event_id)
    user = get_user(db, user_id)
    if event and user and user in event.cohosts:
        event.cohosts.remove(user)
        db.commit()
        db.refresh(event)
    return event

# RSVP CRUD
def create_rsvp(db: Session, rsvp: models.EventRSVPCreate):
    # Check if RSVP already exists
    existing_rsvp = db.query(database.EventRSVP).filter(
        database.EventRSVP.event_id == rsvp.event_id,
        database.EventRSVP.user_id == rsvp.user_id
    ).first()
    
    if existing_rsvp:
        # Update existing RSVP
        existing_rsvp.status = rsvp.status
        existing_rsvp.message = rsvp.message
        existing_rsvp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_rsvp)
        return existing_rsvp
    else:
        # Create new RSVP
        db_rsvp = database.EventRSVP(**rsvp.dict())
        db.add(db_rsvp)
        db.commit()
        db.refresh(db_rsvp)
        return db_rsvp

def get_event_rsvps(db: Session, event_id: int, status_filter: Optional[str] = None):
    query = db.query(database.EventRSVP).filter(database.EventRSVP.event_id == event_id)
    if status_filter:
        query = query.filter(database.EventRSVP.status == status_filter)
    return query.all()

def update_rsvp_status(db: Session, rsvp_id: int, rsvp_update: models.EventRSVPUpdate):
    db_rsvp = db.query(database.EventRSVP).filter(database.EventRSVP.id == rsvp_id).first()
    if db_rsvp:
        update_data = rsvp_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_rsvp, field, value)
        db_rsvp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_rsvp)
    return db_rsvp

# Host approval CRUD
def create_host_approval_request(db: Session, request: models.HostApprovalRequestCreate):
    db_request = database.HostApprovalRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_host_approval_requests(db: Session, event_id: Optional[int] = None, user_id: Optional[int] = None):
    query = db.query(database.HostApprovalRequest)
    if event_id:
        query = query.filter(database.HostApprovalRequest.event_id == event_id)
    if user_id:
        query = query.filter(
            (database.HostApprovalRequest.requester_id == user_id) |
            (database.HostApprovalRequest.requested_user_id == user_id)
        )
    return query.order_by(desc(database.HostApprovalRequest.created_at)).all()

def update_host_approval_request(db: Session, request_id: int, request_update: models.HostApprovalRequestUpdate):
    db_request = db.query(database.HostApprovalRequest).filter(
        database.HostApprovalRequest.id == request_id
    ).first()
    if db_request:
        update_data = request_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_request, field, value)
        db_request.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_request)
        
        # If approved and it's a cohost request, add the user as cohost
        if (db_request.status == 'approved' and 
            db_request.request_type == 'cohost'):
            add_cohost(db, db_request.event_id, db_request.requested_user_id)
    
    return db_request

# AI helper functions
def generate_ai_summary(messages: List[database.Message]) -> str:
    """Generate AI summary from conversation messages"""
    if not messages:
        return "No messages in this conversation yet."
    
    # Simple summary generation (in real app, use actual AI)
    recent_messages = messages[:5]  # Last 5 messages
    participants = set(msg.sender.full_name for msg in recent_messages if msg.sender)
    
    if len(messages) == 1:
        return f"New conversation started by {messages[0].sender.full_name if messages[0].sender else 'Unknown'}."
    
    return f"Active discussion with {len(participants)} participants. Latest activity involves planning and coordination. {len(messages)} total messages."

def search_conversations(db: Session, user_id: int, query: str):
    """Search conversations using natural language query"""
    # Simple keyword search (in real app, use vector search/AI)
    keywords = query.lower().split()
    
    conversations = db.query(database.Conversation).join(
        database.conversation_participants
    ).filter(database.conversation_participants.c.user_id == user_id)
    
    # Search in titles and summaries
    for keyword in keywords:
        conversations = conversations.filter(
            or_(
                database.Conversation.title.ilike(f"%{keyword}%"),
                database.Conversation.ai_summary.ilike(f"%{keyword}%")
            )
        )
    
    return conversations.all()

def update_conversation_priority(db: Session, user_id: int):
    """Update conversation priorities based on user behavior"""
    # Simple priority algorithm (in real app, use ML)
    conversations = get_conversations(db, user_id)
    
    for i, conv in enumerate(conversations):
        # Higher priority for conversations that need action
        priority = 100 - i
        if conv.needs_action:
            priority += 50
        if conv.intent == '1:1':
            priority += 20
        
        conv.priority = priority
    
    db.commit()