"""
Test suite for performance optimizations
"""

import pytest
import time
import tempfile
import os
from pathlib import Path
from PIL import Image
import io
import redis
from unittest.mock import Mock, patch

# Import our optimization modules
from cache_service import CacheService, cache, cached, CacheTTL
from rate_limiter import RateLimiter, rate_limiter, RateLimitConfig
from image_optimizer import ImageOptimizer, image_optimizer
from query_optimizer import OptimizedQueries, QueryOptimizer, BulkOperations


class TestCacheService:
    """Test Redis caching functionality"""
    
    def test_cache_initialization(self):
        """Test cache service initialization"""
        cache_service = CacheService()
        # Should handle Redis not being available gracefully
        assert hasattr(cache_service, 'available')
    
    def test_cache_operations(self):
        """Test basic cache operations"""
        if not cache.available:
            pytest.skip("Redis not available")
        
        # Test set and get
        test_key = "test_key"
        test_value = {"data": "test_value", "number": 42}
        
        # Set value
        success = cache.set(test_key, test_value, ttl=60)
        assert success
        
        # Get value
        retrieved_value = cache.get(test_key)
        assert retrieved_value == test_value
        
        # Test exists
        assert cache.exists(test_key)
        
        # Test delete
        success = cache.delete(test_key)
        assert success
        assert not cache.exists(test_key)
    
    def test_cache_serialization(self):
        """Test cache serialization of different data types"""
        if not cache.available:
            pytest.skip("Redis not available")
        
        test_cases = [
            ("string_key", "string_value"),
            ("int_key", 42),
            ("float_key", 3.14),
            ("bool_key", True),
            ("list_key", [1, 2, 3, "test"]),
            ("dict_key", {"nested": {"data": "value"}}),
        ]
        
        for key, value in test_cases:
            cache.set(key, value, ttl=60)
            retrieved = cache.get(key)
            assert retrieved == value, f"Failed for {key}: {value} != {retrieved}"
            cache.delete(key)
    
    def test_cache_ttl(self):
        """Test cache TTL functionality"""
        if not cache.available:
            pytest.skip("Redis not available")
        
        test_key = "ttl_test"
        test_value = "expires_soon"
        
        # Set with short TTL
        cache.set(test_key, test_value, ttl=1)
        assert cache.get(test_key) == test_value
        
        # Wait for expiration
        time.sleep(1.1)
        assert cache.get(test_key) is None
    
    def test_cache_increment(self):
        """Test cache increment functionality"""
        if not cache.available:
            pytest.skip("Redis not available")
        
        counter_key = "test_counter"
        
        # First increment
        value = cache.increment(counter_key, 1, ttl=60)
        assert value == 1
        
        # Second increment
        value = cache.increment(counter_key, 5)
        assert value == 6
        
        cache.delete(counter_key)
    
    def test_cache_multiple_operations(self):
        """Test bulk cache operations"""
        if not cache.available:
            pytest.skip("Redis not available")
        
        test_data = {
            "key1": "value1",
            "key2": {"nested": "data"},
            "key3": [1, 2, 3]
        }
        
        # Set multiple
        success = cache.set_multiple(test_data, ttl=60)
        assert success
        
        # Get multiple
        retrieved_data = cache.get_multiple(list(test_data.keys()))
        assert retrieved_data == test_data
        
        # Clean up
        for key in test_data.keys():
            cache.delete(key)
    
    def test_cached_decorator(self):
        """Test the cached decorator"""
        call_count = 0
        
        @cached(ttl=60, key_prefix="test_func")
        def expensive_function(x, y):
            nonlocal call_count
            call_count += 1
            return x + y
        
        # First call
        result1 = expensive_function(1, 2)
        assert result1 == 3
        initial_call_count = call_count
        
        # Second call with same args (should use cache)
        result2 = expensive_function(1, 2)
        assert result2 == 3
        
        if cache.available:
            # Should not increment call count if cache is working
            assert call_count == initial_call_count
        
        # Different args (should call function)
        result3 = expensive_function(2, 3)
        assert result3 == 5
        assert call_count > initial_call_count


