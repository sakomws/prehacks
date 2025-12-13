# Performance Optimizations Implementation

This document describes the performance optimizations implemented for the Event Management Platform backend.

## Overview

The performance optimizations include:

1. **Redis Caching Strategies** - Intelligent caching with TTL management
2. **Database Query Optimization** - Optimized queries and bulk operations
3. **Image Optimization and CDN Integration** - Multi-size image processing
4. **API Rate Limiting and Throttling** - Sliding window rate limiting

## 1. Redis Caching Strategies

### Implementation: `cache_service.py`

**Features:**
- Automatic serialization/deserialization (JSON for simple types, pickle for complex objects)
- TTL (Time To Live) management with configurable expiration
- Bulk operations for multiple keys
- Cache invalidation patterns for related data
- Graceful degradation when Redis is unavailable

**Key Components:**
- `CacheService` class with Redis connection management
- `@cached` decorator for function result caching
- Cache key generators for users, calendars, and events
- TTL constants for different data types

**Usage Examples:**
```python
# Basic caching
cache.set("user:123:profile", user_data, ttl=3600)
user_data = cache.get("user:123:profile")

# Function caching with decorator
@cached(ttl=CacheTTL.MEDIUM, key_prefix="calendar_list")
def get_public_calendars(skip=0, limit=50):
    return query_calendars()

# Cache invalidation
invalidate_user_cache("123")  # Removes all user:123:* keys
```

**Cache TTL Strategy:**
- `VERY_SHORT` (60s) - Frequently changing data like subscription counts
- `SHORT` (5min) - Semi-dynamic data like search results
- `MEDIUM` (30min) - Moderately stable data like calendar info
- `LONG` (1hr) - Stable data like user profiles
- `VERY_LONG` (24hr) - Rarely changing data

## 2. Database Query Optimization

### Implementation: `query_optimizer.py`

**Features:**
- Optimized query patterns with eager loading
- Pagination with bounds checking
- Search query builders with proper indexing
- Bulk operations for better performance
- Query performance monitoring

**Key Components:**
- `QueryOptimizer` utility class with common query patterns
- `OptimizedQueries` class with cached, pre-optimized queries
- `BulkOperations` for efficient batch processing
- `@monitor_query_performance` decorator for slow query detection

**Optimizations Applied:**
- **Eager Loading**: Prevent N+1 queries using `joinedload` and `selectinload`
- **Pagination**: Bounded limits (max 1000 items) and non-negative offsets
- **Indexing**: Comprehensive index suggestions for common query patterns
- **Caching**: Frequently accessed queries cached with appropriate TTLs

**Usage Examples:**
```python
# Optimized calendar query with relationships
calendar = OptimizedQueries.get_calendar_with_details(db, calendar_id)

# Cached public calendars
calendars = OptimizedQueries.get_public_calendars_optimized(db, skip=0, limit=20)

# Bulk operations
BulkOperations.bulk_update_registration_status(db, registration_ids, "confirmed")
```

**Suggested Database Indexes:**
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Events
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_calendar_status ON events(calendar_id, status);

-- Registrations
CREATE INDEX idx_registrations_event_status ON event_registrations(event_id, status);
```

## 3. Image Optimization and CDN Integration

### Implementation: `image_optimizer.py`

**Features:**
- Multi-size image generation (thumbnail, small, medium, large)
- Format optimization (JPEG, PNG, WebP support)
- Automatic image compression with quality settings
- EXIF orientation handling
- CDN-ready URL generation
- Responsive image support

**Key Components:**
- `ImageOptimizer` class for processing and optimization
- Size presets for different use cases (avatars, covers)
- CDN integration utilities
- Responsive image HTML generation

**Image Processing Pipeline:**
1. **Validation**: File type and size checking
2. **Optimization**: Resizing, compression, format conversion
3. **Multi-size Generation**: Create multiple sizes for responsive design
4. **Storage**: Save optimized images with unique filenames
5. **URL Generation**: Create CDN-ready URLs

**Usage Examples:**
```python
# Process avatar with standard sizes
image_urls = process_avatar_image(upload_file, user_id)
# Returns: {'thumbnail': '...', 'small': '...', 'medium': '...', 'large': '...'}

# Process calendar cover
image_urls = process_calendar_cover(upload_file, calendar_id)

