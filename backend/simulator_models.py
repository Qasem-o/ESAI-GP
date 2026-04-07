from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base

class SimulatorHolding(Base):
    __tablename__ = "simulator_holdings"

    holding_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    stock_symbol = Column(String(32), nullable=False)
    stock_name = Column(String(255), nullable=True)
    shares = Column(Float, nullable=False, default=0)
    avg_price = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        UniqueConstraint('user_id', 'stock_symbol', name='uq_sim_user_stock_holding'),
    )


class SimulatorTransaction(Base):
    __tablename__ = "simulator_transactions"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    stock_symbol = Column(String(32), nullable=False)
    stock_name = Column(String(255), nullable=True)
    transaction_type = Column(String(10), nullable=False)  # 'buy' or 'sell'
    shares = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class SimulatorState(Base):
    """User's available cash balance and total performance for trading"""
    __tablename__ = "simulator_state"

    state_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    balance = Column(Float, nullable=False, default=2000.0)  # Start with $2000 virtual
    starting_balance = Column(Float, nullable=False, default=2000.0)
    is_completed = Column(Integer, default=0) # 0 = playing, 1 = won (reached 10k)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
