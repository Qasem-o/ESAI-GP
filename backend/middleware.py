"""
Security middleware for rate limiting and security headers.
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time


# Rate limiting storage (in-memory, use Redis in production)
rate_limit_storage: Dict[str, list] = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to prevent brute force attacks.
    
    Limits:
    - Auth endpoints (/auth/*): 10 requests per minute
    - Other endpoints: 100 requests per minute
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.auth_limit = 10  # requests per minute for auth endpoints
        self.general_limit = 100  # requests per minute for other endpoints
        self.window = 60  # time window in seconds
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        path = request.url.path
        
        # Determine rate limit based on path
        if path.startswith("/auth/"):
            limit = self.auth_limit
        else:
            limit = self.general_limit
        
        # Create unique key for this IP and path
        key = f"{client_ip}:{path}"
        
        # Get current time
        now = time.time()
        
        # Clean old entries
        rate_limit_storage[key] = [
            timestamp for timestamp in rate_limit_storage[key]
            if now - timestamp < self.window
        ]
        
        # Check rate limit
        if len(rate_limit_storage[key]) >= limit:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please try again later.",
                    "error_code": "RATE_LIMIT_EXCEEDED"
                }
            )
        
        # Add current request timestamp
        rate_limit_storage[key].append(now)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(limit - len(rate_limit_storage[key]))
        response.headers["X-RateLimit-Reset"] = str(int(now + self.window))
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    # Check for proxy headers first
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client
    return request.client.host if request.client else "unknown"
