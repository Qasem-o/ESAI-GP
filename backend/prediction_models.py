"""
Prediction Models - Stores AI-generated price predictions.

Two row types:
  is_test_set=True  -> 60-day test window (actual vs predicted, for chart & metrics)
  is_test_set=False -> single next-day prediction
"""

from sqlalchemy import (Column, Integer, String, Numeric, DateTime,
                        Date, ForeignKey, Boolean, UniqueConstraint)
from datetime import datetime, timezone
from preparedata import Base


class PricePrediction(Base):
    __tablename__ = "price_predictions"

    prediction_id   = Column(Integer, primary_key=True, autoincrement=True)
    stock_id        = Column(Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"),
                             nullable=False, index=True)
    prediction_date = Column(Date, nullable=False)
    predicted_price = Column(Numeric(20, 6), nullable=False)
    actual_price    = Column(Numeric(20, 6), nullable=True)   # Only for test-set rows
    confidence      = Column(Numeric(5, 2), nullable=True)    # Directional accuracy %
    direction       = Column(String(10), nullable=True)
    change_percent  = Column(Numeric(10, 4), nullable=True)
    model_type      = Column(String(50), default="Hybrid")
    trained_at      = Column(DateTime,
                             default=lambda: datetime.now(timezone.utc),
                             nullable=False)
    is_test_set     = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("stock_id", "prediction_date", name="uq_prediction_stock_date"),
    )
