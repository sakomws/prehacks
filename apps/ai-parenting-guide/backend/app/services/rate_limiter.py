"""
Rate limiting service for API endpoints, especially AI-powered features.
Implements Redis-based rate limiting with different tiers for different user roles.
"""

import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import structlog

from app.core.database import get_redis
from app.core.config import settings

logger = structlog.get_logger("rate_limiter")


class RateLimiter:
    """
    Redis-based rate limiter with role-based limits.
    
    Implements sliding window rate limiting for different API endpoints
    with different limits based on user roles and endpoint types.
    """
    
    def __init__(self):
        """Initialize rate limiter with Redis connection."""
        self.redis = get_redis()
        
        # Rate limits by user role (requests per minute)
        self.role_limits = {
            "learner": 30,
            "educator": 60,
            "expert": 100,
            "moderator": 150,
            "admin": 200
        }
        
        # Special limits for AI endpoints (requests per minute)
        self.ai_limits = {
            "learner": 10,
            "educator": 20,
            "expert": 30,
            "moderator": 50,
            "admin": 100
        }
        
        # Burst limits (requests per 10 seconds)
        self.burst_limits = {
            "learner": 5,
            "educator": 10,
            "expert": 15,
            "moderator": 20,
            "admin": 30
        }
    
    async def check_rate_limit(
        self,
        user_id: str,
        user_role: str,
        endpoint_type: str = "general",
        window_seconds: int = 60
    ) -> Dict[str, Any]:
        """
        Check if user has exceeded rate limit.
        
        Args:
            user_id: User identifier
            user_role: User's role (learner, educator, etc.)
            endpoint_type: Type of endpoint (general, ai, upload, etc.)
            window_seconds: Time window in seconds
            
        Returns:
            Dictionary with rate limit status and metadata
        """
        try:
            # Determine rate limit based on role and endpoint type
            if endpoint_type == "ai":
                limit = self.ai_limits.get(user_role, self.ai_limits["learner"])
            elif window_seconds == 10:  # Burst limit
                limit = self.burst_limits.get(user_role, self.burst_limits["learner"])
            else:
                limit = self.role_limits.get(user_role, self.role_limits["learner"])
            
            # Create Redis key
            current_window = int(time.time()) // window_seconds
            key = f"rate_limit:{user_id}:{endpoint_type}:{window_seconds}:{current_window}"
            
            # Get current count
            current_count = self.redis.get(key)
            current_count = int(current_count) if current_count else 0
            
            # Check if limit exceeded
            if current_count >= limit:
                logger.warning("Rate limit exceeded", 
                              user_id=user_id, 
                              user_role=user_role,
                              endpoint_type=endpoint_type,
                              current_count=current_count,
                              limit=limit)
                
                return {
                    "allowed": False,
                    "limit": limit,
                    "current": current_count,
                    "reset_time": (current_window + 1) * window_seconds,
                    "retry_after": window_seconds - (int(time.time()) % window_seconds)
                }
            
            # Increment counter
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, window_seconds)
            pipe.execute()
            
            new_count = current_count + 1
            
            logger.debug("Rate limit check passed", 
                        user_id=user_id,
                        endpoint_type=endpoint_type,
                        count=new_count,
                        limit=limit)
            
            return {
                "allowed": True,
                "limit": limit,
                "current": new_count,
                "remaining": limit - new_count,
                "reset_time": (current_window + 1) * window_seconds
            }
            
        except Exception as e:
            logger.error("Rate limit check failed", error=str(e), user_id=user_id)
            # Allow request if rate limiting fails
            return {
                "allowed": True,
                "limit": 0,
                "current": 0,
                "error": str(e)
            }
    
    async def check_ai_rate_limit(self, user_id: str, user_role: str) -> Dict[str, Any]:
        """
        Check rate limit specifically for AI endpoints.
        
        Args:
            user_id: User identifier
            user_role: User's role
            
        Returns:
            Rate limit status for AI endpoints
        """
        # Check both per-minute and burst limits
        minute_check = await self.check_rate_limit(user_id, user_role, "ai", 60)
        burst_check = await self.check_rate_limit(user_id, user_role, "ai", 10)
        
        # Return the more restrictive limit
        if not minute_check["allowed"]:
            return minute_check
        elif not burst_check["allowed"]:
            return burst_check
        else:
            return minute_check
    
    async def get_user_rate_limit_status(
        self,
        user_id: str,
        user_role: str
    ) -> Dict[str, Any]:
        """
        Get comprehensive rate limit status for a user.
        
        Args:
            user_id: User identifier
            user_role: User's role
            
        Returns:
            Complete rate limit status across all endpoint types
        """
        try:
            current_time = int(time.time())
            
            status = {
                "user_id": user_id,
                "user_role": user_role,
                "timestamp": current_time,
                "limits": {}
            }
            
            # Check different endpoint types
            endpoint_types = ["general", "ai", "upload"]
            
            for endpoint_type in endpoint_types:
                # Get current window counts
                minute_window = current_time // 60
                burst_window = current_time // 10
                
                minute_key = f"rate_limit:{user_id}:{endpoint_type}:60:{minute_window}"
                burst_key = f"rate_limit:{user_id}:{endpoint_type}:10:{burst_window}"
                
                minute_count = int(self.redis.get(minute_key) or 0)
                burst_count = int(self.redis.get(burst_key) or 0)
                
                # Get limits for this role and endpoint type
                if endpoint_type == "ai":
                    minute_limit = self.ai_limits.get(user_role, self.ai_limits["learner"])
                else:
                    minute_limit = self.role_limits.get(user_role, self.role_limits["learner"])
                
                burst_limit = self.burst_limits.get(user_role, self.burst_limits["learner"])
                
                status["limits"][endpoint_type] = {
                    "per_minute": {
                        "limit": minute_limit,
                        "used": minute_count,
                        "remaining": max(0, minute_limit - minute_count),
                        "reset_time": (minute_window + 1) * 60
                    },
                    "per_10_seconds": {
                        "limit": burst_limit,
                        "used": burst_count,
                        "remaining": max(0, burst_limit - burst_count),
                        "reset_time": (burst_window + 1) * 10
                    }
                }
            
            return status
            
        except Exception as e:
            logger.error("Failed to get rate limit status", error=str(e), user_id=user_id)
            return {
                "user_id": user_id,
                "error": str(e),
                "timestamp": int(time.time())
            }
    
    async def reset_user_rate_limits(self, user_id: str) -> bool:
        """
        Reset all rate limits for a user (admin function).
        
        Args:
            user_id: User identifier
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Find all rate limit keys for this user
            pattern = f"rate_limit:{user_id}:*"
            keys = self.redis.keys(pattern)
            
            if keys:
                self.redis.delete(*keys)
                logger.info("Rate limits reset for user", user_id=user_id, keys_deleted=len(keys))
            
            return True
            
        except Exception as e:
            logger.error("Failed to reset rate limits", error=str(e), user_id=user_id)
            return False
    
    async def get_global_rate_limit_stats(self) -> Dict[str, Any]:
        """
        Get global rate limiting statistics (admin function).
        
        Returns:
            Global rate limiting statistics
        """
        try:
            current_time = int(time.time())
            
            # Get all rate limit keys
            pattern = "rate_limit:*"
            keys = self.redis.keys(pattern)
            
            stats = {
                "timestamp": current_time,
                "total_active_limits": len(keys),
                "by_endpoint_type": {},
                "by_time_window": {},
                "top_users": []
            }
            
            # Analyze keys to get statistics
            endpoint_counts = {}
            window_counts = {}
            user_counts = {}
            
            for key in keys:
                parts = key.split(":")
                if len(parts) >= 4:
                    user_id = parts[1]
                    endpoint_type = parts[2]
                    window = parts[3]
                    
                    # Count by endpoint type
                    endpoint_counts[endpoint_type] = endpoint_counts.get(endpoint_type, 0) + 1
                    
                    # Count by window
                    window_counts[window] = window_counts.get(window, 0) + 1
                    
                    # Count by user
                    count = int(self.redis.get(key) or 0)
                    user_counts[user_id] = user_counts.get(user_id, 0) + count
            
            stats["by_endpoint_type"] = endpoint_counts
            stats["by_time_window"] = window_counts
            
            # Get top users by request count
            top_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            stats["top_users"] = [{"user_id": uid, "requests": count} for uid, count in top_users]
            
            return stats
            
        except Exception as e:
            logger.error("Failed to get global rate limit stats", error=str(e))
            return {
                "error": str(e),
                "timestamp": int(time.time())
            }