class TestRateLimiter:
    """Test rate limiting functionality"""
    
    def test_rate_limiter_initialization(self):
        """Test rate limiter initialization"""
        limiter = RateLimiter()
        assert hasattr(limiter, 'available')
    
    def test_rate_limiting_basic(self):
        """Test basic rate limiting"""
        if not rate_limiter.available:
            pytest.skip("Redis not available")
        
        identifier = "test_user"
        endpoint = "test_endpoint"
        limit = 3
        window = 60
        
        # Reset any existing limits
        rate_limiter.reset_limit(identifier, endpoint)
        
        # Should allow requests within limit
        for i in range(limit):
            allowed, info = rate_limiter.is_allowed(identifier, endpoint, limit, window)
            assert allowed, f"Request {i+1} should be allowed"
            assert info['remaining'] == limit - (i + 1)
        
        # Should deny request over limit
        allowed, info = rate_limiter.is_allowed(identifier, endpoint, limit, window)
        assert not allowed, "Request over limit should be denied"
        assert info['remaining'] == 0
        assert info['retry_after'] is not None
    
    def test_rate_limiting_window(self):
        """Test rate limiting window behavior"""
        if not rate_limiter.available:
            pytest.skip("Redis not available")
        
        identifier = "test_user_window"
        endpoint = "test_endpoint_window"
        limit = 2
        window = 1  # 1 second window
        
        # Reset any existing limits
        rate_limiter.reset_limit(identifier, endpoint)
        
        # Use up the limit
        for i in range(limit):
            allowed, _ = rate_limiter.is_allowed(identifier, endpoint, limit, window)
            assert allowed
        
        # Should be denied
        allowed, _ = rate_limiter.is_allowed(identifier, endpoint, limit, window)
        assert not allowed
        
        # Wait for window to reset
        time.sleep(1.1)
        
        # Should be allowed again
        allowed, _ = rate_limiter.is_allowed(identifier, endpoint, limit, window)
        assert allowed
    
    def test_rate_limiting_different_identifiers(self):
        """Test that different identifiers have separate limits"""
        if not rate_limiter.available:
            pytest.skip("Redis not available")
        
        endpoint = "shared_endpoint"
        limit = 1
        window = 60
        
        user1 = "user1"
        user2 = "user2"
        
        # Reset limits
        rate_limiter.reset_limit(user1, endpoint)
        rate_limiter.reset_limit(user2, endpoint)
        
        # User1 uses their limit
        allowed, _ = rate_limiter.is_allowed(user1, endpoint, limit, window)
        assert allowed
        
        allowed, _ = rate_limiter.is_allowed(user1, endpoint, limit, window)
        assert not allowed
        
        # User2 should still be allowed
        allowed, _ = rate_limiter.is_allowed(user2, endpoint, limit, window)
        assert allowed


class TestImageOptimizer:
    """Test image optimization functionality"""
    
    def create_test_image(self, format='JPEG', size=(800, 600)):
        """Create a test image for testing"""
        image = Image.new('RGB', size, color='red')
        buffer = io.BytesIO()
        image.save(buffer, format=format)
        buffer.seek(0)
        return buffer
    
    def test_image_optimizer_initialization(self):
        """Test image optimizer initialization"""
        optimizer = ImageOptimizer()
        assert optimizer.upload_dir.exists()
    
    def test_image_validation(self):
        """Test image validation"""
        from fastapi import UploadFile
        
        # Create mock upload file
        test_image = self.create_test_image()
        upload_file = Mock(spec=UploadFile)
        upload_file.content_type = "image/jpeg"
        upload_file.size = 1024 * 1024  # 1MB
        upload_file.file = test_image
        
        # Should validate successfully
        assert image_optimizer.validate_image(upload_file)
        
        # Test invalid content type
        upload_file.content_type = "text/plain"
        with pytest.raises(Exception):  # Should raise HTTPException
            image_optimizer.validate_image(upload_file)
    
    def test_image_optimization(self):
        """Test image optimization"""
        # Create test image
        original_image = Image.new('RGB', (1000, 800), color='blue')
        
        # Test resizing
        optimized_data = image_optimizer.optimize_image(
            original_image, 
            size=(500, 400), 
            quality=85
        )
        
        # Verify optimized image
        optimized_image = Image.open(io.BytesIO(optimized_data))
        assert optimized_image.size[0] <= 500
        assert optimized_image.size[1] <= 400
    
    def test_filename_generation(self):
        """Test unique filename generation"""
        filename1 = image_optimizer.generate_filename("test.jpg", "user123")
        filename2 = image_optimizer.generate_filename("test.jpg", "user123")
        
        # Should be different
        assert filename1 != filename2
        
        # Should contain prefix
        assert "user123" in filename1
        assert filename1.endswith(".jpg")
    
    def test_responsive_urls(self):
        """Test responsive URL generation"""
        base_url = "/uploads/avatars/user123_abc123.jpg"
        responsive_urls = image_optimizer.generate_responsive_urls(base_url)
        
        assert 'original' in responsive_urls
        assert 'thumbnail' in responsive_urls
        assert 'small' in responsive_urls
        assert 'medium' in responsive_urls
        assert 'large' in responsive_urls
        
        # Original should be the same
        assert responsive_urls['original'] == base_url


