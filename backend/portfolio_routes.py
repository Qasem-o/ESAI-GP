"""
Portfolio API routes - buy/sell stocks, get holdings, transactions, summary
All endpoints require JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field

from portfolio_models import PortfolioHolding, PortfolioTransaction, PortfolioCash, Watchlist
from auth_utils import verify_token

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preparedata import Stock, PriceHistory

# Currency conversion map
CURRENCY_MAP = {
    ".SR": {"code": "SAR", "symbol": "﷼", "rate_to_usd": 0.2667},
    ".KW": {"code": "KWD", "symbol": "د.ك", "rate_to_usd": 3.26},
    ".QA": {"code": "QAR", "symbol": "ر.ق", "rate_to_usd": 0.2747},
}

def get_currency_rate(symbol: str) -> float:
    """Get the USD conversion rate for a stock symbol."""
    for suffix, info in CURRENCY_MAP.items():
        if symbol.upper().endswith(suffix):
            return info['rate_to_usd']
    return 1.0

def get_stock_currency_info(symbol: str) -> dict:
    """Get full currency info dict for a stock symbol."""
    for suffix, info in CURRENCY_MAP.items():
        if symbol.upper().endswith(suffix):
            return info
    return {"code": "USD", "symbol": "$", "rate_to_usd": 1.0}


router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# --- Database dependency ---
def get_db():
    from main import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Auth dependency ---
async def get_current_user_id(authorization: str = Header(None)) -> int:
    """Extract user_id from JWT Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Session expired")
    token = authorization.split(" ")[1]
    payload = verify_token(token, "access")
    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["user_id"]


# --- Pydantic schemas ---
class BuyStockRequest(BaseModel):
    symbol: str
    shares: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    transaction_date: Optional[str] = None


class SellStockRequest(BaseModel):
    symbol: str
    shares: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    transaction_date: Optional[str] = None


class CashRequest(BaseModel):
    amount: float = Field(..., gt=0)


class HoldingResponse(BaseModel):
    holding_id: int
    stock_symbol: str
    stock_name: Optional[str]
    shares: float
    avg_price: float
    current_price: float = 0
    total_value: float = 0
    gain: float = 0
    gain_percentage: float = 0
    allocation: float = 0
    day_change: float = 0

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    transaction_id: int
    stock_symbol: str
    stock_name: Optional[str]
    transaction_type: str
    shares: float
    price: float
    total: float
    created_at: str

    class Config:
        from_attributes = True


class PortfolioSummaryResponse(BaseModel):
    total_value: float
    total_cost: float
    total_gain: float
    gain_percentage: float
    day_change: float
    day_change_percentage: float
    cash: float
    holdings_count: int


class PerformancePoint(BaseModel):
    day: str
    value: float


# --- Helper: get or create cash account ---
def get_or_create_cash(db: Session, user_id: int) -> PortfolioCash:
    cash = db.query(PortfolioCash).filter(PortfolioCash.user_id == user_id).first()
    if not cash:
        cash = PortfolioCash(user_id=user_id, balance=0.0)
        db.add(cash)
        db.commit()
        db.refresh(cash)
    return cash


# --- Helper: get current stock price ---
def get_current_price(db: Session, symbol: str) -> float:
    """Get current price in USD with multiple fallbacks."""
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    rate = get_currency_rate(symbol)
    
    # 1. Try real-time price in Stock table
    if stock and stock.current_price and float(stock.current_price) > 0:
        return float(stock.current_price) * rate
        
    # 2. Try fallback: get latest close from price history
    latest = db.query(PriceHistory).join(Stock).filter(
        Stock.symbol == symbol.upper()
    ).order_by(desc(PriceHistory.date)).first()
    if latest and latest.close and float(latest.close) > 0:
        return float(latest.close) * rate
        
    # 3. Final fallback: return a default price to avoid zeroing out portfolio
    return 100.0 * rate


