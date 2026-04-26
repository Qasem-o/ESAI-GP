"""
Authentication API routes for user signup, login, email verification, and OAuth.
"""

from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import User, OAuthProvider, EmailVerification
from schemas import (
    UserSignup, UserLogin, EmailVerificationRequest, ResendVerificationRequest,
    GoogleAuthRequest, TelegramAuthRequest, TokenResponse, UserResponse, MessageResponse,
    UpdateProfileRequest, RefreshTokenRequest
)
from auth_utils import (
    hash_password, verify_password, validate_password_strength,
    create_access_token, create_refresh_token, verify_token,
    generate_verification_code, is_account_locked, calculate_lockout_time,
    verify_google_token, verify_telegram_auth
)
from email_service import send_verification_email, send_welcome_email

router = APIRouter(prefix="/auth", tags=["authentication"])


# Dependency to get database session
def get_db():
    from main import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency to get current user from token
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Extract and validate user from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token, "access")
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/signup", response_model=MessageResponse)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Sends verification code to email.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Validate password strength
    is_valid, error_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        password_hash=password_hash,
        is_verified=False,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store verification code
    verification = EmailVerification(
        user_id=new_user.user_id,
        email=new_user.email,
        verification_code=code,
        expires_at=expires_at
    )
    
    db.add(verification)
    db.commit()
    
    # Send verification email safely using request data to avoid DetachedInstanceError
    await send_verification_email(user_data.email, code, user_data.username)
    
    return MessageResponse(
        message=f"Account created successfully. Please check your email ({user_data.email}) for the verification code.",
        success=True
    )


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(
    verification_data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Verify email with 6-digit code.
    Returns JWT tokens on successful verification.
    """
    # Find user
    user = db.query(User).filter(User.email == verification_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Find verification code
    verification = db.query(EmailVerification).filter(
        EmailVerification.email == verification_data.email,
        EmailVerification.verification_code == verification_data.code,
        EmailVerification.is_used == False
    ).order_by(EmailVerification.created_at.desc()).first()
    
    if not verification:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Check if code expired
    if verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")
    
    # Check attempts
    if verification.attempts >= 3:
        raise HTTPException(status_code=400, detail="Too many failed attempts. Please request a new code.")
    
    # Mark code as used
    verification.is_used = True
    
    # Mark user as verified
    user.is_verified = True
    user.last_login = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    # Send welcome email
    await send_welcome_email(user.email, user.username)
    
    # Generate tokens
    access_token = create_access_token({"user_id": user.user_id})
    refresh_token = create_refresh_token({"user_id": user.user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    request_data: ResendVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Resend verification code to email.
    """
    # Find user
    user = db.query(User).filter(User.email == request_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Invalidate old codes
    db.query(EmailVerification).filter(
        EmailVerification.email == request_data.email,
        EmailVerification.is_used == False
    ).update({"is_used": True})
    
    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store new verification code
    verification = EmailVerification(
        user_id=user.user_id,
        email=user.email,
        verification_code=code,
        expires_at=expires_at
    )
    
    db.add(verification)
    db.commit()
    
    # Send verification email
    await send_verification_email(user.email, code, user.username)
    
    return MessageResponse(
        message=f"Verification code sent to {request_data.email}",
        success=True
    )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns JWT tokens on successful authentication.
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if account is locked
    if is_account_locked(user.failed_login_attempts, user.locked_until):
        minutes_left = int((user.locked_until - datetime.utcnow()).total_seconds() / 60)
        raise HTTPException(
            status_code=403,
            detail=f"Account locked due to too many failed login attempts. Try again in {minutes_left} minutes."
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        # Increment failed attempts
        user.failed_login_attempts += 1
        
        # Lock account if max attempts reached
        if user.failed_login_attempts >= 5:
            user.locked_until = calculate_lockout_time()
        
        db.commit()
        
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in. Check your inbox for the verification code."
        )
    
    # Reset failed attempts on successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    # Generate tokens
    access_token = create_access_token({"user_id": user.user_id})
    refresh_token = create_refresh_token({"user_id": user.user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return UserResponse.from_orm(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile."""
    # Update username if provided
    if profile_data.username:
        # Check if username is taken by another user
        existing = db.query(User).filter(
            User.username == profile_data.username,
            User.user_id != current_user.user_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        current_user.username = profile_data.username
    
    # Update full name if provided
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    # Update phone number if provided
    if profile_data.phone_number is not None:
        current_user.phone_number = profile_data.phone_number
    
    # Update bio if provided
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    
    # Update profile picture if provided
    if profile_data.profile_picture_url is not None:
        current_user.profile_picture_url = profile_data.profile_picture_url
    
    # Mark profile as completed if user has filled basic info
    if current_user.username and current_user.email:
        current_user.profile_completed = True
    
    current_user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    payload = verify_token(token_data.refresh_token, "refresh")
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate new tokens
    access_token = create_access_token({"user_id": user.user_id})
    refresh_token = create_refresh_token({"user_id": user.user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout user.
    Note: Since we're using stateless JWT, actual token invalidation
    would require a token blacklist (not implemented in this version).
    """
    return MessageResponse(
        message="Logged out successfully",
        success=True
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate with Google.
    Unverified Google emails are trusted.
    """
    # Verify token
    user_info = verify_google_token(auth_data.token)
    if not user_info:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    
    email = user_info.get('email')
    google_id = user_info.get('sub')
    name = user_info.get('name', '')
    picture = user_info.get('picture')
    
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")
        
    # Check if user exists by email
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # User exists, ensure OAuth provider link exists
        provider = db.query(OAuthProvider).filter(
            OAuthProvider.user_id == user.user_id,
            OAuthProvider.provider == 'google'
        ).first()
        
        if not provider:
            # Link Google account
            new_provider = OAuthProvider(
                user_id=user.user_id,
                provider='google',
                provider_user_id=google_id
            )
            db.add(new_provider)
            try:
                db.commit()
            except:
                db.rollback()
        
        # If user was unverified, mark verified because Google is trusted
        if not user.is_verified:
            user.is_verified = True
            db.commit()
            
    else:
        # Create new user
        # We need a username. Try to use email prefix or name, ensure uniqueness
        base_username = (auth_data.username or email.split('@')[0]).replace(' ', '_')
        username = base_username
        counter = 1
        
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1
            
        user = User(
            email=email,
            username=username,
            full_name=name,
            password_hash=None, # No password for OAuth users
            is_verified=True,
            profile_picture_url=picture,
            profile_completed=False,  # New users need to complete profile
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create OAuth provider link
        provider = OAuthProvider(
            user_id=user.user_id,
            provider='google',
            provider_user_id=google_id
        )
        db.add(provider)
        db.commit()
        
    # Generate tokens
    access_token = create_access_token({"user_id": user.user_id})
    refresh_token = create_refresh_token({"user_id": user.user_id})
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/telegram", response_model=TokenResponse)
async def telegram_auth(auth_data: TelegramAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate with Telegram.
    """
    # Convert model to dict for verification
    data_dict = auth_data.dict()
    
    # Verify hash
    if not verify_telegram_auth(data_dict):
        raise HTTPException(status_code=400, detail="Invalid Telegram authentication data")
        
    telegram_id = str(auth_data.id)
    username = auth_data.username or f"user_{telegram_id}"
    
    # Telegram doesn't provide email by default in widget
    # We'll generate a dummy placeholder or require user to add it later
    # Format: {telegram_id}@telegram.user
    email = f"{telegram_id}@telegram.user"
    
    # Check if user exists by email (dummy)
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        base_username = username
        final_username = base_username
        counter = 1
        
        while db.query(User).filter(User.username == final_username).first():
            final_username = f"{base_username}_{counter}"
            counter += 1
        
        user = User(
            email=email,
            username=final_username,
            password_hash=None,
            is_verified=True,
            profile_picture_url=auth_data.photo_url,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Check if OAuth provider link exists
    provider = db.query(OAuthProvider).filter(
        OAuthProvider.provider == 'telegram',
        OAuthProvider.provider_user_id == telegram_id
    ).first()
    
    if not provider:
        new_provider = OAuthProvider(
            user_id=user.user_id,
            provider='telegram',
            provider_user_id=telegram_id
        )
        db.add(new_provider)
        db.commit()
    
    # Generate tokens
    access_token = create_access_token({"user_id": user.user_id})
    refresh_token = create_refresh_token({"user_id": user.user_id})
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar image.
    Max size: 10MB
    Allowed types: jpg, jpeg, png, gif, webp
    """
    from upload_utils import save_avatar, delete_avatar
    
    # Delete old avatar if exists
    if current_user.profile_picture_url and current_user.profile_picture_url.startswith('/uploads/'):
        delete_avatar(current_user.profile_picture_url)
    
    # Save new avatar
    avatar_url = await save_avatar(file, current_user.user_id)
    
    # Update user profile
    current_user.profile_picture_url = avatar_url
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Avatar uploaded successfully",
        "avatar_url": avatar_url,
        "user": UserResponse.from_orm(current_user)
    }


@router.get("/check-username/{username}")
async def check_username_availability(
    username: str,
    db: Session = Depends(get_db)
):
    """Check if username is available."""
    existing = db.query(User).filter(User.username == username).first()
    return {
        "available": existing is None,
        "username": username
    }

