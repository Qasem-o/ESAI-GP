"""
Portfolio and Transaction models for user stock holdings
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Numeric, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from models import Base


class PortfolioHolding(Base):
    """A user's current stock holding"""
    __tablename__ = "portfolio_holdings"

    holding_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    stock_symbol = Column(String(32), nullable=False)
    stock_name = Column(String(255), nullable=True)
    shares = Column(Float, nullable=False, default=0)
    avg_price = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="portfolio_holdings")

    __table_args__ = (
        UniqueConstraint('user_id', 'stock_symbol', name='uq_user_stock_holding'),
    )


class PortfolioTransaction(Base):
    """A buy/sell transaction record"""
    __tablename__ = "portfolio_transactions"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    stock_symbol = Column(String(32), nullable=False)
    stock_name = Column(String(255), nullable=True)
    transaction_type = Column(String(10), nullable=False)  # 'buy' or 'sell'
    shares = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="portfolio_transactions")


class PortfolioCash(Base):
    """User's available cash balance for trading"""
    __tablename__ = "portfolio_cash"

    cash_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    balance = Column(Float, nullable=False, default=100000.0)  # Start with $100k virtual
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="portfolio_cash")


class Watchlist(Base):
    """User's stock watchlist"""
    __tablename__ = "watchlist"

    watchlist_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    stock_symbol = Column(String(32), nullable=False)
    stock_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="watchlist_items")

    __table_args__ = (
        UniqueConstraint('user_id', 'stock_symbol', name='uq_user_watchlist_stock'),
    )
