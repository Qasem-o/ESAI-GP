"""
Admin Routes - Full-control endpoints for platform administration.
All routes require a valid JWT token AND is_admin=True on the user.
"""

import os
import sys
import subprocess
import threading
from datetime import datetime, timezone
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

from models import User, Base, AdminNotification
from community_models import Post, PostComment
from auth_utils import verify_token
from datetime import timedelta

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
    full_name: Optional[str] = None
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
    
    # Auto-generate market notifications when admin checks stats
    generate_market_notifications(db)
    
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_stocks": db.query(Stock).count(),
        "total_posts": db.query(Post).count(),
        "total_predictions": db.query(PricePrediction).count(),
    }


def generate_market_notifications(db: Session):
    """Checks current time vs market closing times and generates admin alerts."""
    now = datetime.now(timezone.utc)
    ast_now = now + timedelta(hours=3)
    s_day = ast_now.weekday() 
    s_time = ast_now.hour * 100 + ast_now.minute
    today_str = ast_now.strftime("%Y-%m-%d")

    markets = [
        {"id": "SA", "name": "Saudi Market", "days": [6, 0, 1, 2, 3], "close": 1500},
        {"id": "US", "name": "US Market", "days": [0, 1, 2, 3, 4], "close": 2300},
        {"id": "KW", "name": "Kuwait Market", "days": [6, 0, 1, 2, 3], "close": 1230},
        {"id": "QA", "name": "Qatar Market", "days": [6, 0, 1, 2, 3], "close": 1315},
    ]

    for m in markets:
        # If it's a trading day and it's past closing time
        if s_day in m["days"] and s_time >= m["close"]:
            # Check if we already notified for this today
            tag = f"{m['id']}_{today_str}"
            exists = db.query(AdminNotification).filter(AdminNotification.market == tag).first()
            if not exists:
                notif = AdminNotification(
                    title=f"Market Closed: {m['name']}",
                    message=f"The {m['name']} has closed for today ({today_str}). Please run 'Fill Missing Data' to fetch the latest prices and update charts.",
                    market=tag
                )
                db.add(notif)
                db.commit()


@router.get("/notifications", response_model=List[dict])
def get_admin_notifications(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    notifs = db.query(AdminNotification).order_by(desc(AdminNotification.created_at)).limit(50).all()
    return [{
        "id": n.notification_id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at
    } for n in notifs]


@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    n = db.query(AdminNotification).filter(AdminNotification.notification_id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"status": "ok"}


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
    db: Session = Depends(get_db),
):
    """
    Smart training: only trains stocks not yet trained today.
    If all stocks were trained today, does nothing.
    """
    with _training_lock:
        if _training_state["status"] == "running":
            return {"message": "Training is already running", "status": "running"}
        _training_state["status"] = "running"
        _training_state["started_at"] = datetime.now(timezone.utc).isoformat()
        _training_state["log"] = ["Training started..."]

    thread = threading.Thread(
        target=_run_training_subprocess,
        kwargs={"skip_trained_today": True},
        daemon=True
    )
    thread.start()
    return {"message": "Smart training started (skips already-trained today)", "status": "running"}


@router.post("/models/train-all")
def trigger_training_all(
    admin: User = Depends(get_current_admin),
):
    """Force-retrain ALL stocks regardless of training date."""
    with _training_lock:
        if _training_state["status"] == "running":
            return {"message": "Training is already running", "status": "running"}
        _training_state["status"] = "running"
        _training_state["started_at"] = datetime.now(timezone.utc).isoformat()
        _training_state["log"] = ["Full retraining started..."]

    thread = threading.Thread(
        target=_run_training_subprocess,
        kwargs={"skip_trained_today": False},
        daemon=True
    )
    thread.start()
    return {"message": "Full training started", "status": "running"}


@router.get("/models/status")
def training_status(admin: User = Depends(get_current_admin)):
    with _training_lock:
        return {
            "status": _training_state["status"],
            "started_at": _training_state["started_at"],
            "log": _training_state["log"][-100:],  # Last 100 lines
        }


