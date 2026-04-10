"""
Community API routes — posts, likes, comments, follows, feed
All social endpoints require JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from community_models import Post, PostLike, PostComment, PostBookmark, UserFollow, UserStats
from models import User
from auth_utils import verify_token

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preparedata import Stock

router = APIRouter(prefix="/community", tags=["community"])


# --- DB Dependency ---
def get_db():
    from main import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_id(authorization: str = None) -> int:
    if not authorization:
        from fastapi import Header as FastAPIHeader
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user_id


def get_optional_user_id(authorization: str = None) -> Optional[int]:
    """Like get_current_user_id but returns None instead of raising."""
    if not authorization:
        return None
    try:
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        payload = verify_token(token)
        if payload:
            return payload.get("user_id")
    except Exception:
        pass
    return None


from fastapi import Header

# --- Pydantic Schemas ---

class CreatePostRequest(BaseModel):
    content: str
    stock_symbol: Optional[str] = None

class CreateCommentRequest(BaseModel):
    content: str


# ============ POSTS ============

@router.get("/feed")
async def get_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    filter: str = Query("all"),  # all | trending | following
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get community feed with posts, sorted by newest."""
    user_id = get_optional_user_id(authorization)

    offset = (page - 1) * limit

    query = db.query(Post)

    if filter == "following" and user_id:
        following_ids = [f.following_id for f in db.query(UserFollow.following_id).filter(
            UserFollow.follower_id == user_id
        ).all()]
        query = query.filter(Post.user_id.in_(following_ids))

    if filter == "trending":
        # Order by most liked in the recent period
        subq = db.query(
            PostLike.post_id,
            func.count(PostLike.like_id).label("like_count")
        ).group_by(PostLike.post_id).subquery()

        query = query.outerjoin(subq, Post.post_id == subq.c.post_id) \
            .order_by(desc(subq.c.like_count), desc(Post.created_at))
    else:
        query = query.order_by(desc(Post.created_at))

    posts = query.offset(offset).limit(limit).all()

    result = []
    for post in posts:
        author = db.query(User).filter(User.user_id == post.user_id).first()
        likes_count = db.query(func.count(PostLike.like_id)).filter(PostLike.post_id == post.post_id).scalar()
        comments_count = db.query(func.count(PostComment.comment_id)).filter(PostComment.post_id == post.post_id).scalar()

        is_liked = False
        is_bookmarked = False
        if user_id:
            is_liked = db.query(PostLike).filter(
                PostLike.post_id == post.post_id, PostLike.user_id == user_id
            ).first() is not None
            is_bookmarked = db.query(PostBookmark).filter(
                PostBookmark.post_id == post.post_id, PostBookmark.user_id == user_id
            ).first() is not None

        # Get stock info if attached
        stock_data = None
        if post.stock_symbol:
            stock = db.query(Stock).filter(Stock.symbol == post.stock_symbol).first()
            if stock:
                stock_data = {
                    "symbol": stock.symbol,
                    "name": stock.name,
                    "price": float(stock.current_price) if stock.current_price else 0,
                }

        profile_pic = None
        if author and author.profile_picture_url:
            profile_pic = author.profile_picture_url

        result.append({
            "post_id": post.post_id,
            "content": post.content,
            "stock": stock_data,
            "created_at": post.created_at.isoformat(),
            "author": {
                "user_id": author.user_id if author else 0,
                "username": author.username if author else "Unknown",
                "profile_picture_url": profile_pic,
            },
            "likes_count": likes_count,
            "comments_count": comments_count,
            "is_liked": is_liked,
            "is_bookmarked": is_bookmarked,
        })

    return result


