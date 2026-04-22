"""
User profile and social features models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base

class UserStats(Base):
    """User statistics and metrics"""
    __tablename__ = "user_stats"
    
    stat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    
    # Social stats
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
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="stats")


class UserFollow(Base):
    """User follow relationships"""
    __tablename__ = "user_follows"
    
    follow_id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    follower = relationship("User", foreign_keys=[follower_id], backref="following")
    following = relationship("User", foreign_keys=[following_id], backref="followers")


class Post(Base):
    """User posts"""
    __tablename__ = "posts"
    
    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    stock_symbol = Column(String(10), nullable=True)
    
    # Engagement metrics
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="posts")


class PostLike(Base):
    """Post likes"""
    __tablename__ = "post_likes"
    
    like_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
