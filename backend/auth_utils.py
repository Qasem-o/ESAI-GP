"""
Authentication utilities for password hashing, JWT tokens, and security.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import JWTError, jwt
import re
import random
import string

# JWT Configuration — load from config/env, with a safe fallback
import os as _os
_env_secret = _os.getenv("SECRET_KEY", "")
SECRET_KEY = _env_secret if _env_secret else "your-default-secret-key-for-development-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Account lockout configuration
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30


def hash_password(password: str) -> str:
    """Hash a password using bcrypt natively."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash natively."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    
    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character (!@#$%^&*)
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character (!@#$%^&*)"
    
    return True, ""


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"type": "access", "exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token with expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"type": "refresh", "exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
        token_type: Expected token type ("access" or "refresh")
    
    Returns:
        dict: Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            return None
        
        return payload
    except JWTError:
        return None


def generate_verification_code() -> str:
    """Generate a random 6-digit verification code."""
    return ''.join(random.choices(string.digits, k=6))


def is_account_locked(failed_attempts: int, locked_until: Optional[datetime]) -> bool:
    """
    Check if an account is locked due to failed login attempts.
    
    Args:
        failed_attempts: Number of failed login attempts
        locked_until: Datetime when the account lock expires
    
    Returns:
        bool: True if account is locked, False otherwise
    """
    if failed_attempts >= MAX_FAILED_ATTEMPTS:
        if locked_until:
            locked_until_aware = locked_until.replace(tzinfo=timezone.utc) if locked_until.tzinfo is None else locked_until
            if locked_until_aware > datetime.now(timezone.utc):
                return True
    return False


def calculate_lockout_time() -> datetime:
    """Calculate the lockout expiration time."""
    return datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)


def get_password_strength_score(password: str) -> int:
    """
    Calculate password strength score (0-100).
    
    Returns:
        int: Password strength score
    """
    score = 0
    
    # Length score (max 30 points)
    if len(password) >= 8:
        score += 10
    if len(password) >= 12:
        score += 10
    if len(password) >= 16:
        score += 10
    
    # Character variety (max 40 points)
    if re.search(r"[a-z]", password):
        score += 10
    if re.search(r"[A-Z]", password):
        score += 10
    if re.search(r"\d", password):
        score += 10
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        score += 10
    
    # Complexity (max 30 points)
    if len(set(password)) > len(password) * 0.7:  # High character diversity
        score += 15
    if not re.search(r"(.)\1{2,}", password):  # No repeated characters
        score += 15
    
    return min(score, 100)


# Social Auth Verification


from google.oauth2 import id_token
from google.auth.transport import requests
import hashlib
import hmac
import json
from config import settings

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
TELEGRAM_BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN


def verify_google_token(token: str) -> Optional[dict]:
    """
    Verify Google token.
    Supports both ID tokens (JWT) and access tokens.
    
    Returns:
        dict: User info including 'email', 'name', 'picture', 'sub' (google_id)
    """
    # First, try to verify as an ID token (JWT)
    try:
        idreq = requests.Request()
        
        if GOOGLE_CLIENT_ID == "your-google-client-id":
             import jwt as pyjwt
             decoded = pyjwt.decode(token, options={"verify_signature": False})
             return decoded
        else:
             id_info = id_token.verify_oauth2_token(token, idreq, GOOGLE_CLIENT_ID)
             return id_info
             
    except Exception as e:
        print(f"ID token verification failed, trying as access token: {e}")
    
    # Fallback: try as an access token by calling Google's userinfo API
    try:
        import urllib.request
        import json as json_module
        
        req = urllib.request.Request(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={
                'Authorization': f'Bearer {token}',
                'User-Agent': 'EyeStocks/1.0 (FastAPI Backend)'
            }
        )
        with urllib.request.urlopen(req) as response:
            user_info = json_module.loads(response.read().decode('utf-8'))
            print(f"Successfully verified Google access token for email: {user_info.get('email')}")
            return user_info
            
    except Exception as e:
        import traceback
        print(f"Access token verification also failed: {e}")
        traceback.print_exc()
        return None

def verify_telegram_auth(data: dict) -> bool:
    """
    Verify Telegram authentication data using HMAC-SHA256.
    
    Telegram login widget sends: id, first_name, last_name, username, photo_url, auth_date, hash
    Logic:
    1. Sort keys alphabetically (excluding 'hash')
    2. Create data-check-string: key=value\n
    3. Calculate secret_key = SHA256(bot_token)
    4. Calculate hmac = HMAC_SHA256(secret_key, data-check-string)
    5. Compare calculated hmac with received hash
    """
    received_hash = data.get('hash')
    if not received_hash or not TELEGRAM_BOT_TOKEN:
        return False
        
    # Development bypass for placeholder token
    if TELEGRAM_BOT_TOKEN == "your-telegram-bot-token":
        print("WARNING: Bypassing Telegram verification due to placeholder token")
        return True

    
    # 1. Sort and create data-check-string
    data_check_arr = []
    for key, value in sorted(data.items()):
        if key != 'hash':
            data_check_arr.append(f"{key}={value}")
    
    data_check_string = "\n".join(data_check_arr)
    
    # 2. Key generation
    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    
    # 3. HMAC calculation
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    # 4. Compare
    return calculated_hash == received_hash
