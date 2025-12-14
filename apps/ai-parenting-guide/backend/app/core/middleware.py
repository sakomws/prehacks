"""
Custom middleware for the AI Parenting Guide platform.
Includes rate limiting, request logging, and security enhancements.
"""

import time
from typing import Callable
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
import structlog

from app.services.rate_limiter import RateLimiter
from app.services.auth import AuthService
from app.core.database import get_db

logger = structlog.get_logger("middleware")


class RateLimitMiddleware:
    """
    Middleware for applying rate limits to API endpoints.
    
    Automatically applies appropriate rate limits based on user role
    and endpoint type, with special handling for AI endpoints.
    """
    
    def __init__(self, app):
        self.app = app
        self.rate_limiter = RateLimiter()
        
        # Endpoints that require special rate limiting
        self.ai_endpoints = ["/api/v1/ai/"]
        self.upload_endpoints = ["/api/v1/content/upload"]
        self.public_endpoints = ["/", "/health", "/docs", "/openapi.json"]
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        
        # Skip rate limiting for public endpoints
        if any(request.url.path.startswith(endpoint) for endpoint in self.public_endpoints):
            await self.app(scope, receive, send)
            return
        
        # Extract user information from authorization header
        user_info = await self._extract_user_info(request)
        
        if user_info:
            # Determine endpoint type
            endpoint_type = self._determine_endpoint_type(request.url.path)
            
            # Check rate limit
            rate_limit_result = await self.rate_limiter.check_rate_limit(
                user_id=user_info["user_id"],
                user_role=user_info["role"],
                endpoint_type=endpoint_type
            )
            
            if not rate_limit_result["allowed"]:
                # Rate limit exceeded
                logger.warning("Rate limit exceeded", 
                              user_id=user_info["user_id"],
                              endpoint=request.url.path,
                              method=request.method)
                
                response = JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Rate limit exceeded",
                        "limit": rate_limit_result["limit"],
                        "retry_after": rate_limit_result.get("retry_after", 60)
                    },
                    headers={
                        "X-RateLimit-Limit": str(rate_limit_result["limit"]),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(rate_limit_result.get("reset_time", 0)),
                        "Retry-After": str(rate_limit_result.get("retry_after", 60))
                    }
                )
                await response(scope, receive, send)
                return
            
            # Add rate limit headers to response
            async def add_rate_limit_headers(scope, receive, send):
                async def send_wrapper(message):
                    if message["type"] == "http.response.start":
                        headers = dict(message.get("headers", []))
                        headers[b"x-ratelimit-limit"] = str(rate_limit_result["limit"]).encode()
                        headers[b"x-ratelimit-remaining"] = str(rate_limit_result.get("remaining", 0)).encode()
                        headers[b"x-ratelimit-reset"] = str(rate_limit_result.get("reset_time", 0)).encode()
                        message["headers"] = list(headers.items())
                    await send(message)
                
                await self.app(scope, receive, send_wrapper)
            
            await add_rate_limit_headers(scope, receive, send)
        else:
            # No user info, proceed without rate limiting (will be handled by auth)
            await self.app(scope, receive, send)
    
    async def _extract_user_info(self, request: Request) -> dict:
        """Extract user information from request headers."""
        try:
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return None
            
            token = auth_header.split(" ")[1]
            
            # Use a database session to decode token
            db = next(get_db())
            auth_service = AuthService(db)
            token_data = auth_service.decode_token(token)
            
            if token_data:
                return {
                    "user_id": token_data.user_id,
                    "role": token_data.role,
                    "email": token_data.email
                }
            
            return None
            
        except Exception as e:
            logger.debug("Failed to extract user info for rate limiting", error=str(e))
            return None
    
    def _determine_endpoint_type(self, path: str) -> str:
        """Determine the type of endpoint for rate limiting."""
        if any(path.startswith(endpoint) for endpoint in self.ai_endpoints):
            return "ai"
        elif any(path.startswith(endpoint) for endpoint in self.upload_endpoints):
            return "upload"
        else:
            return "general"


class RequestLoggingMiddleware:
    """
    Middleware for logging HTTP requests and responses.
    
    Provides structured logging of API usage for monitoring and debugging.
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        start_time = time.time()
        
        # Log request
        logger.info("Request started",
                   method=request.method,
                   path=request.url.path,
                   query_params=str(request.query_params),
                   client_ip=request.client.host if request.client else None,
                   user_agent=request.headers.get("user-agent"))
        
        # Process request and capture response
        response_info = {}
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                response_info["status_code"] = message["status"]
                response_info["headers"] = dict(message.get("headers", []))
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
            
            # Log response
            duration = time.time() - start_time
            logger.info("Request completed",
                       method=request.method,
                       path=request.url.path,
                       status_code=response_info.get("status_code"),
                       duration_ms=round(duration * 1000, 2),
                       client_ip=request.client.host if request.client else None)
            
        except Exception as e:
            # Log error
            duration = time.time() - start_time
            logger.error("Request failed",
                        method=request.method,
                        path=request.url.path,
                        error=str(e),
                        duration_ms=round(duration * 1000, 2),
                        client_ip=request.client.host if request.client else None)
            raise


class SecurityHeadersMiddleware:
    """
    Middleware for adding security headers to responses.
    
    Adds standard security headers to protect against common attacks.
    """
    
    def __init__(self, app):
        self.app = app
        
        # Security headers to add
        self.security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        }
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = dict(message.get("headers", []))
                
                # Add security headers
                for header_name, header_value in self.security_headers.items():
                    headers[header_name.lower().encode()] = header_value.encode()
                
                message["headers"] = list(headers.items())
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)