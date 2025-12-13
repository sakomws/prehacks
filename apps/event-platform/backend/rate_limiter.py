"""
Rate limiting and throttling service using Redis
"""

import redis
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, Request, status
from functools import wraps
import logging
from decouple import config

logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
RATE_LIMIT_PREFIX = config('RATE_LIMIT_PREFIX', default='rate_limit')

class RateLimiter:
    """Redis-based rate limiter with sliding window algorithm"""
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            self.available = True
            logger.info("Rate limiter initialized successfully")
        except Exception as e:
            logger.warning(f"Redis not available for rate limiting: {e}")
            self.redis_client = None
            self.available = False
    
    def _make_key(self, identifier: str, endpoint: str) -> str:
        """Create rate limit key"""
        return f"{RATE_LIMIT_PREFIX}:{endpoint}:{identifier}"
    
    def is_allowed(
        self, 
        identifier: str, 
        endpoint: str, 
        limit: int, 
        window: int
    ) -> tuple[bool, Dict[str, Any]]:
        """
        Check if request is allowed using sliding window algorithm
        
        Args:
            identifier: Unique identifier (IP, user ID, etc.)
            endpoint: API endpoint or action name
            limit: Maximum requests allowed
            window: Time window in seconds
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        if not self.available:
            # If Redis is not available, allow all requests
            return True, {
                'limit': limit,
                'remaining': limit,
                'reset_time': int(time.time()) + window,
                'retry_after': None
            }
        
        try:
            key = self._make_key(identifier, endpoint)
            current_time = time.time()
            window_start = current_time - window
            
            # Use Redis pipeline for atomic operations
            pipe = self.redis_client.pipeline()
            
            # Remove expired entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests in window
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiration
            pipe.expire(key, window + 1)
            
            results = pipe.execute()
            current_count = results[1] + 1  # +1 for the request we just added
            
            is_allowed = current_count <= limit
            remaining = max(0, limit - current_count)
            reset_time = int(current_time + window)
            
            rate_limit_info = {
                'limit': limit,
                'remaining': remaining,
                'reset_time': reset_time,
                'retry_after': None if is_allowed else window
            }
            
            if not is_allowed:
                # Remove the request we just added since it's not allowed
                self.redis_client.zrem(key, str(current_time))
            
            return is_allowed, rate_limit_info
            
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # On error, allow the request
            return True, {
                'limit': limit,
                'remaining': limit,
                'reset_time': int(time.time()) + window,
                'retry_after': None
            }
    
    def reset_limit(self, identifier: str, endpoint: str) -> bool:
        """Reset rate limit for identifier and endpoint"""
        if not self.available:
            return False
        
        try:
            key = self._make_key(identifier, endpoint)
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Rate limiter reset error: {e}")
            return False
    
    def get_current_usage(self, identifier: str, endpoint: str, window: int) -> int:
        """Get current usage count for identifier and endpoint"""
        if not self.available:
            return 0
        
        try:
            key = self._make_key(identifier, endpoint)
            current_time = time.time()
            window_start = current_time - window
            
            # Clean up expired entries and count current ones
            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            results = pipe.execute()
            
            return results[1]
        except Exception as e:
            logger.error(f"Rate limiter usage check error: {e}")
            return 0


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limit configurations
class RateLimitConfig:
    """Rate limit configurations for different endpoints"""
    
    # General API limits (per minute)
    GENERAL_API = {'limit': 100, 'window': 60}
    
    # Authentication limits (per minute)
    LOGIN = {'limit': 5, 'window': 60}
    REGISTER = {'limit': 3, 'window': 60}
    PASSWORD_RESET = {'limit': 3, 'window': 300}  # 5 minutes
    
    # Upload limits (per minute)
    FILE_UPLOAD = {'limit': 10, 'window': 60}
    
    # Search and discovery (per minute)
    SEARCH = {'limit': 30, 'window': 60}
    DISCOVERY = {'limit': 50, 'window': 60}
    
    # Event operations (per minute)
    EVENT_CREATE = {'limit': 5, 'window': 60}
    EVENT_UPDATE = {'limit': 10, 'window': 60}
    
    # Registration operations (per minute)
    EVENT_REGISTER = {'limit': 20, 'window': 60}
    
    # Notification operations (per minute)
    SEND_NOTIFICATION = {'limit': 10, 'window': 60}
    
    # Calendar operations (per minute)
    CALENDAR_CREATE = {'limit': 3, 'window': 60}
    CALENDAR_UPDATE = {'limit': 10, 'window': 60}
    
    # Subscription operations (per minute)
    SUBSCRIBE = {'limit': 20, 'window': 60}


def get_client_identifier(request: Request) -> str:
    """Get client identifier for rate limiting (IP or user ID)"""
    # Try to get user ID from request state (set by auth middleware)
    if hasattr(request.state, 'user') and request.state.user:
        return f"user:{request.state.user.id}"
    
    # Fall back to IP address
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        # Get the first IP in case of multiple proxies
        client_ip = forwarded_for.split(',')[0].strip()
    else:
        client_ip = request.client.host if request.client else 'unknown'
    
    return f"ip:{client_ip}"


def rate_limit(
    limit: int = None,
    window: int = None,
    config: Dict[str, int] = None,
    endpoint_name: str = None
):
    """
    Rate limiting decorator
    
    Args:
        limit: Maximum requests allowed
        window: Time window in seconds
        config: Rate limit config dict with 'limit' and 'window' keys
        endpoint_name: Custom endpoint name for rate limiting
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from args (FastAPI dependency injection)
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                # If no request found, skip rate limiting
                return await func(*args, **kwargs) if hasattr(func, '__call__') else func(*args, **kwargs)
            
            # Determine rate limit parameters
            if config:
                rate_limit_limit = config['limit']
                rate_limit_window = config['window']
            else:
                rate_limit_limit = limit or RateLimitConfig.GENERAL_API['limit']
                rate_limit_window = window or RateLimitConfig.GENERAL_API['window']
            
            # Determine endpoint name
            endpoint = endpoint_name or func.__name__
            
            # Get client identifier
            identifier = get_client_identifier(request)
            
            # Check rate limit
            is_allowed, rate_info = rate_limiter.is_allowed(
                identifier, endpoint, rate_limit_limit, rate_limit_window
            )
            
            if not is_allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit": rate_info['limit'],
                        "window": rate_limit_window,
                        "retry_after": rate_info['retry_after']
                    },
                    headers={
                        "X-RateLimit-Limit": str(rate_info['limit']),
                        "X-RateLimit-Remaining": str(rate_info['remaining']),
                        "X-RateLimit-Reset": str(rate_info['reset_time']),
                        "Retry-After": str(rate_info['retry_after'])
                    }
                )
            
            # Add rate limit headers to response
            response = await func(*args, **kwargs) if hasattr(func, '__call__') else func(*args, **kwargs)
            
            # If response has headers attribute, add rate limit info
            if hasattr(response, 'headers'):
                response.headers["X-RateLimit-Limit"] = str(rate_info['limit'])
                response.headers["X-RateLimit-Remaining"] = str(rate_info['remaining'])
                response.headers["X-RateLimit-Reset"] = str(rate_info['reset_time'])
            
            return response
        
        return wrapper
    return decorator