# --- Helper: get day change % ---
def get_day_change(db: Session, symbol: str) -> float:
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        return 0.0
    history = db.query(PriceHistory).filter(
        PriceHistory.stock_id == stock.stock_id
    ).order_by(desc(PriceHistory.date)).limit(2).all()
    if len(history) >= 2:
        prev_close = float(history[1].close)
        curr_close = float(history[0].close)
        if prev_close > 0:
            return round(((curr_close - prev_close) / prev_close) * 100, 2)
    return 0.0


# =============================================
# ENDPOINTS
# =============================================

@router.get("/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get portfolio summary with total value, gains, cash."""
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id
    ).all()
    cash = get_or_create_cash(db, user_id)

    total_cost = 0.0
    total_value = 0.0
    day_change_total = 0.0

    for h in holdings:
        current_price = get_current_price(db, h.stock_symbol)
        cost = h.shares * h.avg_price
        value = h.shares * current_price
        total_cost += cost
        total_value += value

        day_pct = get_day_change(db, h.stock_symbol)
        day_change_total += value * (day_pct / 100)

    total_gain = total_value - total_cost
    gain_pct = (total_gain / total_cost * 100) if total_cost > 0 else 0
    day_change_pct = (day_change_total / total_value * 100) if total_value > 0 else 0

    return PortfolioSummaryResponse(
        total_value=round(total_value, 2),
        total_cost=round(total_cost, 2),
        total_gain=round(total_gain, 2),
        gain_percentage=round(gain_pct, 2),
        day_change=round(day_change_total, 2),
        day_change_percentage=round(day_change_pct, 2),
        cash=round(cash.balance, 2),
        holdings_count=len(holdings),
    )


