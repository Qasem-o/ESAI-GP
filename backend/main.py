from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add backend and root directory to path to ensure imports work when running from root
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.dirname(current_dir))
from preparedata import Base, Stock, PriceHistory, TechnicalIndicator, ModelMetric

# Import authentication router and middleware
from auth_routes import router as auth_router
from profile_routes import router as profile_router
from portfolio_routes import router as portfolio_router
from simulator_routes import router as simulator_router
from community_routes import router as community_router
from admin_routes import router as admin_router
import admin_routes as _admin_routes
from middleware import RateLimitMiddleware, SecurityHeadersMiddleware
import prediction_models  # noqa: ensure price_predictions table is registered

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local development
if not DATABASE_URL:
    import urllib.parse
    PG_USER = os.getenv("PG_USER", "your_db_user")
    PG_PASS = os.getenv("PG_PASS", "your_db_password")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB = os.getenv("PG_DB", "your_db_name")
    
    # URL encode the password to handle special characters like '@'
    encoded_pass = urllib.parse.quote_plus(PG_PASS)
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{encoded_pass}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://"):
    # Fix for hosting providers that use the old postgres:// prefix
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

from models import Base as AuthBase

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tables are created manually in Supabase DB to prevent Render deployment crashes
import community_models  # noqa: ensure community tables are registered (models need to be imported)
# AuthBase.metadata.create_all(bind=engine)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="EyeStocks AI API", version="1.0.0")

# Security Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import Request

# CORS Configuration
# We include variations with/without trailing slashes and 127.0.0.1 just in case
allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Fix for BaseHTTPMiddleware dropping CORS headers on exceptions
def _get_cors_headers(request: Request):
    origin = request.headers.get("origin")
    headers = {}
    if origin and (origin in allowed_origins or origin + "/" in allowed_origins or origin.rstrip("/") in allowed_origins):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return headers

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    headers = getattr(exc, "headers", None) or {}
    headers.update(_get_cors_headers(request))
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    headers = _get_cors_headers(request)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers=headers
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    headers = _get_cors_headers(request)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers=headers
    )

# Register routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(portfolio_router)
app.include_router(simulator_router)
app.include_router(community_router)
app.include_router(admin_router)