# Middleware for adding rate limit headers to all responses
class RateLimitMiddleware:
    """Middleware to add rate limit information to responses"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        # Create request object
        from fastapi import Request
        request = Request(scope, receive)
        
        # Get client identifier
        identifier = get_client_identifier(request)
        endpoint = f"{request.method}:{request.url.path}"
        
        # Check current usage for general API limit
        config = RateLimitConfig.GENERAL_API
        current_usage = rate_limiter.get_current_usage(
            identifier, endpoint, config['window']
        )
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = dict(message.get("headers", []))
                
                # Add rate limit headers
                headers[b"x-ratelimit-limit"] = str(config['limit']).encode()
                headers[b"x-ratelimit-remaining"] = str(max(0, config['limit'] - current_usage)).encode()
                headers[b"x-ratelimit-reset"] = str(int(time.time()) + config['window']).encode()
                
                message["headers"] = list(headers.items())
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)


# Utility functions for specific rate limiting scenarios
def check_auth_rate_limit(request: Request, action: str):
    """Check rate limit for authentication actions"""
    identifier = get_client_identifier(request)
    
    if action == "login":
        config = RateLimitConfig.LOGIN
    elif action == "register":
        config = RateLimitConfig.REGISTER
    elif action == "password_reset":
        config = RateLimitConfig.PASSWORD_RESET
    else:
        config = RateLimitConfig.GENERAL_API
    
    is_allowed, rate_info = rate_limiter.is_allowed(
        identifier, f"auth:{action}", config['limit'], config['window']
    )
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": f"Too many {action} attempts",
                "retry_after": rate_info['retry_after']
            },
            headers={
                "Retry-After": str(rate_info['retry_after'])
            }
        )


def check_upload_rate_limit(request: Request):
    """Check rate limit for file uploads"""
    identifier = get_client_identifier(request)
    config = RateLimitConfig.FILE_UPLOAD
    
    is_allowed, rate_info = rate_limiter.is_allowed(
        identifier, "upload", config['limit'], config['window']
    )
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Upload rate limit exceeded",
                "retry_after": rate_info['retry_after']
            },
            headers={
                "Retry-After": str(rate_info['retry_after'])
            }
        )