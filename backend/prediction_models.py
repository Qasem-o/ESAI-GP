"""
Prediction Models - Stores AI-generated price predictions per stock.
These are populated by the local model_training.py script and served
to the frontend via the /stocks/{symbol}/prediction endpoint.
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from preparedata import Base


class PricePrediction(Base):
    """Stores next-day price predictions produced by local AI training."""
    __tablename__ = "price_predictions"

    prediction_id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_date = Column(Date, nullable=False)          # The date the prediction is FOR (tomorrow)
    predicted_price = Column(Numeric(20, 6), nullable=False)
    confidence = Column(Numeric(5, 2), nullable=True)        # e.g. 87.50 (%)
    direction = Column(String(10), nullable=True)             # 'bullish' / 'bearish' / 'neutral'
    change_percent = Column(Numeric(10, 4), nullable=True)
    model_type = Column(String(50), default="Hybrid")
    trained_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("stock_id", "prediction_date", name="uq_prediction_stock_date"),
    )