# Get optimized URL for specific size
optimized_url = get_optimized_image_url(original_url, 'medium')
```

**Image Sizes:**
- **Avatars**: 64px, 128px, 256px, 512px
- **Covers**: 300x200, 600x400, 1200x800, 1920x1280

## 4. API Rate Limiting and Throttling

### Implementation: `rate_limiter.py`

**Features:**
- Sliding window algorithm for accurate rate limiting
- Per-user and per-IP rate limiting
- Configurable limits for different endpoints
- Graceful handling when Redis is unavailable
- Rate limit headers in responses

**Key Components:**
- `RateLimiter` class with sliding window implementation
- `@rate_limit` decorator for endpoint protection
- `RateLimitMiddleware` for automatic header injection
- Endpoint-specific rate limit configurations

**Rate Limit Configurations:**
```python
# Authentication (per minute)
LOGIN = {'limit': 5, 'window': 60}
REGISTER = {'limit': 3, 'window': 60}
PASSWORD_RESET = {'limit': 3, 'window': 300}

# File operations (per minute)
FILE_UPLOAD = {'limit': 10, 'window': 60}

# API operations (per minute)
GENERAL_API = {'limit': 100, 'window': 60}
SEARCH = {'limit': 30, 'window': 60}
EVENT_CREATE = {'limit': 5, 'window': 60}
```

**Usage Examples:**
```python
# Apply rate limiting to endpoint
@app.post("/api/auth/login")
@rate_limit(config=RateLimitConfig.LOGIN)
def login_user(request: Request, ...):
    pass

# Custom rate limiting
@rate_limit(limit=10, window=60, endpoint_name="custom_action")
def custom_endpoint():
    pass
```

**Response Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds to wait when limit exceeded

## Integration with FastAPI

### Middleware Setup

```python
# Add performance middleware
app.add_middleware(RateLimitMiddleware)

# CORS middleware (after rate limiting)
app.add_middleware(CORSMiddleware, ...)
```

### Endpoint Integration

```python
# Authentication with rate limiting
@app.post("/api/auth/login")
@rate_limit(config=RateLimitConfig.LOGIN)
def login_user(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
    pass

# File upload with optimization
@app.post("/api/users/avatar")
@rate_limit(config=RateLimitConfig.FILE_UPLOAD)
def upload_avatar(file: UploadFile, request: Request, current_user, db: Session):
    image_urls = process_avatar_image(file, str(current_user.id))
    # Update user with optimized image URL
    pass

# Cached data retrieval
@app.get("/api/calendars")
@cached(ttl=CacheTTL.PUBLIC_CALENDARS, key_prefix="calendar_list")
def list_calendars(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return OptimizedQueries.get_public_calendars_optimized(db, skip, limit)
```

## Performance Monitoring

### Metrics Endpoint

```python
@app.get("/api/performance/metrics")
def get_performance_metrics(current_user):
    return {
        "cache": {"available": cache.available},
        "rate_limiter": {"available": rate_limiter.available},
        "image_optimizer": {"enabled": image_optimizer.enable_optimization}
    }
```

### Cache Management

```python
@app.post("/api/performance/cache/flush")
def flush_cache(current_user):
    success = cache.flush_all()
    return {"success": success}
```

## Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CACHE_PREFIX=event_platform

# Image Optimization
MAX_IMAGE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads
CDN_BASE_URL=https://cdn.example.com
ENABLE_IMAGE_OPTIMIZATION=true

# Rate Limiting
RATE_LIMIT_PREFIX=rate_limit
```

### Dependencies

```txt
redis==5.2.1
pillow==10.4.0
slowapi==0.1.9
```

## Performance Benefits

### Expected Improvements

1. **Response Times**:
   - Cached queries: 50-90% faster response times
   - Optimized images: 60-80% smaller file sizes
   - Bulk operations: 70-95% faster for batch processing

2. **Resource Usage**:
   - Reduced database load through caching
   - Lower bandwidth usage with optimized images
   - Protected against abuse with rate limiting

3. **Scalability**:
   - Better handling of concurrent requests
   - Reduced server resource consumption
   - Improved user experience under load

### Monitoring Recommendations

1. **Cache Hit Rates**: Monitor cache effectiveness
2. **Query Performance**: Track slow queries (>1s)
3. **Rate Limit Violations**: Monitor abuse patterns
4. **Image Processing**: Track optimization success rates

## Testing

Run the performance optimization tests:

```bash
cd apps/event-platform/backend
python test_performance_optimizations.py
```

The test suite covers:
- Cache operations and TTL behavior
- Rate limiting algorithms
- Image optimization pipeline
- Query optimization patterns
- Integration scenarios

## Deployment Considerations

### Production Setup

1. **Redis**: Deploy Redis cluster for high availability
2. **CDN**: Configure CDN for image delivery
3. **Monitoring**: Set up performance monitoring
4. **Indexes**: Apply suggested database indexes
5. **Configuration**: Tune cache TTLs and rate limits based on usage patterns

### Scaling

- **Horizontal**: Multiple Redis instances with consistent hashing
- **Vertical**: Increase Redis memory and CPU for cache performance
- **CDN**: Use global CDN for image delivery
- **Database**: Read replicas for cached query fallbacks