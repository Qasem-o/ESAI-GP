"""
Community models - Posts, Likes, Comments, Follows, UserStats
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint, Index, Float
from sqlalchemy.orm import relationship, backref
from datetime import datetime, timezone

from models import Base


class Post(Base):
    """User posts in the community feed."""
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    stock_symbol = Column(String(20), nullable=True)  # Optional attached stock
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Engagement metrics (cached)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)

    # Relationships
    user = relationship("User", backref=backref("posts", cascade="all, delete-orphan"))
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("PostBookmark", back_populates="post", cascade="all, delete-orphan")


class PostLike(Base):
    """Likes on posts."""
    __tablename__ = "post_likes"

    like_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    post = relationship("Post", back_populates="likes")

    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_post_like_user'),
    )


class PostComment(Base):
    """Comments on posts."""
    __tablename__ = "post_comments"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    post = relationship("Post", back_populates="comments")
    user = relationship("User")


class PostBookmark(Base):
    """Bookmarked posts."""
    __tablename__ = "post_bookmarks"

    bookmark_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    post = relationship("Post", back_populates="bookmarks")

    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_post_bookmark_user'),
    )


class UserFollow(Base):
    """User follow relationships."""
    __tablename__ = "user_follows"

    follow_id = Column(Integer, primary_key=True, autoincrement=True)
    follower_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    following_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('follower_id', 'following_id', name='uq_follow_pair'),
    )


class UserStats(Base):
    """Cached user statistics for performance."""
    __tablename__ = "user_stats"

    stat_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)

    # Trading stats
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)  # Percentage
    avg_return = Column(Float, default=0.0)  # Percentage
    best_trade = Column(Float, default=0.0)  # Percentage
    worst_trade = Column(Float, default=0.0)  # Percentage
    
    # Portfolio stats
    portfolio_value = Column(Float, default=0.0)
    portfolio_change = Column(Float, default=0.0)  # Percentage
    total_invested = Column(Float, default=0.0)
    total_profit_loss = Column(Float, default=0.0)

    user = relationship("User", backref=backref("stats", uselist=False, cascade="all, delete-orphan"))
