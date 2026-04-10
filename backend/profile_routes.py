"""
Profile API routes for user stats, social features, and posts
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime

from models import User
from community_models import UserStats, UserFollow, Post, PostLike
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

# Dependency to get database session
def get_db():
    from main import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class UserStatsResponse(BaseModel):
    followers_count: int
    following_count: int
    posts_count: int
    total_trades: int
    win_rate: float
    avg_return: float
    best_trade: float
    portfolio_value: float
    portfolio_change: float
    
    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    post_id: int
    user_id: int
    username: str
    content: str
    stock_symbol: Optional[str]
    likes_count: int
    comments_count: int
    shares_count: int
    views_count: int
    created_at: datetime
    is_liked: bool = False
    
    class Config:
        from_attributes = True

class FollowerResponse(BaseModel):
    user_id: int
    username: str
    email: str
    profile_picture_url: Optional[str]
    bio: Optional[str]
    followers_count: int
    is_verified: bool
    
    class Config:
        from_attributes = True

# Get current user from token (simplified - should use auth_utils)
async def get_current_user_id(authorization: str = None) -> Optional[int]:
    # For now, return None if no auth
    # In production, decode JWT token
    if not authorization:
        return None
    # TODO: Implement proper JWT verification
    return None

@router.get("/stats/{user_id}", response_model=UserStatsResponse)
async def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user statistics"""
    # Get or create user stats
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    if not stats:
        # Create default stats for user
        stats = UserStats(
            user_id=user_id,
            followers_count=0,
            following_count=0,
            posts_count=0,
            total_trades=0,
            win_rate=0.0,
            avg_return=0.0,
            best_trade=0.0,
            portfolio_value=0.0,
            portfolio_change=0.0
        )
        db.add(stats)
        db.commit()
        db.refresh(stats)
    
    return stats

@router.get("/posts/{user_id}", response_model=List[PostResponse])
async def get_user_posts(
    user_id: int, 
    limit: int = 20,
    current_user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get user's posts"""
    posts = db.query(Post).filter(Post.user_id == user_id)\
        .order_by(desc(Post.created_at))\
        .limit(limit)\
        .all()
    
    # Get user info
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check which posts current user has liked
    liked_post_ids = set()
    if current_user_id:
        likes = db.query(PostLike.post_id).filter(
            PostLike.user_id == current_user_id,
            PostLike.post_id.in_([p.post_id for p in posts])
        ).all()
        liked_post_ids = {like[0] for like in likes}
    
    # Format response
    result = []
    for post in posts:
        result.append(PostResponse(
            post_id=post.post_id,
            user_id=post.user_id,
            username=user.username,
            content=post.content,
            stock_symbol=post.stock_symbol,
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            views_count=post.views_count,
            created_at=post.created_at,
            is_liked=post.post_id in liked_post_ids
        ))
    
    return result

@router.get("/followers/{user_id}", response_model=List[FollowerResponse])
async def get_followers(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Get user's followers"""
    # Get follower relationships
    follows = db.query(UserFollow).filter(UserFollow.following_id == user_id)\
        .order_by(desc(UserFollow.created_at))\
        .limit(limit)\
        .all()
    
    follower_ids = [f.follower_id for f in follows]
    
    # Get follower user details
    followers = db.query(User).filter(User.user_id.in_(follower_ids)).all()
    
    # Get stats for each follower
    result = []
    for follower in followers:
        stats = db.query(UserStats).filter(UserStats.user_id == follower.user_id).first()
        result.append(FollowerResponse(
            user_id=follower.user_id,
            username=follower.username,
            email=follower.email,
            profile_picture_url=follower.profile_picture_url,
            bio=follower.bio,
            followers_count=stats.followers_count if stats else 0,
            is_verified=follower.is_verified
        ))
    
    return result

@router.get("/following/{user_id}", response_model=List[FollowerResponse])
async def get_following(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Get users that this user follows"""
    # Get following relationships
    follows = db.query(UserFollow).filter(UserFollow.follower_id == user_id)\
        .order_by(desc(UserFollow.created_at))\
        .limit(limit)\
        .all()
    
    following_ids = [f.following_id for f in follows]
    
    # Get following user details
    following = db.query(User).filter(User.user_id.in_(following_ids)).all()
    
    # Get stats for each
    result = []
    for user in following:
        stats = db.query(UserStats).filter(UserStats.user_id == user.user_id).first()
        result.append(FollowerResponse(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            profile_picture_url=user.profile_picture_url,
            bio=user.bio,
            followers_count=stats.followers_count if stats else 0,
            is_verified=user.is_verified
        ))
    
    return result

@router.post("/follow/{user_id}")
async def follow_user(
    user_id: int,
    current_user_id: int,  # Should come from JWT token
    db: Session = Depends(get_db)
):
    """Follow a user"""
    # Check if already following
    existing = db.query(UserFollow).filter(
        UserFollow.follower_id == current_user_id,
        UserFollow.following_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    # Create follow relationship
    follow = UserFollow(follower_id=current_user_id, following_id=user_id)
    db.add(follow)
    
    # Update stats
    follower_stats = db.query(UserStats).filter(UserStats.user_id == current_user_id).first()
    if follower_stats:
        follower_stats.following_count += 1
    
    following_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if following_stats:
        following_stats.followers_count += 1
    
    db.commit()
    
    return {"message": "Successfully followed user"}

@router.delete("/unfollow/{user_id}")
async def unfollow_user(
    user_id: int,
    current_user_id: int,  # Should come from JWT token
    db: Session = Depends(get_db)
):
    """Unfollow a user"""
    follow = db.query(UserFollow).filter(
        UserFollow.follower_id == current_user_id,
        UserFollow.following_id == user_id
    ).first()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")
    
    db.delete(follow)
    
    # Update stats
    follower_stats = db.query(UserStats).filter(UserStats.user_id == current_user_id).first()
    if follower_stats:
        follower_stats.following_count -= 1
    
    following_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if following_stats:
        following_stats.followers_count -= 1
    
    db.commit()
    
    return {"message": "Successfully unfollowed user"}
