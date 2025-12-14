from fastapi import APIRouter
from app.api.v1.endpoints import auth, community, learning, content, ai, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(community.router, prefix="/forum", tags=["community"])
api_router.include_router(learning.router, prefix="/learning", tags=["learning"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