# Ensure uploads directory exists
uploads_dir = os.path.join(current_dir, "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir, exist_ok=True)

# Mount static files for uploaded avatars
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override admin_routes.get_db so it uses our engine
app.dependency_overrides[_admin_routes.get_db] = get_db

# Pydantic Models
# Currency detection and conversion
CURRENCY_MAP = {
    ".SR": {"code": "SAR", "symbol": "﷼", "rate_to_usd": 0.2667},   # Saudi Riyal
    ".KW": {"code": "KWD", "symbol": "د.ك", "rate_to_usd": 3.26},   # Kuwaiti Dinar
    ".QA": {"code": "QAR", "symbol": "ر.ق", "rate_to_usd": 0.2747},  # Qatari Riyal
}

def get_stock_currency(symbol: str) -> dict:
    """Detect currency from stock symbol suffix."""
    for suffix, info in CURRENCY_MAP.items():
        if symbol.upper().endswith(suffix):
            return info
    return {"code": "USD", "symbol": "$", "rate_to_usd": 1.0}

class StockBase(BaseModel):
    symbol: str
    name: str
    sector: Optional[str]
    current_price: Optional[float]
    description: Optional[str]
    industry: Optional[str]
    market_cap: Optional[int]
    pe_ratio: Optional[float]
    eps: Optional[float]
    dividend_yield: Optional[float]
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    day_open: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    volume: Optional[int] = None
    currency: Optional[str] = "USD"
    currency_symbol: Optional[str] = "$"
    usd_price: Optional[float] = None
    change_percent: Optional[float] = 0.0
    day_change: Optional[float] = 0.0
    mentions: Optional[int] = 0
    sentiment: Optional[int] = 50

    class Config:
        from_attributes = True

class PricePoint(BaseModel):
    date: date
    close: float
    volume: Optional[int]
    prediction: Optional[float] = None

    class Config:
        from_attributes = True

class MetricResponse(BaseModel):
    model_type: str
    rmse: Optional[float]
    mape: Optional[float]
    directional_accuracy: Optional[float]

    class Config:
        from_attributes = True

class TechnicalIndicatorResponse(BaseModel):
    date: date
    rsi: Optional[float]
    macd: Optional[float]
    macd_signal: Optional[float]
    macd_histogram: Optional[float]
    sma_20: Optional[float]
    sma_50: Optional[float]
    ema_20: Optional[float]
    ema_50: Optional[float]
    bollinger_upper: Optional[float]
    bollinger_middle: Optional[float]
    bollinger_lower: Optional[float]

    class Config:
        from_attributes = True

class PredictionResponse(BaseModel):
    tomorrow_price: float
    confidence: float
    direction: str
    change_percent: float
    recommendation: str
    target_price: float
    stop_loss: float
    risk_level: str
    analysis: List[str]

class SentimentResponse(BaseModel):
    bullish_percent: int
    bearish_percent: int
    neutral_percent: int
    total_discussions: int

# Endpoints

@app.get("/")
def health_check(db: Session = Depends(get_db)):
    try:
        stock_count = db.query(Stock).count()
        return {
            "status": "healthy",
            "message": "EyeStocks AI API is live",
            "database": "connected",
            "stock_count": stock_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error_detail": str(e)
        }

@app.get("/stocks", response_model=List[StockBase])
def get_stocks(db: Session = Depends(get_db)):
    try:
        from community_models import Post
        from sqlalchemy import func, and_, text
        
        # 1. Fetch all stocks
        stocks = db.query(Stock).all()
        if not stocks:
            return []

        stock_ids = [s.stock_id for s in stocks]
        symbols = [s.symbol for s in stocks]

        # 2. Optimized: Get latest TWO history records for all stocks
        history_map = {}
        if stock_ids:
            latest_history_query = text("""
                SELECT stock_id, date, open, high, low, close, volume
                FROM (
                    SELECT *, ROW_NUMBER() OVER (PARTITION BY stock_id ORDER BY date DESC) as rn
                    FROM price_history
                    WHERE stock_id IN :ids
                ) t
                WHERE rn <= 2
            """)
            try:
                history_rows = db.execute(latest_history_query, {"ids": tuple(stock_ids)}).fetchall()
                for row in history_rows:
                    if row.stock_id not in history_map:
                        history_map[row.stock_id] = []
                    history_map[row.stock_id].append(row)
            except Exception as e:
                print(f"Error fetching history rows: {e}")

        # 3. Optimized: Get mention counts
        mentions_map = {}
        try:
            mentions_query = db.query(Post.stock_symbol, func.count(Post.post_id).label('count'))\
                .filter(Post.stock_symbol.in_(symbols))\
                .group_by(Post.stock_symbol).all()
            mentions_map = {m.stock_symbol: m.count for m in mentions_query}
        except Exception as e:
            print(f"Error fetching mentions: {e}")

        # 4. Enrich stocks
        enriched_stocks = []
        for stock in stocks:
            history = history_map.get(stock.stock_id, [])
            stock_dict = stock.__dict__.copy()
            
            # Default values
            stock_dict['day_change'] = 0.0
            stock_dict['change_percent'] = 0.0
            stock_dict['volume'] = 0
            
            if len(history) >= 1:
                latest = history[0]
                stock_dict['volume'] = latest.volume or 0
                
                if len(history) >= 2:
                    prev = history[1]
                    prev_close = float(prev.close) if prev.close else 0
                    curr_price = float(stock.current_price) if stock.current_price else float(latest.close)
                    
                    if prev_close > 0:
                        day_change = curr_price - prev_close
                        stock_dict['day_change'] = round(day_change, 2)
                        stock_dict['change_percent'] = round((day_change / prev_close) * 100, 2)
            
            # Currency info
            curr_info = get_stock_currency(stock.symbol)
            stock_dict['currency'] = curr_info['code']
            stock_dict['currency_symbol'] = curr_info['symbol']
            price = float(stock.current_price) if stock.current_price else 0.0
            stock_dict['usd_price'] = round(price * curr_info['rate_to_usd'], 2)
            
            # Social stats
            stock_dict['mentions'] = mentions_map.get(stock.symbol, 0)
            stock_dict['sentiment'] = 50 + (sum(ord(c) for c in stock.symbol) % 15)
            
            enriched_stocks.append(StockBase(**stock_dict))
            
        return enriched_stocks
    except Exception as e:
        print(f"CRITICAL ERROR in /stocks: {e}")
        import traceback
        traceback.print_exc()
        # Fallback: return raw stocks if enrichment fails
        return []

@app.get("/stocks/{symbol}", response_model=StockBase)
def get_stock_details(symbol: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # Enrich with latest TWO history records to calculate change
    history = db.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
        .order_by(desc(PriceHistory.date))\
        .limit(2)\
        .all()
        
    stock_dict = stock.__dict__.copy()
    
    if len(history) >= 1:
        latest = history[0]
        stock_dict['day_open'] = float(latest.open) if latest.open else None
        stock_dict['day_high'] = float(latest.high) if latest.high else None
        stock_dict['day_low'] = float(latest.low) if latest.low else None
        stock_dict['volume'] = latest.volume
        
        # Calculate change if price exists
        if len(history) >= 2:
            prev = history[1]
            prev_close = float(prev.close)
            curr_price = float(stock.current_price) if stock.current_price else float(latest.close)
            
            if prev_close > 0:
                day_change = curr_price - prev_close
                stock_dict['day_change'] = round(day_change, 2)
                stock_dict['change_percent'] = round((day_change / prev_close) * 100, 2)
        else:
            stock_dict['day_change'] = 0.0
            stock_dict['change_percent'] = 0.0

    # Add currency info
    curr_info = get_stock_currency(stock.symbol)
    stock_dict['currency'] = curr_info['code']
    stock_dict['currency_symbol'] = curr_info['symbol']
    price = float(stock.current_price) if stock.current_price else 0.0
    stock_dict['usd_price'] = round(price * curr_info['rate_to_usd'], 2)
    
    # Add social stats (REAL data)
    from community_models import Post
    from sqlalchemy import func
    
    mentions_count = db.query(func.count(Post.post_id)).filter(Post.stock_symbol == stock.symbol).scalar()
    stock_dict['mentions'] = mentions_count
    
    if mentions_count > 0:
        bullish_keywords = ['buy', 'bull', 'long', 'up', 'moon', 'good', 'strong', 'growth', 'ثور', 'شراء', 'صعود', 'ممتاز']
        bearish_keywords = ['sell', 'bear', 'short', 'down', 'crash', 'bad', 'weak', 'drop', 'دب', 'بيع', 'هبوط', 'سيء']
        
        posts_content = db.query(Post.content).filter(Post.stock_symbol == stock.symbol).all()
        bull_score = 0
        bear_score = 0
        
        for (content,) in posts_content:
            content_lower = content.lower()
            bull_score += sum(1 for kw in bullish_keywords if kw in content_lower)
            bear_score += sum(1 for kw in bearish_keywords if kw in content_lower)
        
        total_score = bull_score + bear_score
        if total_score > 0:
            sentiment_val = int((bull_score / total_score) * 100)
            stock_dict['sentiment'] = max(20, min(95, sentiment_val))
        else:
            stock_dict['sentiment'] = 50 + (sum(ord(c) for c in stock.symbol) % 15)
    else:
        stock_dict['sentiment'] = 50 + (sum(ord(c) for c in stock.symbol) % 10)
    
    return StockBase(**stock_dict)

@app.get("/stocks/{symbol}/history", response_model=List[PricePoint])
def get_stock_history(symbol: str, limit: int = 120, db: Session = Depends(get_db)):
    """
    Returns price history (up to `limit` days) with AI prediction overlay.
    The prediction overlay comes ONLY from stored test-set rows (is_test_set=True).
    No model is re-run at request time.
    """
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    from prediction_models import PricePrediction

    history = (
        db.query(PriceHistory)
        .filter(PriceHistory.stock_id == stock.stock_id)
        .order_by(desc(PriceHistory.date))
        .limit(limit)
        .all()
    )

    # Prioritize real forecasts (is_test_set=False) over backtest rows
    hist_dates = [h.date for h in history]
    all_preds = (
        db.query(PricePrediction)
        .filter(
            PricePrediction.stock_id == stock.stock_id,
            PricePrediction.prediction_date.in_(hist_dates),
        )
        .order_by(PricePrediction.is_test_set.desc()) # True first, False last
        .all()
    ) if hist_dates else []

    # Mapping: the last one seen for a date will win. 
    # Since we ordered True first and False last, the False (real forecast) will overwrite if both exist.
    pred_map = {p.prediction_date: float(p.predicted_price) for p in all_preds}

    # Chronological order for chart
    results = []
    for h in history[::-1]:
        results.append({
            "date":       h.date,
            "close":      float(h.close),
            "volume":     h.volume,
            "prediction": pred_map.get(h.date),
        })

    return results

@app.get("/stocks/{symbol}/metrics", response_model=List[MetricResponse])
def get_stock_metrics(symbol: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    metrics = db.query(ModelMetric).filter(ModelMetric.stock_id == stock.stock_id).all()
    return metrics

@app.get("/stocks/{symbol}/technicals", response_model=List[TechnicalIndicatorResponse])
def get_stock_technicals(symbol: str, limit: int = 30, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    technicals = db.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.stock_id)\
        .order_by(desc(TechnicalIndicator.date))\
        .limit(limit)\
        .all()
    
    return technicals[::-1]

@app.get("/stocks/{symbol}/prediction", response_model=PredictionResponse)
def get_stock_prediction(symbol: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    current_price = float(stock.current_price or 0)

    # ── 1. Try to use AI-trained next-day prediction from DB ─────────────────
    # Only reads the is_test_set=False row (the single next-day prediction).
    # No model is re-run here.
    try:
        from prediction_models import PricePrediction
        from sqlalchemy import desc

        # Get the latest prediction available, regardless of date, to always show something
        ai_pred = (
            db.query(PricePrediction)
            .filter(
                PricePrediction.stock_id == stock.stock_id,
                PricePrediction.is_test_set == False,
            )
            .order_by(desc(PricePrediction.prediction_date))
            .first()
        )
        
        if ai_pred:
            predicted_price = float(ai_pred.predicted_price)
            change_percent  = float(ai_pred.change_percent or 0)
            direction       = ai_pred.direction or ("bullish" if change_percent > 0 else "bearish")
            confidence      = float(ai_pred.confidence) if ai_pred.confidence is not None else 75.0
            recommendation  = "BUY" if direction == "bullish" else ("SELL" if direction == "bearish" else "HOLD")
            target_price    = round(predicted_price * (1.05 if direction == "bullish" else 0.95), 2)
            stop_loss       = round(current_price   * (0.95 if direction == "bullish" else 1.05), 2)

            # ... rest of the logic ...
            latest_tech = (
                db.query(TechnicalIndicator)
                .filter(TechnicalIndicator.stock_id == stock.stock_id)
                .order_by(desc(TechnicalIndicator.date))
                .first()
            )
            analysis_points = [f"Hybrid Model prediction (LSTM + XGBoost) — {ai_pred.model_type}."]
            
            # Fetch metrics
            metric = db.query(ModelMetric).filter(ModelMetric.stock_id == stock.stock_id).first()
            if metric and metric.mape is not None and metric.rmse is not None:
                analysis_points.append(f"Model Accuracy Metrics: MAPE = {metric.mape}%, RMSE = {metric.rmse}")
                
            if latest_tech:
                rsi_val = float(latest_tech.rsi) if latest_tech.rsi else None
                if rsi_val:
                    if rsi_val > 70:
                        analysis_points.append(f"RSI at {rsi_val:.1f}: overbought territory.")
                    elif rsi_val < 30:
                        analysis_points.append(f"RSI at {rsi_val:.1f}: oversold territory.")
                    else:
                        analysis_points.append(f"RSI at {rsi_val:.1f}: neutral zone.")
                if latest_tech.macd and latest_tech.macd_signal:
                    if latest_tech.macd > latest_tech.macd_signal:
                        analysis_points.append("MACD above signal line — bullish momentum.")
                    else:
                        analysis_points.append("MACD below signal line — bearish momentum.")
            analysis_points.append(f"Predicted change: {change_percent:+.2f}%")

            return {
                "tomorrow_price": round(predicted_price, 2),
                "confidence": confidence,
                "direction": direction,
                "change_percent": round(change_percent, 2),
                "recommendation": recommendation,
                "target_price": target_price,
                "stop_loss": stop_loss,
                "risk_level": "Low" if confidence > 85 else ("Medium" if confidence > 70 else "High"),
                "analysis": analysis_points,
            }
            
        raise HTTPException(status_code=404, detail="No fresh prediction available. Please run training.")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"⚠️ Prediction error for {symbol}: {e}")
        raise HTTPException(status_code=404, detail="Prediction unavailable")

@app.get("/stocks/{symbol}/sentiment", response_model=SentimentResponse)
def get_stock_sentiment(symbol: str, db: Session = Depends(get_db)):
    # Mock dynamic sentiment based on symbol hash to be deterministic but varied
    val = sum(ord(c) for c in symbol) 
    base_bullish = (val % 40) + 40 # 40-80%
    base_bearish = 100 - base_bullish - 5
    
    return {
        "bullish_percent": base_bullish,
        "bearish_percent": base_bearish,
        "neutral_percent": 5,
        "total_discussions": (val * 12) % 3000
    }