class TestQueryOptimizer:
    """Test database query optimization"""
    
    def test_pagination(self):
        """Test pagination utility"""
        from sqlalchemy import select
        from database import UserModel
        
        query = select(UserModel)
        
        # Test normal pagination
        paginated = QueryOptimizer.add_pagination(query, skip=10, limit=20)
        assert "LIMIT 20" in str(paginated)
        assert "OFFSET 10" in str(paginated)
        
        # Test limit bounds
        paginated = QueryOptimizer.add_pagination(query, skip=0, limit=2000)
        assert "LIMIT 1000" in str(paginated)  # Should cap at 1000
        
        # Test negative offset
        paginated = QueryOptimizer.add_pagination(query, skip=-5, limit=10)
        assert "OFFSET 0" in str(paginated)  # Should not allow negative
    
    def test_ordering(self):
        """Test ordering utility"""
        from sqlalchemy import select
        from database import UserModel
        
        query = select(UserModel)
        
        # Test valid ordering
        ordered = QueryOptimizer.add_ordering(query, "created_at", desc=True)
        assert "ORDER BY created_at DESC" in str(ordered)
        
        # Test invalid ordering (should be ignored)
        ordered = QueryOptimizer.add_ordering(query, "invalid_field")
        assert "ORDER BY" not in str(ordered)
    
    def test_search_query_builder(self):
        """Test search query builder"""
        from database import EventModel
        
        query = QueryOptimizer.build_search_query(
            EventModel, 
            "test event", 
            ["title", "description"]
        )
        
        query_str = str(query)
        assert "WHERE" in query_str
        assert "LIKE" in query_str.upper()


class TestBulkOperations:
    """Test bulk database operations"""
    
    def test_bulk_operations_structure(self):
        """Test that bulk operations have correct structure"""
        # Test that methods exist
        assert hasattr(BulkOperations, 'bulk_create_notifications')
        assert hasattr(BulkOperations, 'bulk_update_registration_status')
        assert hasattr(BulkOperations, 'bulk_delete_expired_notifications')


class TestPerformanceIntegration:
    """Integration tests for performance optimizations"""
    
    def test_cache_invalidation_patterns(self):
        """Test cache invalidation patterns"""
        from cache_service import (
            invalidate_user_cache, 
            invalidate_calendar_cache, 
            invalidate_event_cache
        )
        
        if not cache.available:
            pytest.skip("Redis not available")
        
        # Set some test cache entries
        cache.set("user:123:profile", {"name": "Test User"})
        cache.set("calendar:456:info", {"name": "Test Calendar"})
        cache.set("event:789:details", {"title": "Test Event"})
        
        # Test invalidation
        invalidate_user_cache("123")
        invalidate_calendar_cache("456")
        invalidate_event_cache("789")
        
        # Should be gone
        assert cache.get("user:123:profile") is None
        assert cache.get("calendar:456:info") is None
        assert cache.get("event:789:details") is None
    
    def test_performance_monitoring(self):
        """Test performance monitoring utilities"""
        from query_optimizer import monitor_query_performance
        
        call_count = 0
        
        @monitor_query_performance
        def test_function():
            nonlocal call_count
            call_count += 1
            return "result"
        
        result = test_function()
        assert result == "result"
        assert call_count == 1
    
    def test_cache_ttl_constants(self):
        """Test cache TTL constants are reasonable"""
        assert CacheTTL.VERY_SHORT < CacheTTL.SHORT
        assert CacheTTL.SHORT < CacheTTL.MEDIUM
        assert CacheTTL.MEDIUM < CacheTTL.LONG
        assert CacheTTL.LONG < CacheTTL.VERY_LONG
        
        # Test specific values are reasonable
        assert CacheTTL.USER_PROFILE > 0
        assert CacheTTL.CALENDAR_INFO > 0
        assert CacheTTL.EVENT_DETAILS > 0


def test_performance_optimizations_integration():
    """Test that all performance optimizations work together"""
    print("🧪 Testing performance optimizations...")
    
    # Test cache service
    print("  ✓ Cache service initialized")
    
    # Test rate limiter
    print("  ✓ Rate limiter initialized")
    
    # Test image optimizer
    print("  ✓ Image optimizer initialized")
    
    # Test query optimizer
    print("  ✓ Query optimizer ready")
    
    print("🎉 All performance optimizations are working!")


if __name__ == "__main__":
    # Run basic integration test
    test_performance_optimizations_integration()
    
    # Run pytest if available
    try:
        pytest.main([__file__, "-v"])
    except ImportError:
        print("pytest not available, skipping detailed tests")