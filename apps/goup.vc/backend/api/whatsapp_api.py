from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

# Mock WhatsApp communities for demo
MOCK_COMMUNITIES = [
    {
        "id": "community_1",
        "name": "SF Tech Builders",
        "description": "A community of tech builders in San Francisco",
        "invite_link": "https://chat.whatsapp.com/mock1",
        "member_count": 156,
        "admin_phone": "+1234567890",
        "created_at": "2024-01-15T10:00:00Z",
        "is_active": True
    },
    {
        "id": "community_2", 
        "name": "AI Enthusiasts",
        "description": "Discussing the latest in AI and machine learning",
        "invite_link": "https://chat.whatsapp.com/mock2",
        "member_count": 89,
        "admin_phone": "+1234567891",
        "created_at": "2024-02-20T14:30:00Z",
        "is_active": True
    },
    {
        "id": "community_3",
        "name": "Startup Founders",
        "description": "Network of startup founders sharing experiences",
        "invite_link": "https://chat.whatsapp.com/mock3", 
        "member_count": 234,
        "admin_phone": "+1234567892",
        "created_at": "2024-03-10T09:15:00Z",
        "is_active": True
    }
]

@router.get("/communities")
def get_whatsapp_communities():
    """Get all WhatsApp communities"""
    return {"communities": MOCK_COMMUNITIES}

@router.get("/communities/{community_id}/members")
def get_community_members(community_id: str):
    """Get members of a specific community"""
    # Mock members data
    mock_members = [
        {
            "phone": "+1234567890",
            "name": "John Doe",
            "profile_pic": "/avatars/john.jpg",
            "joined_at": "2024-01-15T10:00:00Z",
            "is_admin": True,
            "last_seen": "2024-12-23T18:00:00Z"
        },
        {
            "phone": "+1234567891",
            "name": "Jane Smith", 
            "profile_pic": "/avatars/jane.jpg",
            "joined_at": "2024-01-16T11:30:00Z",
            "is_admin": False,
            "last_seen": "2024-12-23T17:45:00Z"
        }
    ]
    return {"members": mock_members}

@router.get("/communities/{community_id}/messages")
def get_community_messages(community_id: str, limit: int = 50):
    """Get messages from a specific community"""
    # Mock messages data
    mock_messages = [
        {
            "id": "msg_1",
            "from": "+1234567890",
            "timestamp": "2024-12-23T17:30:00Z",
            "type": "text",
            "content": "Hey everyone! Excited about the upcoming hackathon!",
            "community_id": community_id
        },
        {
            "id": "msg_2", 
            "from": "+1234567891",
            "timestamp": "2024-12-23T17:35:00Z",
            "type": "text",
            "content": "Same here! Looking forward to building something amazing together.",
            "community_id": community_id
        }
    ]
    return {"messages": mock_messages}

@router.post("/send-message")
def send_community_message(message_data: Dict[str, Any]):
    """Send a message to a WhatsApp community"""
    community_id = message_data.get("communityId")
    message = message_data.get("message")
    
    if not community_id or not message:
        raise HTTPException(status_code=400, detail="Missing communityId or message")
    
    # Mock successful send
    return {
        "success": True,
        "message_id": f"msg_{datetime.now().timestamp()}",
        "sent_at": datetime.now().isoformat()
    }

@router.post("/sync-hackathon")
def sync_hackathon_to_community(sync_data: Dict[str, Any]):
    """Sync hackathon information to a WhatsApp community"""
    hackathon_id = sync_data.get("hackathonId")
    community_id = sync_data.get("communityId")
    
    if not hackathon_id or not community_id:
        raise HTTPException(status_code=400, detail="Missing hackathonId or communityId")
    
    # Mock successful sync
    return {
        "success": True,
        "synced_at": datetime.now().isoformat(),
        "community_id": community_id,
        "hackathon_id": hackathon_id
    }

@router.get("/communities/{community_id}/lmp-analysis")
def get_community_lmp_analysis(community_id: str):
    """Get LMP analysis for a community"""
    # Mock LMP analysis data
    return {
        "community_id": community_id,
        "analysis": {
            "member_values": {
                "+1234567890": {"integrity": 8, "doer": 9, "giver": 7, "passion": 8, "resilience": 6},
                "+1234567891": {"integrity": 7, "doer": 8, "giver": 9, "passion": 9, "resilience": 7}
            },
            "collaboration_opportunities": [
                {
                    "id": "collab_1",
                    "author": "+1234567890",
                    "content": "Looking to collaborate on an AI project for healthcare",
                    "timestamp": "2024-12-23T16:00:00Z",
                    "type": "collaboration_opportunity"
                }
            ],
            "help_requests": [
                {
                    "id": "help_1",
                    "author": "+1234567891", 
                    "content": "Need help with React deployment, anyone available?",
                    "timestamp": "2024-12-23T15:30:00Z",
                    "type": "help_request"
                }
            ],
            "educational_content": [],
            "promotions": []
        },
        "generated_at": datetime.now().isoformat()
    }