@router.post("/posts")
async def create_post(
    request: CreatePostRequest,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Create a new post."""
    user_id = get_current_user_id(authorization)

    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Post content cannot be empty")

    post = Post(
        user_id=user_id,
        content=request.content.strip(),
        stock_symbol=request.stock_symbol,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Update user stats
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if stats:
        stats.posts_count += 1
    else:
        stats = UserStats(user_id=user_id, posts_count=1)
        db.add(stats)
    db.commit()

    return {"message": "Post created", "post_id": post.post_id}


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Delete own post."""
    user_id = get_current_user_id(authorization)
    post = db.query(Post).filter(Post.post_id == post_id, Post.user_id == user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}


# ============ LIKES ============

@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Toggle like on a post."""
    user_id = get_current_user_id(authorization)

    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(PostLike).filter(
        PostLike.post_id == post_id, PostLike.user_id == user_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        new_count = db.query(func.count(PostLike.like_id)).filter(PostLike.post_id == post_id).scalar()
        return {"liked": False, "likes_count": new_count}
    else:
        like = PostLike(post_id=post_id, user_id=user_id)
        db.add(like)
        db.commit()
        new_count = db.query(func.count(PostLike.like_id)).filter(PostLike.post_id == post_id).scalar()
        return {"liked": True, "likes_count": new_count}


# ============ BOOKMARKS ============

@router.post("/posts/{post_id}/bookmark")
async def toggle_bookmark(
    post_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Toggle bookmark on a post."""
    user_id = get_current_user_id(authorization)

    existing = db.query(PostBookmark).filter(
        PostBookmark.post_id == post_id, PostBookmark.user_id == user_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False}
    else:
        bm = PostBookmark(post_id=post_id, user_id=user_id)
        db.add(bm)
        db.commit()
        return {"bookmarked": True}


# ============ COMMENTS ============

@router.get("/posts/{post_id}/comments")
async def get_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments on a post."""
    comments = db.query(PostComment).filter(
        PostComment.post_id == post_id
    ).order_by(PostComment.created_at).all()

    result = []
    for c in comments:
        author = db.query(User).filter(User.user_id == c.user_id).first()
        result.append({
            "comment_id": c.comment_id,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "author": {
                "user_id": author.user_id if author else 0,
                "username": author.username if author else "Unknown",
                "profile_picture_url": author.profile_picture_url if author else None,
            }
        })

    return result


@router.post("/posts/{post_id}/comments")
async def create_comment(
    post_id: int,
    request: CreateCommentRequest,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Add a comment to a post."""
    user_id = get_current_user_id(authorization)

    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = PostComment(
        post_id=post_id,
        user_id=user_id,
        content=request.content.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    author = db.query(User).filter(User.user_id == user_id).first()
    return {
        "comment_id": comment.comment_id,
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
        "author": {
            "user_id": author.user_id if author else 0,
            "username": author.username if author else "Unknown",
            "profile_picture_url": author.profile_picture_url if author else None,
        }
    }


# ============ FOLLOWS ============

@router.post("/follow/{target_user_id}")
async def toggle_follow(
    target_user_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Follow/unfollow a user."""
    user_id = get_current_user_id(authorization)

    if user_id == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = db.query(User).filter(User.user_id == target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(UserFollow).filter(
        UserFollow.follower_id == user_id,
        UserFollow.following_id == target_user_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        # Update stats
        _update_follow_stats(db, user_id, target_user_id)
        return {"following": False}
    else:
        follow = UserFollow(follower_id=user_id, following_id=target_user_id)
        db.add(follow)
        db.commit()
        # Update stats
        _update_follow_stats(db, user_id, target_user_id)
        return {"following": True}


@router.get("/follow/check/{target_user_id}")
async def check_follow(
    target_user_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """Check if current user follows a target user."""
    user_id = get_current_user_id(authorization)
    exists = db.query(UserFollow).filter(
        UserFollow.follower_id == user_id,
        UserFollow.following_id == target_user_id
    ).first()
    return {"following": exists is not None}


def _update_follow_stats(db: Session, follower_id: int, following_id: int):
    """Update follow counts for both users."""
    for uid in [follower_id, following_id]:
        stats = db.query(UserStats).filter(UserStats.user_id == uid).first()
        if not stats:
            stats = UserStats(user_id=uid)
            db.add(stats)
            db.flush()

    # Follower's following_count
    follower_stats = db.query(UserStats).filter(UserStats.user_id == follower_id).first()
    follower_stats.following_count = db.query(func.count(UserFollow.follow_id)).filter(
        UserFollow.follower_id == follower_id
    ).scalar()

    # Following's followers_count
    following_stats = db.query(UserStats).filter(UserStats.user_id == following_id).first()
    following_stats.followers_count = db.query(func.count(UserFollow.follow_id)).filter(
        UserFollow.following_id == following_id
    ).scalar()

    db.commit()


# ============ TOP TRADERS ============

@router.get("/top-traders")
async def get_top_traders(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get top users sorted by followers count."""
    user_id = get_optional_user_id(authorization)

    top_users = db.query(User, UserStats).outerjoin(
        UserStats, User.user_id == UserStats.user_id
    ).order_by(desc(UserStats.followers_count)).limit(10).all()

    result = []
    for user, stats in top_users:
        is_following = False
        if user_id and user.user_id != user_id:
            is_following = db.query(UserFollow).filter(
                UserFollow.follower_id == user_id,
                UserFollow.following_id == user.user_id
            ).first() is not None

        result.append({
            "user_id": user.user_id,
            "username": user.username,
            "profile_picture_url": user.profile_picture_url,
            "followers_count": stats.followers_count if stats else 0,
            "posts_count": stats.posts_count if stats else 0,
            "is_following": is_following,
        })

    return result