@router.post("/stocks/fill-missing")
def fill_missing_data(
    admin: User = Depends(get_current_admin),
):
    """
    For every stock in the DB, fetch only the missing price/indicator rows
    (from last stored date to today). Fast incremental update.
    """
    with _training_lock:
        if _training_state["status"] == "running":
            return {"message": "A training job is running. Wait until it finishes.", "status": "running"}
        _training_state["status"] = "running"
        _training_state["started_at"] = datetime.now(timezone.utc).isoformat()
        _training_state["log"] = ["Fill-missing data job started..."]

    thread = threading.Thread(target=_fill_missing_bg, daemon=True)
    thread.start()
    return {"message": "Fill-missing job started", "status": "running"}


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
        .filter(PricePrediction.is_test_set == False)
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


def _fill_missing_bg():
    """Fetch only missing price/indicator rows for every stock in the DB."""
    try:
        root_dir = os.path.dirname(current_dir)
        sys.path.insert(0, root_dir)
        from preparedata import (
            get_engine_from_env, Stock, PriceHistory, TechnicalIndicator,
            fetch_prices, prepare_and_store
        )
        from datetime import datetime as dt, timedelta
        import yfinance as yf

        engine = get_engine_from_env()
        from sqlalchemy.orm import sessionmaker
        DBSession = sessionmaker(bind=engine)
        session = DBSession()

        stocks = session.query(Stock).order_by(Stock.symbol).all()
        with _training_lock:
            _training_state["log"].append(f"[INFO] {len(stocks)} stocks to check")

        for stock in stocks:
            ticker = stock.symbol
            # Find latest stored date for this stock
            latest_row = (
                session.query(PriceHistory)
                .filter(PriceHistory.stock_id == stock.stock_id)
                .order_by(PriceHistory.date.desc())
                .first()
            )
            # Check latest history row
            latest_row = session.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
                .order_by(desc(PriceHistory.date)).first()
            
            # Check latest technical indicators row
            latest_tech = session.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.stock_id)\
                .order_by(desc(TechnicalIndicator.date)).first()

            today_utc = datetime.now(timezone.utc).date()
            
            # Smart Skip: 
            # Only skip if we already have today's data (UTC)
            is_recent = latest_row and latest_row.date >= today_utc and latest_row.close is not None
            # 2. Indicators must not be NULL
            has_valid_tech = latest_tech and latest_tech.rsi is not None
            
            if is_recent and has_valid_tech:
                with _training_lock:
                    _training_state["log"].append(f"[SKIP]  {ticker} — already up to date")
                continue

            if latest_row:
                # Refresh from 3 days ago to ensure overlap and fix any N/A
                refresh_start = (latest_row.date - timedelta(days=3))
                context_start = (refresh_start - timedelta(days=60)).strftime("%Y-%m-%d")
                start_date = context_start
                actual_update_from = refresh_start.strftime("%Y-%m-%d")
            else:
                start_date = "2018-01-01"
                actual_update_from = start_date

            end_date = (today_utc + timedelta(days=1)).strftime("%Y-%m-%d")
            with _training_lock:
                _training_state["log"].append(
                    f"[FETCH] {ticker} from {actual_update_from} to fix any gaps/indicators"
                )

            try:
                df = fetch_prices(ticker, start_date, end_date)
                if df.empty or "close" not in df.columns:
                    with _training_lock:
                        _training_state["log"].append(f"[WARN]  {ticker} — no data returned")
                    continue
                
                df = df.dropna(subset=["close"]).reset_index(drop=True)
                prepare_and_store(session, ticker, df, store_from=actual_update_from)
                
                with _training_lock:
                    _training_state["log"].append(
                        f"[OK]    {ticker} — updated from {actual_update_from}"
                    )
            except Exception as e:
                with _training_lock:
                    _training_state["log"].append(f"[ERROR] {ticker}: {e}")

        session.close()
        with _training_lock:
            _training_state["status"] = "done"
            _training_state["log"].append("--- Fill-missing job completed ---")
    except Exception as e:
        with _training_lock:
            _training_state["status"] = "error"
            _training_state["log"].append(f"[FATAL] Fill-missing job failed: {e}")


def _run_training_subprocess(skip_trained_today: bool = True, symbols: list = None,
                              workers: int = 4):
    """
    Run model_training.py as a subprocess.
    - LSTM is trained weekly (auto-detected inside the script).
    - XGBoost runs in parallel using ProcessPoolExecutor (--workers).
    """
    root_dir = os.path.dirname(current_dir)
    script   = os.path.join(root_dir, "model_training.py")
    cmd = [sys.executable, script, "--workers", str(workers)]
    if skip_trained_today:
        cmd.append("--skip-trained-today")
    if symbols:
        cmd += ["--symbols"] + symbols
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
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
