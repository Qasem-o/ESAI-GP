"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class UserSignup(BaseModel):
    """User signup request schema."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    full_name: Optional[str] = Field(None, max_length=100)
    password: str = Field(..., min_length=8)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must contain only letters, numbers, hyphens, and underscores')
        return v


class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr
    password: str


class EmailVerificationRequest(BaseModel):
    """Email verification request schema."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class ResendVerificationRequest(BaseModel):
    """Resend verification code request schema."""
    email: EmailStr


class GoogleAuthRequest(BaseModel):
    """Google OAuth authentication request schema."""
    token: str
    username: Optional[str] = Field(None, min_length=3, max_length=50)


class TelegramAuthRequest(BaseModel):
    """Telegram authentication request schema."""
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str


class UserResponse(BaseModel):
    """User profile response schema."""
    user_id: int
    username: str
    full_name: Optional[str] = None
    email: str
    phone_number: Optional[str]
    profile_picture_url: Optional[str]
    bio: Optional[str]
    profile_completed: bool
    created_at: datetime
    is_verified: bool
    is_admin: bool = False
    last_login: Optional[datetime]
    has_password: bool = False
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    """Update user profile request schema."""
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    full_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)
    profile_picture_url: Optional[str] = Field(None)
    email: Optional[EmailStr] = Field(None)


class MessageResponse(BaseModel):
    """Generic message response schema."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None

class PasswordResetRequest(BaseModel):
    """Password reset request schema."""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """Password reset confirm schema."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(..., min_length=8)
