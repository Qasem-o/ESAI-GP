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

# Add root directory to path to import from preparedata
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preparedata import Base, Stock, PriceHistory, TechnicalIndicator, ModelMetric

# Import authentication router and middleware
from auth_routes import router as auth_router
from profile_routes import router as profile_router
from portfolio_routes import router as portfolio_router
from simulator_routes import router as simulator_router
from community_routes import router as community_router
from middleware import RateLimitMiddleware, SecurityHeadersMiddleware

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local development
if not DATABASE_URL:
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "123123")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB = os.getenv("PG_DB", "Stocksdata")
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://"):
    # Fix for hosting providers that use the old postgres:// prefix
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

from models import Base as AuthBase

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables for both databases automatically
AuthBase.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Create community tables
import community_models
community_models.Base.metadata.create_all(bind=engine)

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
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://gp-esai.netlify.app",
    "https://gp-esai.netlify.app/",
    "https://esai-backend.onrender.com",
    "https://esai-backend.onrender.com/"
]

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

# Mount static files for uploaded avatars
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

    class Config:
        from_attributes = True

class PricePoint(BaseModel):
    date: date
    close: float
    volume: Optional[int]

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
    stocks = db.query(Stock).all()
    
    # Enrich with latest volume from PriceHistory for each stock
    enriched_stocks = []
    
    for stock in stocks:
        latest_history = db.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
            .order_by(desc(PriceHistory.date))\
            .first()
            
        stock_dict = stock.__dict__.copy()
        if latest_history:
            stock_dict['volume'] = latest_history.volume
        
        # Add currency info
        curr_info = get_stock_currency(stock.symbol)
        stock_dict['currency'] = curr_info['code']
        stock_dict['currency_symbol'] = curr_info['symbol']
        price = float(stock.current_price) if stock.current_price else 0.0
        stock_dict['usd_price'] = round(price * curr_info['rate_to_usd'], 2)
        
        enriched_stocks.append(StockBase(**stock_dict))
        
    return enriched_stocks

@app.get("/stocks/{symbol}", response_model=StockBase)
def get_stock_details(symbol: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    # Enrich with latest price history for OHLV
    latest_history = db.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
        .order_by(desc(PriceHistory.date))\
        .first()
        
    stock_dict = stock.__dict__.copy()
    if latest_history:
        stock_dict['day_open'] = float(latest_history.open) if latest_history.open else None
        stock_dict['day_high'] = float(latest_history.high) if latest_history.high else None
        stock_dict['day_low'] = float(latest_history.low) if latest_history.low else None
        stock_dict['volume'] = latest_history.volume
        
    # Manually construct Pydantic model to mix ORM and extra data
    return StockBase(**stock_dict)

@app.get("/stocks/{symbol}/history", response_model=List[PricePoint])
def get_stock_history(symbol: str, limit: int = 120, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    history = db.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
        .order_by(desc(PriceHistory.date))\
        .limit(limit)\
        .all()
    
    # Reverse to return chronological order for charts
    return history[::-1]

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
    
    # Simple statistical prediction based on recent history
    history = db.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
        .order_by(desc(PriceHistory.date))\
        .limit(30)\
        .all()
        
    if not history or len(history) < 2:
        return {
            "tomorrow_price": float(stock.current_price or 0),
            "confidence": 0,
            "direction": "neutral",
            "change_percent": 0
        }
    
    # Calculate simple momentum
    recent_closes = [float(h.close) for h in history]
    current_price = recent_closes[0]
    avg_change = sum((recent_closes[i] - recent_closes[i+1]) for i in range(len(recent_closes)-1)) / len(recent_closes)
    
    predicted_price = current_price + avg_change
    change_percent = ((predicted_price - current_price) / current_price) * 100
    
    direction = "bullish" if change_percent > 0 else "bearish"
    
    # Fetch metrics for confidence if available
    metric = db.query(ModelMetric).filter(ModelMetric.stock_id == stock.stock_id).first()
    confidence = float(metric.directional_accuracy) if metric else 75.0

    # Auto-generate detailed fields
    recommendation = "BUY" if direction == "bullish" else ("SELL" if direction == "bearish" else "HOLD")
    target_price = round(predicted_price * 1.05 if direction == "bullish" else predicted_price * 0.95, 2)
    stop_loss = round(current_price * 0.95 if direction == "bullish" else current_price * 1.05, 2)
    
    # Generate analysis points based on technicals if available
    latest_tech = db.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.stock_id)\
        .order_by(desc(TechnicalIndicator.date)).first()
        
    analysis_points = []
    if latest_tech:
        if latest_tech.rsi and latest_tech.rsi > 70:
            analysis_points.append(f"RSI is {float(latest_tech.rsi):.1f}, indicating overbought conditions.")
        elif latest_tech.rsi and latest_tech.rsi < 30:
            analysis_points.append(f"RSI is {float(latest_tech.rsi):.1f}, indicating oversold conditions.")
        else:
            analysis_points.append(f"RSI is neutral at {float(latest_tech.rsi or 50):.1f}.")
            
        if latest_tech.macd and latest_tech.macd_signal:
             if latest_tech.macd > latest_tech.macd_signal:
                 analysis_points.append("MACD is above signal line (Bullish momentum).")
             else:
                 analysis_points.append("MACD is below signal line (Bearish momentum).")
    
    if not analysis_points:
        analysis_points = ["Collecting more technical data for deep analysis."]
        
    if abs(change_percent) > 2:
        analysis_points.append(f"Strong momentum detected ({change_percent:+.2f}% predicted).")
    
    
    return {
        "tomorrow_price": round(predicted_price, 2),
        "confidence": confidence,
        "direction": direction,
        "change_percent": round(change_percent, 2),
        "recommendation": recommendation,
        "target_price": target_price,
        "stop_loss": stop_loss,
        "risk_level": "Medium",
        "analysis": analysis_points
    }

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
