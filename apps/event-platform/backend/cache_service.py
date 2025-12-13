"""
Redis caching service for performance optimization
"""

import redis
import json
import pickle
from typing import Any, Optional, Union, List, Dict
from datetime import datetime, timedelta
from functools import wraps
import hashlib
import logging
from decouple import config

logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CACHE_PREFIX = config('CACHE_PREFIX', default='event_platform')

class CacheService:
    """Redis-based caching service with automatic serialization and TTL management"""
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(REDIS_URL, decode_responses=False)
            # Test connection
            self.redis_client.ping()
            self.available = True
            logger.info("Redis cache service initialized successfully")
        except Exception as e:
            logger.warning(f"Redis not available: {e}. Caching disabled.")
            self.redis_client = None
            self.available = False
    
    def _make_key(self, key: str) -> str:
        """Create a prefixed cache key"""
        return f"{CACHE_PREFIX}:{key}"
    
    def _serialize(self, value: Any) -> bytes:
        """Serialize value for Redis storage"""
        if isinstance(value, (str, int, float, bool)):
            return json.dumps(value).encode('utf-8')
        else:
            return pickle.dumps(value)
    
    def _deserialize(self, value: bytes) -> Any:
        """Deserialize value from Redis storage"""
        try:
            # Try JSON first (for simple types)
            return json.loads(value.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            # Fall back to pickle for complex objects
            return pickle.loads(value)
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.available:
            return None
        
        try:
            cached_value = self.redis_client.get(self._make_key(key))
            if cached_value is None:
                return None
            return self._deserialize(cached_value)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (default 1 hour)"""
        if not self.available:
            return False
        
        try:
            serialized_value = self._serialize(value)
            return self.redis_client.setex(
                self._make_key(key), 
                ttl, 
                serialized_value
            )
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if not self.available:
            return False
        
        try:
            return bool(self.redis_client.delete(self._make_key(key)))
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.available:
            return 0
        
        try:
            keys = self.redis_client.keys(self._make_key(pattern))
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for pattern {pattern}: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.available:
            return False
        
        try:
            return bool(self.redis_client.exists(self._make_key(key)))
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False
    
    def increment(self, key: str, amount: int = 1, ttl: Optional[int] = None) -> Optional[int]:
        """Increment a counter in cache"""
        if not self.available:
            return None
        
        try:
            cache_key = self._make_key(key)
            value = self.redis_client.incr(cache_key, amount)
            if ttl and value == amount:  # First time setting
                self.redis_client.expire(cache_key, ttl)
            return value
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {e}")
            return None
    
    def get_multiple(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache"""
        if not self.available or not keys:
            return {}
        
        try:
            cache_keys = [self._make_key(key) for key in keys]
            values = self.redis_client.mget(cache_keys)
            
            result = {}
            for i, value in enumerate(values):
                if value is not None:
                    result[keys[i]] = self._deserialize(value)
            
            return result
        except Exception as e:
            logger.error(f"Cache get_multiple error: {e}")
            return {}
    
    def set_multiple(self, data: Dict[str, Any], ttl: int = 3600) -> bool:
        """Set multiple values in cache"""
        if not self.available or not data:
            return False
        
        try:
            pipe = self.redis_client.pipeline()
            for key, value in data.items():
                cache_key = self._make_key(key)
                serialized_value = self._serialize(value)
                pipe.setex(cache_key, ttl, serialized_value)
            
            pipe.execute()
            return True
        except Exception as e:
            logger.error(f"Cache set_multiple error: {e}")
            return False
    
    def flush_all(self) -> bool:
        """Flush all cache entries with our prefix"""
        if not self.available:
            return False
        
        try:
            keys = self.redis_client.keys(f"{CACHE_PREFIX}:*")
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache flush_all error: {e}")
            return False


# Global cache instance
cache = CacheService()


def cached(ttl: int = 3600, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds (default 1 hour)
        key_prefix: Optional prefix for cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [key_prefix, func.__name__] if key_prefix else [func.__name__]
            
            # Add arguments to key
            if args:
                key_parts.extend([str(arg) for arg in args])
            if kwargs:
                key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache first
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


def cache_key_for_user(user_id: str, resource: str, *args) -> str:
    """Generate cache key for user-specific resources"""
    parts = ["user", str(user_id), resource]
    if args:
        parts.extend([str(arg) for arg in args])
    return ":".join(parts)


def cache_key_for_calendar(calendar_id: str, resource: str, *args) -> str:
    """Generate cache key for calendar-specific resources"""
    parts = ["calendar", str(calendar_id), resource]
    if args:
        parts.extend([str(arg) for arg in args])
    return ":".join(parts)


def cache_key_for_event(event_id: str, resource: str, *args) -> str:
    """Generate cache key for event-specific resources"""
    parts = ["event", str(event_id), resource]
    if args:
        parts.extend([str(arg) for arg in args])
    return ":".join(parts)


def invalidate_user_cache(user_id: str):
    """Invalidate all cache entries for a user"""
    pattern = f"user:{user_id}:*"
    cache.delete_pattern(pattern)


def invalidate_calendar_cache(calendar_id: str):
    """Invalidate all cache entries for a calendar"""
    pattern = f"calendar:{calendar_id}:*"
    cache.delete_pattern(pattern)


def invalidate_event_cache(event_id: str):
    """Invalidate all cache entries for an event"""
    pattern = f"event:{event_id}:*"
    cache.delete_pattern(pattern)


# Cache TTL constants (in seconds)
class CacheTTL:
    """Cache TTL constants for different types of data"""
    VERY_SHORT = 60        # 1 minute - for frequently changing data
    SHORT = 300            # 5 minutes - for semi-dynamic data
    MEDIUM = 1800          # 30 minutes - for moderately stable data
    LONG = 3600            # 1 hour - for stable data
    VERY_LONG = 86400      # 24 hours - for rarely changing data
    
    # Specific use cases
    USER_PROFILE = LONG
    CALENDAR_INFO = MEDIUM
    EVENT_DETAILS = MEDIUM
    PUBLIC_CALENDARS = SHORT
    SEARCH_RESULTS = SHORT
    SUBSCRIPTION_COUNT = VERY_SHORT
    POPULAR_EVENTS = MEDIUM
    DISCOVERY_FEED = SHORT