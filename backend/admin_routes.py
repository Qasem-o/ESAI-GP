"""
Admin Routes - Full-control endpoints for platform administration.
All routes require a valid JWT token AND is_admin=True on the user.
"""

import os
import sys
import subprocess
import threading
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Path fix for imports when running from backend/
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.dirname(current_dir))

from models import User, Base
from community_models import Post, PostComment
from auth_utils import verify_token

# Training state (in-memory for this process)
_training_lock = threading.Lock()
_training_state = {
    "status": "idle",      # idle | running | done | error
    "started_at": None,
    "log": [],
}

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer()

# ─── Shared DB dependency (injected from main.py via app state) ────────────────

def get_db():
    """Overridden by main.py include; here only for type hints."""
    raise NotImplementedError  # pragma: no cover


# ─── Admin Auth Guard ──────────────────────────────────────────────────────────

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id") or payload.get("sub")
    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ─── Pydantic Schemas ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    user_id: int
    username: str
    email: str
    is_active: bool
    is_verified: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class StockOut(BaseModel):
    stock_id: int
    symbol: str
    name: Optional[str] = None
    sector: Optional[str] = None
    current_price: Optional[float] = None

    class Config:
        from_attributes = True


class AddStockRequest(BaseModel):
    symbol: str  # Yahoo Finance ticker (e.g. "AAPL", "2222.SR")


class PostOut(BaseModel):
    post_id: int
    user_id: int
    content: str
    created_at: datetime
    likes_count: int
    comments_count: int

    class Config:
        from_attributes = True


class CommentOut(BaseModel):
    comment_id: int
    post_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionOut(BaseModel):
    symbol: str
    prediction_date: Optional[str]
    predicted_price: Optional[float]
    confidence: Optional[float]
    direction: Optional[str]
    change_percent: Optional[float]
    trained_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdminStatsOut(BaseModel):
    total_users: int
    active_users: int
    total_stocks: int
    total_posts: int
    total_predictions: int


# ─── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStatsOut)
def admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from preparedata import Stock
    from prediction_models import PricePrediction
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_stocks": db.query(Stock).count(),
        "total_posts": db.query(Post).count(),
        "total_predictions": db.query(PricePrediction).count(),
    }


# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(desc(User.created_at)).offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin account")
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.is_admin is not None:
        user.is_admin = body.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}


# ─── Stock Management ─────────────────────────────────────────────────────────