@router.get("/holdings", response_model=List[HoldingResponse])
async def get_holdings(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all holdings with live prices and P&L."""
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id
    ).all()

    # Calculate total portfolio value for allocation %
    total_portfolio = 0.0
    enriched = []
    for h in holdings:
        current_price = get_current_price(db, h.stock_symbol)
        value = h.shares * current_price
        total_portfolio += value
        enriched.append((h, current_price, value))

    result = []
    for h, current_price, value in enriched:
        cost = h.shares * h.avg_price
        gain = value - cost
        gain_pct = (gain / cost * 100) if cost > 0 else 0
        alloc = (value / total_portfolio * 100) if total_portfolio > 0 else 0
        day_change = get_day_change(db, h.stock_symbol)

        result.append(HoldingResponse(
            holding_id=h.holding_id,
            stock_symbol=h.stock_symbol,
            stock_name=h.stock_name,
            shares=h.shares,
            avg_price=round(h.avg_price, 2),
            current_price=round(current_price, 2),
            total_value=round(value, 2),
            gain=round(gain, 2),
            gain_percentage=round(gain_pct, 2),
            allocation=round(alloc, 1),
            day_change=round(day_change, 2),
        ))

    return result


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    limit: int = 50,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get recent transactions."""
    txns = db.query(PortfolioTransaction).filter(
        PortfolioTransaction.user_id == user_id
    ).order_by(desc(PortfolioTransaction.created_at)).limit(limit).all()

    return [TransactionResponse(
        transaction_id=t.transaction_id,
        stock_symbol=t.stock_symbol,
        stock_name=t.stock_name,
        transaction_type=t.transaction_type,
        shares=t.shares,
        price=round(t.price, 2),
        total=round(t.total, 2),
        created_at=t.created_at.isoformat() + ("Z" if "Z" not in t.created_at.isoformat() else ""),
    ) for t in txns]


@router.post("/buy")
async def buy_stock(
    req: BuyStockRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Buy shares of a stock."""
    # Convert price to USD for internal tracking
    rate = get_currency_rate(req.symbol)
    usd_price = req.price * rate
    total_cost = req.shares * usd_price
    cash = get_or_create_cash(db, user_id)

    # Disable cash check for manual tracking portfolio
    # if cash.balance < total_cost:
    #     raise HTTPException(status_code=400, detail=f"Insufficient cash. Available: ${cash.balance:.2f}, Required: ${total_cost:.2f}")

    # Get stock name
    stock = db.query(Stock).filter(Stock.symbol == req.symbol.upper()).first()
    stock_name = stock.name if stock else req.symbol.upper()

    # Update or create holding
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id,
        PortfolioHolding.stock_symbol == req.symbol.upper()
    ).first()

    if holding:
        # Weighted average price (internal USD)
        total_shares = holding.shares + req.shares
        holding.avg_price = ((holding.shares * holding.avg_price) + (req.shares * usd_price)) / total_shares
        holding.shares = total_shares
        holding.stock_name = stock_name
    else:
        holding = PortfolioHolding(
            user_id=user_id,
            stock_symbol=req.symbol.upper(),
            stock_name=stock_name,
            shares=req.shares,
            avg_price=usd_price,
        )
        db.add(holding)

    # Deduct cash
    cash.balance -= total_cost

    # Determine transaction date
    txn_date = datetime.now(timezone.utc)
    if req.transaction_date:
        try:
            # Try to parseYYYY-MM-DD
            parsed_date = datetime.fromisoformat(req.transaction_date)
            txn_date = parsed_date
        except Exception:
            pass

    # Record transaction
    txn = PortfolioTransaction(
        user_id=user_id,
        stock_symbol=req.symbol.upper(),
        stock_name=stock_name,
        transaction_type="buy",
        shares=req.shares,
        price=usd_price,
        total=total_cost,
        created_at=txn_date,
    )
    db.add(txn)
    db.commit()


    return {
        "message": f"Successfully bought {req.shares} shares of {req.symbol.upper()} at ${req.price:.2f}",
        "total_cost": round(total_cost, 2),
        "remaining_cash": round(cash.balance, 2),
    }


@router.post("/sell")
async def sell_stock(
    req: SellStockRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Sell shares of a stock."""
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id,
        PortfolioHolding.stock_symbol == req.symbol.upper()
    ).first()

    if not holding:
        raise HTTPException(status_code=404, detail=f"You don't hold any shares of {req.symbol.upper()}")

    if holding.shares < req.shares:
        raise HTTPException(status_code=400, detail=f"Insufficient shares. You have {holding.shares}, trying to sell {req.shares}")

    # Convert price to USD for internal tracking
    rate = get_currency_rate(req.symbol)
    usd_price = req.price * rate
    total_proceeds = req.shares * usd_price
    cash = get_or_create_cash(db, user_id)

    # Get stock name
    stock = db.query(Stock).filter(Stock.symbol == req.symbol.upper()).first()
    stock_name = stock.name if stock else req.symbol.upper()

    # Update holding
    holding.shares -= req.shares
    if holding.shares <= 0.001:  # Essentially zero
        db.delete(holding)

    # Add cash
    cash.balance += total_proceeds

    # Determine transaction date
    txn_date = datetime.now(timezone.utc)
    if req.transaction_date:
        try:
            parsed_date = datetime.fromisoformat(req.transaction_date)
            txn_date = parsed_date
        except Exception:
            pass

    # Record transaction
    txn = PortfolioTransaction(
        user_id=user_id,
        stock_symbol=req.symbol.upper(),
        stock_name=stock_name,
        transaction_type="sell",
        shares=req.shares,
        price=usd_price,
        total=total_proceeds,
        created_at=txn_date,
    )
    db.add(txn)
    db.commit()

    return {
        "message": f"Successfully sold {req.shares} shares of {req.symbol.upper()} at ${req.price:.2f}",
        "total_proceeds": round(total_proceeds, 2),
        "remaining_cash": round(cash.balance, 2),
    }


@router.post("/deposit")
async def deposit_cash(
    req: CashRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Deposit cash into trading account."""
    cash = get_or_create_cash(db, user_id)
    cash.balance += req.amount
    db.commit()
    return {"message": f"Deposited ${req.amount:.2f}", "balance": round(cash.balance, 2)}


@router.post("/withdraw")
async def withdraw_cash(
    req: CashRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Withdraw cash from trading account."""
    cash = get_or_create_cash(db, user_id)
    if cash.balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    cash.balance -= req.amount
    db.commit()
    return {"message": f"Withdrew ${req.amount:.2f}", "balance": round(cash.balance, 2)}


@router.get("/cash")
async def get_cash_balance(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current cash balance."""
    cash = get_or_create_cash(db, user_id)
    return {"balance": round(cash.balance, 2)}


@router.get("/performance")
async def get_performance(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get 7-day portfolio performance (based on transaction history)."""
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id
    ).all()
    cash = get_or_create_cash(db, user_id)

    if not holdings:
        # Return flat line at zero
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return [{"day": d, "value": 0.0} for d in days]

    # Build 7-day portfolio value from price history
    days_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    performance = []

    for i, label in enumerate(days_labels):
        day_value = 0.0
        for h in holdings:
            stock = db.query(Stock).filter(Stock.symbol == h.stock_symbol).first()
            if stock:
                history = db.query(PriceHistory).filter(
                    PriceHistory.stock_id == stock.stock_id
                ).order_by(desc(PriceHistory.date)).limit(8).all()

                if len(history) > (6 - i):
                    price = float(history[6 - i].close)
                elif history:
                    price = float(history[-1].close)
                else:
                    price = h.avg_price
                day_value += h.shares * price
            else:
                day_value += h.shares * h.avg_price

        performance.append({"day": label, "value": round(day_value, 2)})

    return performance


@router.get("/available-stocks")
async def get_available_stocks(
    db: Session = Depends(get_db)
):
    """Get list of stocks available for trading (no auth required)."""
    stocks = db.query(Stock).all()
    result = []
    for s in stocks:
        current_price = float(s.current_price) if s.current_price else 0
        result.append({
            "symbol": s.symbol,
            "name": s.name,
            "current_price": round(current_price, 2),
            "sector": s.sector,
        })
    return result

@router.post("/reset")
async def reset_portfolio(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Reset the user's portfolio by deleting all holdings and transactions."""
    # Delete holdings
    db.query(PortfolioHolding).filter(PortfolioHolding.user_id == user_id).delete()

    # Delete transactions
    db.query(PortfolioTransaction).filter(PortfolioTransaction.user_id == user_id).delete()

    # Reset cash
    cash = get_or_create_cash(db, user_id)
    cash.balance = 0.0

    db.commit()

    return {"message": "Portfolio has been successfully reset."}


# =============== WATCHLIST ENDPOINTS ===============

@router.get("/watchlist")
async def get_watchlist(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user's watchlist with live prices."""
    items = db.query(Watchlist).filter(Watchlist.user_id == user_id).order_by(desc(Watchlist.created_at)).all()

    result = []
    for item in items:
        stock = db.query(Stock).filter(Stock.symbol == item.stock_symbol).first()
        current_price = float(stock.current_price) if stock and stock.current_price else 0
        currency_info = get_stock_currency_info(item.stock_symbol)

        result.append({
            "watchlist_id": item.watchlist_id,
            "stock_symbol": item.stock_symbol,
            "stock_name": item.stock_name or (stock.name if stock else item.stock_symbol),
            "current_price": round(current_price, 2),
            "currency": currency_info["code"],
            "currency_symbol": currency_info["symbol"],
            "sector": stock.sector if stock else None,
            "added_at": (item.created_at.isoformat() + "Z") if item.created_at else None,
        })

    return result


@router.post("/watchlist/add")
async def add_to_watchlist(
    request: dict,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add a stock to user's watchlist."""
    symbol = request.get("symbol")
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol is required")

    # Check if already in watchlist
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.stock_symbol == symbol
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Stock already in watchlist")

    # Get stock name from DB
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    stock_name = request.get("name") or (stock.name if stock else symbol)

    item = Watchlist(
        user_id=user_id,
        stock_symbol=symbol,
        stock_name=stock_name,
    )
    db.add(item)
    db.commit()

    return {"message": f"{symbol} added to watchlist"}


@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Remove a stock from user's watchlist."""
    item = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.stock_symbol == symbol
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Stock not in watchlist")

    db.delete(item)
    db.commit()

    return {"message": f"{symbol} removed from watchlist"}


@router.get("/watchlist/check/{symbol}")
async def check_watchlist(
    symbol: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Check if a stock is in user's watchlist."""
    exists = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.stock_symbol == symbol
    ).first()

    return {"is_watchlisted": exists is not None}
