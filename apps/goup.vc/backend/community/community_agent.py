"""
Community Agent - Independent agent for managing communities, members, and community operations.
Handles community creation, member management, community events, and community analytics.
"""

import sys
import os

# Add parent directory to path to access shared modules
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(parent_dir, 'shared'))
sys.path.insert(0, parent_dir)

from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import database
import models


class CommunityAgent:
    """Independent agent for community management."""
    
    def __init__(self, db: Session):
        """Initialize the community agent with a database session."""
        self.db = db
    
    def get_communities(
        self,
        user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get list of communities, optionally filtered by user membership."""
        if user_id:
            # Get communities where user is a member
            query = self.db.query(database.Conversation).filter(
                database.Conversation.intent == "community"
            ).join(
                database.conversation_participants
            ).filter(
                database.conversation_participants.c.user_id == user_id
            )
        else:
            query = self.db.query(database.Conversation).filter(
                database.Conversation.intent == "community"
            )
        
        communities = query.order_by(desc(database.Conversation.updated_at)).offset(skip).limit(limit).all()
        
        result = []
        for community in communities:
            member_count = len(community.participants)
            message_count = len(community.messages)
            
            result.append({
                "id": community.id,
                "title": community.title,
                "description": community.ai_summary or "No description",
                "status": community.status,
                "member_count": member_count,
                "message_count": message_count,
                "created_at": community.created_at.isoformat() if community.created_at else None,
                "updated_at": community.updated_at.isoformat() if community.updated_at else None,
                "is_member": user_id in [p.id for p in community.participants] if user_id else False
            })
        
        return result
    
    def get_community(self, community_id: int, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific community."""
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id,
            database.Conversation.intent == "community"
        ).first()
        
        if not community:
            return None
        
        # Get recent messages
        recent_messages = self.db.query(database.Message).filter(
            database.Message.conversation_id == community_id
        ).order_by(desc(database.Message.created_at)).limit(10).all()
        
        return {
            "id": community.id,
            "title": community.title,
            "description": community.ai_summary or "No description",
            "status": community.status,
            "member_count": len(community.participants),
            "members": [{
                "id": member.id,
                "name": member.full_name,
                "avatar": member.avatar_url,
                "is_organizer": self._is_organizer(community_id, member.id)
            } for member in community.participants],
            "recent_messages": [{
                "id": msg.id,
                "sender_id": msg.sender_id,
                "sender_name": msg.sender.full_name if msg.sender else "Unknown",
                "content": msg.content[:200],  # Truncate for preview
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            } for msg in recent_messages],
            "is_member": user_id in [p.id for p in community.participants] if user_id else False,
            "created_at": community.created_at.isoformat() if community.created_at else None,
            "updated_at": community.updated_at.isoformat() if community.updated_at else None
        }
    
    def create_community(
        self,
        title: str,
        organizer_id: int,
        description: Optional[str] = None,
        initial_members: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """Create a new community."""
        try:
            # Validate organizer exists
            organizer = self.db.query(database.User).filter(
                database.User.id == organizer_id
            ).first()
            
            if not organizer:
                return {"error": "Organizer not found"}
            
            # Create community conversation
            community = database.Conversation(
                title=title,
                intent="community",
                status="active",
                needs_action=False,
                ai_summary=description or f"Community: {title}",
                priority=0
            )
            
            self.db.add(community)
            self.db.flush()
            
            # Add organizer as first member
            community.participants.append(organizer)
            
            # Add initial members if provided
            if initial_members:
                for member_id in initial_members:
                    if member_id != organizer_id:
                        member = self.db.query(database.User).filter(
                            database.User.id == member_id
                        ).first()
                        if member:
                            community.participants.append(member)
            
            self.db.commit()
            self.db.refresh(community)
            
            return {
                "id": community.id,
                "title": community.title,
                "member_count": len(community.participants),
                "message": "Community created successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def add_member(self, community_id: int, user_id: int, inviter_id: int) -> Dict[str, Any]:
        """Add a member to a community."""
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id,
            database.Conversation.intent == "community"
        ).first()
        
        if not community:
            return {"error": "Community not found"}
        
        # Check if inviter is a member
        if inviter_id not in [p.id for p in community.participants]:
            return {"error": "Only members can invite others"}
        
        # Check if user is already a member
        if user_id in [p.id for p in community.participants]:
            return {"error": "User is already a member"}
        
        try:
            user = self.db.query(database.User).filter(
                database.User.id == user_id
            ).first()
            
            if not user:
                return {"error": "User not found"}
            
            community.participants.append(user)
            self.db.commit()
            
            return {
                "message": "Member added successfully",
                "member_count": len(community.participants)
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def remove_member(self, community_id: int, user_id: int, remover_id: int) -> Dict[str, Any]:
        """Remove a member from a community."""
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id,
            database.Conversation.intent == "community"
        ).first()
        
        if not community:
            return {"error": "Community not found"}
        
        # Check if remover is organizer or the user themselves
        is_organizer = self._is_organizer(community_id, remover_id)
        if not is_organizer and remover_id != user_id:
            return {"error": "Only organizers can remove other members"}
        
        try:
            user = self.db.query(database.User).filter(
                database.User.id == user_id
            ).first()
            
            if user and user in community.participants:
                community.participants.remove(user)
                self.db.commit()
                
                return {
                    "message": "Member removed successfully",
                    "member_count": len(community.participants)
                }
            else:
                return {"error": "User is not a member"}
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def get_community_members(self, community_id: int) -> List[Dict[str, Any]]:
        """Get all members of a community."""
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id,
            database.Conversation.intent == "community"
        ).first()
        
        if not community:
            return []
        
        return [{
            "id": member.id,
            "name": member.full_name,
            "username": member.username,
            "email": member.email,
            "avatar": member.avatar_url,
            "is_organizer": self._is_organizer(community_id, member.id),
            "joined_at": community.created_at.isoformat() if community.created_at else None
        } for member in community.participants]
    
    def get_community_events(self, community_id: int) -> List[Dict[str, Any]]:
        """Get events associated with a community."""
        # Get events where the conversation is related to this community
        # This is a simplified version - in production, you'd have a proper relationship
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id,
            database.Conversation.intent == "community"
        ).first()
        
        if not community:
            return []
        
        # Get events that might be related (this is simplified)
        # In a real implementation, you'd have a proper relationship table
        events = self.db.query(database.Event).filter(
            database.Event.title.ilike(f"%{community.title}%")
        ).limit(10).all()
        
        return [{
            "id": event.id,
            "title": event.title,
            "start_time": event.start_time.isoformat() if event.start_time else None,
            "location": event.location,
            "attendee_count": len([rsvp for rsvp in event.rsvps if rsvp.status == 'attending'])
        } for event in events]
    
    def get_community_analytics(self, community_id: int) -> Dict[str, Any]:
        """Get analytics for a community."""
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id,
            database.Conversation.intent == "community"
        ).first()
        
        if not community:
            return {"error": "Community not found"}
        
        # Get message statistics
        total_messages = len(community.messages)
        recent_messages = len([
            msg for msg in community.messages
            if msg.created_at and msg.created_at > datetime.utcnow() - timedelta(days=7)
        ])
        
        # Get member statistics
        member_count = len(community.participants)
        active_members = len(set([
            msg.sender_id for msg in community.messages
            if msg.created_at and msg.created_at > datetime.utcnow() - timedelta(days=30)
        ]))
        
        return {
            "community_id": community_id,
            "member_count": member_count,
            "active_members": active_members,
            "total_messages": total_messages,
            "recent_messages": recent_messages,
            "growth_rate": self._calculate_growth_rate(community_id),
            "engagement_score": self._calculate_engagement_score(community_id)
        }
    
    def _is_organizer(self, community_id: int, user_id: int) -> bool:
        """Check if a user is the organizer of a community."""
        # Simplified: first member is organizer
        # In production, you'd have a proper organizer field
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id
        ).first()
        
        if not community or not community.participants:
            return False
        
        return community.participants[0].id == user_id if community.participants else False
    
    def _calculate_growth_rate(self, community_id: int) -> float:
        """Calculate community growth rate."""
        # Simplified calculation
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id
        ).first()
        
        if not community or not community.created_at:
            return 0.0
        
        days_since_creation = (datetime.utcnow() - community.created_at).days
        if days_since_creation == 0:
            return 0.0
        
        member_count = len(community.participants)
        return round(member_count / days_since_creation, 2)
    
    def _calculate_engagement_score(self, community_id: int) -> float:
        """Calculate community engagement score."""
        community = self.db.query(database.Conversation).filter(
            database.Conversation.id == community_id
        ).first()
        
        if not community:
            return 0.0
        
        member_count = len(community.participants)
        message_count = len(community.messages)
        
        if member_count == 0:
            return 0.0
        
        # Simple engagement score: messages per member
        return round(message_count / member_count, 2)


# Standalone functions for easy import
def create_community_agent(db: Session) -> CommunityAgent:
    """Factory function to create a community agent."""
    return CommunityAgent(db)


# Standalone execution
if __name__ == "__main__":
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    
    app = FastAPI(title="Community Agent API", version="1.0.0")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'shared'))
    from database import SessionLocal, create_tables
    
    # Initialize database
    create_tables()
    
    @app.get("/")
    async def root():
        return {"agent": "community", "status": "running"}
    
    @app.get("/communities")
    async def get_communities(user_id: int = None, skip: int = 0, limit: int = 100):
        db = SessionLocal()
        try:
            agent = create_community_agent(db)
            return agent.get_communities(user_id, skip, limit)
        finally:
            db.close()
    
    @app.get("/communities/{community_id}")
    async def get_community(community_id: int):
        db = SessionLocal()
        try:
            agent = create_community_agent(db)
            return agent.get_community(community_id)
        finally:
            db.close()
    
    @app.get("/communities/{community_id}/analytics")
    async def get_analytics(community_id: int):
        db = SessionLocal()
        try:
            agent = create_community_agent(db)
            return agent.get_community_analytics(community_id)
        finally:
            db.close()
    
    uvicorn.run(app, host="0.0.0.0", port=8004)

