"""
Inbox Agent - Independent agent for managing conversations, messages, and inbox operations.
Handles AI-powered inbox features including summaries, replies, and conversation management.
"""

import sys
import os

# Add parent directory and shared folder to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(parent_dir, 'shared'))
sys.path.insert(0, parent_dir)

from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import database
import models


class InboxAgent:
    """Independent agent for inbox and conversation management."""
    
    def __init__(self, db: Session):
        """Initialize the inbox agent with a database session."""
        self.db = db
    
    def get_conversations(
        self, 
        user_id: int, 
        intent_filter: Optional[str] = None, 
        mode: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get conversations for a user with optional filtering."""
        query = self.db.query(database.Conversation).join(
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
        
        conversations = query.order_by(
            desc(database.Conversation.priority), 
            desc(database.Conversation.updated_at)
        ).all()
        
        result = []
        for conv in conversations:
            result.append({
                "id": conv.id,
                "title": conv.title,
                "intent": conv.intent,
                "status": conv.status,
                "needs_action": conv.needs_action,
                "action_type": conv.action_type,
                "ai_summary": conv.ai_summary or "No summary available",
                "priority": conv.priority,
                "participants": [{"id": p.id, "name": p.full_name} for p in conv.participants],
                "unread_count": self._get_unread_count(conv.id),
                "last_activity": self._get_relative_time(conv.updated_at),
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None
            })
        
        return result
    
    def get_conversation(self, conversation_id: int) -> Optional[Dict[str, Any]]:
        """Get a single conversation by ID."""
        conv = self.db.query(database.Conversation).filter(
            database.Conversation.id == conversation_id
        ).first()
        
        if not conv:
            return None
        
        return {
            "id": conv.id,
            "title": conv.title,
            "intent": conv.intent,
            "status": conv.status,
            "needs_action": conv.needs_action,
            "action_type": conv.action_type,
            "ai_summary": conv.ai_summary,
            "priority": conv.priority,
            "participants": [{"id": p.id, "name": p.full_name} for p in conv.participants]
        }
    
    def get_messages(self, conversation_id: int, limit: int = 100) -> List[Dict[str, Any]]:
        """Get messages for a conversation."""
        messages = self.db.query(database.Message).filter(
            database.Message.conversation_id == conversation_id
        ).order_by(desc(database.Message.created_at)).limit(limit).all()
        
        return [{
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.full_name if msg.sender else "Unknown",
            "content": msg.content,
            "message_type": msg.message_type,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        } for msg in reversed(messages)]
    
    def create_message(
        self, 
        conversation_id: int, 
        sender_id: int, 
        content: str,
        message_type: str = "text"
    ) -> Dict[str, Any]:
        """Create a new message in a conversation."""
        message = database.Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type
        )
        self.db.add(message)
        
        # Update conversation timestamp
        conversation = self.db.query(database.Conversation).filter(
            database.Conversation.id == conversation_id
        ).first()
        if conversation:
            conversation.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(message)
        
        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "message_type": message.message_type,
            "created_at": message.created_at.isoformat() if message.created_at else None
        }
    
    def generate_ai_summary(self, conversation_id: int) -> Dict[str, Any]:
        """Generate AI summary for a conversation."""
        conversation = self.db.query(database.Conversation).filter(
            database.Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            return {"error": "Conversation not found"}
        
        messages = self.db.query(database.Message).filter(
            database.Message.conversation_id == conversation_id
        ).order_by(database.Message.created_at).all()
        
        # Generate summary based on messages
        if messages:
            summary = f"Conversation about {conversation.title}. "
            summary += f"Total {len(messages)} messages. "
            summary += f"Last activity: {self._get_relative_time(conversation.updated_at)}."
            
            # Update conversation with summary
            conversation.ai_summary = summary
            self.db.commit()
            
            return {
                "summary": summary,
                "key_decisions": self._extract_decisions(messages),
                "open_questions": self._extract_questions(messages),
                "deadlines": self._extract_deadlines(messages)
            }
        
        return {"summary": "No messages in this conversation yet."}
    
    def generate_ai_reply(
        self, 
        conversation_id: int, 
        template_id: Optional[str] = None,
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI reply for a conversation."""
        conversation = self.db.query(database.Conversation).filter(
            database.Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            return {"error": "Conversation not found"}
        
        if template_id:
            reply = self._generate_template_reply(template_id, conversation)
        elif custom_prompt:
            reply = self._generate_custom_reply(custom_prompt, conversation)
        else:
            return {"error": "Either template_id or custom_prompt required"}
        
        return {
            "generated_reply": reply,
            "conversation_context": conversation.ai_summary or "No context available"
        }
    
    def search_conversations(self, user_id: int, query: str) -> List[Dict[str, Any]]:
        """Search conversations by title or content."""
        conversations = self.db.query(database.Conversation).join(
            database.conversation_participants
        ).filter(
            database.conversation_participants.c.user_id == user_id
        ).filter(
            or_(
                database.Conversation.title.ilike(f"%{query}%"),
                database.Conversation.ai_summary.ilike(f"%{query}%")
            )
        ).all()
        
        return [{
            "id": conv.id,
            "title": conv.title,
            "intent": conv.intent,
            "ai_summary": conv.ai_summary or "",
            "priority": conv.priority
        } for conv in conversations]
    
    def update_conversation_priority(
        self, 
        conversation_id: int, 
        priority: int
    ) -> bool:
        """Update conversation priority."""
        conversation = self.db.query(database.Conversation).filter(
            database.Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            return False
        
        conversation.priority = priority
        self.db.commit()
        return True
    
    def mark_needs_action(
        self, 
        conversation_id: int, 
        needs_action: bool,
        action_type: Optional[str] = None
    ) -> bool:
        """Mark conversation as needing action or not."""
        conversation = self.db.query(database.Conversation).filter(
            database.Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            return False
        
        conversation.needs_action = needs_action
        if action_type:
            conversation.action_type = action_type
        self.db.commit()
        return True
    
    def _get_unread_count(self, conversation_id: int) -> int:
        """Get unread message count for a conversation."""
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        count = self.db.query(database.Message).filter(
            database.Message.conversation_id == conversation_id,
            database.Message.created_at > one_day_ago
        ).count()
        return count
    
    def _get_relative_time(self, dt: datetime) -> str:
        """Convert datetime to relative time string."""
        if not dt:
            return "unknown"
        
        now = datetime.utcnow()
        diff = now - dt
        
        if diff.days > 0:
            return f"{diff.days}d"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600}h"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60}m"
        else:
            return "now"
    
    def _extract_decisions(self, messages: List[database.Message]) -> List[str]:
        """Extract key decisions from messages."""
        # Simplified extraction - in production, use NLP
        decisions = []
        for msg in messages:
            if any(word in msg.content.lower() for word in ["decided", "agreed", "confirmed"]):
                decisions.append(msg.content[:100])
        return decisions[:3]  # Return top 3
    
    def _extract_questions(self, messages: List[database.Message]) -> List[str]:
        """Extract open questions from messages."""
        questions = []
        for msg in messages:
            if "?" in msg.content:
                questions.append(msg.content[:100])
        return questions[:3]
    
    def _extract_deadlines(self, messages: List[database.Message]) -> List[str]:
        """Extract deadlines from messages."""
        deadlines = []
        for msg in messages:
            if any(word in msg.content.lower() for word in ["deadline", "due", "by"]):
                deadlines.append(msg.content[:100])
        return deadlines[:3]
    
    def _generate_template_reply(self, template_id: str, conversation) -> str:
        """Generate reply based on template."""
        templates = {
            "polite-decline": f"Thanks for thinking of me! Unfortunately I can't commit to this right now, but I'd love to stay in touch for future opportunities regarding {conversation.title}.",
            "request-more-info": f"This sounds interesting! Could you share more details about the timeline and what would be expected from my end for {conversation.title}?",
            "schedule-follow-up": f"I'd love to discuss {conversation.title} further. Are you available for a quick call this week? I have some time on Thursday or Friday afternoon.",
            "express-interest": f"This aligns perfectly with what I'm working on! I'm definitely interested in {conversation.title}. What are the next steps to move forward?"
        }
        return templates.get(template_id, "Thanks for your message!")
    
    def _generate_custom_reply(self, prompt: str, conversation) -> str:
        """Generate reply based on custom prompt."""
        return f"Based on your request to '{prompt}' regarding {conversation.title}:\n\nHi there! Thanks for your message. I've reviewed the details and here's my response based on our conversation about {conversation.title}. Let me know if you need any clarification or have additional questions."


# Standalone functions for easy import
def create_inbox_agent(db: Session) -> InboxAgent:
    """Factory function to create an inbox agent."""
    return InboxAgent(db)