@router.get("/stocks", response_model=List[StockOut])
def list_stocks(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from preparedata import Stock
    return db.query(Stock).order_by(Stock.symbol).all()


@router.post("/stocks", response_model=StockOut)
def add_stock(
    body: AddStockRequest,
    background_tasks: BackgroundTasks,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Add a new stock by ticker symbol.
    1. Creates a placeholder entry in the stocks table.
    2. Triggers a background task to fetch full historical data and indicators.
    """
    from preparedata import Stock

    ticker = body.symbol.strip().upper()
    existing = db.query(Stock).filter(Stock.symbol == ticker).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Stock '{ticker}' already exists")

    new_stock = Stock(symbol=ticker, name=ticker)
    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)

    # Background: fetch historical data + indicators from Yahoo Finance
    background_tasks.add_task(_fetch_stock_data_bg, ticker)

    return new_stock


@router.delete("/stocks/{symbol}")
def delete_stock(
    symbol: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from preparedata import Stock, PriceHistory, TechnicalIndicator
    from prediction_models import PricePrediction

    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # Cascade-delete all related rows
    db.query(PricePrediction).filter(PricePrediction.stock_id == stock.stock_id).delete()
    db.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.stock_id).delete()
    db.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id).delete()
    db.delete(stock)
    db.commit()
    return {"message": f"Stock '{symbol}' and all related data deleted"}


# ─── Community Moderation ─────────────────────────────────────────────────────

@router.get("/community/posts", response_model=List[PostOut])
def list_posts(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(Post).order_by(desc(Post.created_at)).offset(skip).limit(limit).all()


@router.delete("/community/posts/{post_id}")
def delete_post(
    post_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": f"Post {post_id} deleted"}


@router.get("/community/comments", response_model=List[CommentOut])
def list_comments(
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(PostComment).order_by(desc(PostComment.created_at)).offset(skip).limit(limit).all()


@router.delete("/community/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    comment = db.query(PostComment).filter(PostComment.comment_id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": f"Comment {comment_id} deleted"}


# ─── Model Training ───────────────────────────────────────────────────────────

@router.post("/models/train")
def trigger_training(
    admin: User = Depends(get_current_admin),
):
    """
    Triggers local model training for ALL stocks in the database.
    Runs model_training.py as a background subprocess.
    """
    with _training_lock:
        if _training_state["status"] == "running":
            return {"message": "Training is already running", "status": "running"}
        _training_state["status"] = "running"
        _training_state["started_at"] = datetime.utcnow().isoformat()
        _training_state["log"] = ["Training started..."]

    # Run in a separate thread to avoid blocking
    thread = threading.Thread(target=_run_training_subprocess, daemon=True)
    thread.start()
    return {"message": "Training started successfully", "status": "running"}


@router.get("/models/status")
def training_status(admin: User = Depends(get_current_admin)):
    with _training_lock:
        return {
            "status": _training_state["status"],
            "started_at": _training_state["started_at"],
            "log": _training_state["log"][-100:],  # Last 100 lines
        }


@router.get("/models/predictions", response_model=List[PredictionOut])
def list_predictions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from preparedata import Stock
    from prediction_models import PricePrediction

    rows = (
        db.query(PricePrediction, Stock.symbol)
        .join(Stock, PricePrediction.stock_id == Stock.stock_id)
        .order_by(desc(PricePrediction.trained_at))
        .limit(200)
        .all()
    )
    result = []
    for pred, symbol in rows:
        result.append({
            "symbol": symbol,
            "prediction_date": str(pred.prediction_date),
            "predicted_price": float(pred.predicted_price) if pred.predicted_price else None,
            "confidence": float(pred.confidence) if pred.confidence else None,
            "direction": pred.direction,
            "change_percent": float(pred.change_percent) if pred.change_percent else None,
            "trained_at": pred.trained_at,
        })
    return result


# ─── Background Helpers ───────────────────────────────────────────────────────

def _fetch_stock_data_bg(ticker: str):
    """Fetch historical data for a single newly-added stock."""
    try:
        root_dir = os.path.dirname(current_dir)
        sys.path.insert(0, root_dir)
        from preparedata import (
            get_engine_from_env, Base, Stock, PriceHistory, TechnicalIndicator,
            fetch_prices, prepare_and_store, HARDCODED_START
        )
        from datetime import datetime as dt

        engine = get_engine_from_env()
        from sqlalchemy.orm import sessionmaker
        Session = sessionmaker(bind=engine)
        session = Session()

        end = dt.today().strftime("%Y-%m-%d")
        import yfinance as yf
        ticker_obj = yf.Ticker(ticker)
        try:
            info = ticker_obj.info
            stock = session.query(Stock).filter(Stock.symbol == ticker).one_or_none()
            if stock:
                if info.get("shortName"): stock.name = info["shortName"]
                if info.get("sector"):    stock.sector = info["sector"]
                if info.get("longBusinessSummary"): stock.description = info["longBusinessSummary"]
                if info.get("industry"):  stock.industry = info["industry"]
                if info.get("marketCap"): stock.market_cap = info["marketCap"]
                session.commit()
        except Exception as e:
            print(f"⚠️ Metadata fetch error for {ticker}: {e}")

        df = fetch_prices(ticker, HARDCODED_START, end)
        if not df.empty and "close" in df.columns:
            df = df.dropna(subset=["close"]).reset_index(drop=True)
            prepare_and_store(session, ticker, df)

        session.close()
        print(f"✅ Background fetch complete for {ticker}")
    except Exception as e:
        print(f"❌ Background fetch failed for {ticker}: {e}")


def _run_training_subprocess():
    """Run model_training.py and capture output."""
    root_dir = os.path.dirname(current_dir)
    script = os.path.join(root_dir, "model_training.py")
    try:
        proc = subprocess.Popen(
            [sys.executable, script],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='replace',   # replace undecodable bytes instead of crashing
            cwd=root_dir,
        )
        for line in iter(proc.stdout.readline, ""):
            line = line.rstrip()
            with _training_lock:
                _training_state["log"].append(line)

        proc.wait()
        final_status = "done" if proc.returncode == 0 else "error"
        with _training_lock:
            _training_state["status"] = final_status
            _training_state["log"].append(
                f"--- Training {'completed successfully' if final_status == 'done' else 'failed'} ---"
            )
    except Exception as e:
        with _training_lock:
            _training_state["status"] = "error"
            _training_state["log"].append(f"Error: {str(e)}")
