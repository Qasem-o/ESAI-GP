import time
import os
import sys
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

# Add parent directory to path to import preparedata
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

class TTLCache:
    """In-memory cache with Time-To-Live (TTL)."""
    def __init__(self, ttl_seconds=300):
        self.ttl = ttl_seconds
        self.cache = {}

    def get(self, key):
        if key in self.cache:
            val, expire_time = self.cache[key]
            if time.time() < expire_time:
                return val
            else:
                del self.cache[key]
        return None

    def set(self, key, value):
        self.cache[key] = (value, time.time() + self.ttl)

    def clear(self):
        self.cache.clear()

# Global cache for stock prices and metadata
stock_cache = TTLCache(ttl_seconds=300)

def get_stock_data_bulk(db: Session, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Fetches stock details and prices in bulk with fallback logic and caching.
    Uses PostgreSQL window functions to query latest price histories.
    """
    if not symbols:
        return {}

    # Clean and unique symbols
    unique_symbols = list(set(sym.upper().strip() for sym in symbols if sym))
    
    result = {}
    missing_symbols = []

    # Check cache
    for sym in unique_symbols:
        cached = stock_cache.get(sym)
        if cached:
            result[sym] = cached
        else:
            missing_symbols.append(sym)

    if not missing_symbols:
        # Return only the requested symbols from cache
        return {sym: result[sym] for sym in unique_symbols if sym in result}

    try:
        # Fetch stock details in bulk
        stocks = db.query(Stock).filter(Stock.symbol.in_(missing_symbols)).all()
        stocks_map = {s.symbol.upper(): s for s in stocks}
        stock_ids = [s.stock_id for s in stocks]

        # Fetch latest histories in bulk using row_number window function
        histories_by_stock = {}
        if stock_ids:
            subq = db.query(
                PriceHistory.price_history_id,
                PriceHistory.stock_id,
                PriceHistory.close,
                PriceHistory.date,
                func.row_number().over(
                    partition_by=PriceHistory.stock_id,
                    order_by=desc(PriceHistory.date)
                ).label("rn")
            ).filter(PriceHistory.stock_id.in_(stock_ids)).subquery()

            # We need the 2 most recent price records to compute day change
            histories = db.query(subq).filter(subq.c.rn <= 2).all()
            for h in histories:
                histories_by_stock.setdefault(h.stock_id, []).append(h)

        # Process and cache findings
        for sym in missing_symbols:
            stock = stocks_map.get(sym)
            if not stock:
                # If stock not found in DB, cache a default record to prevent constant lookups
                data = {
                    "stock_id": None,
                    "symbol": sym,
                    "name": sym,
                    "sector": None,
                    "current_price_local": 100.0,
                    "latest_close_local": 100.0,
                    "day_change": 0.0
                }
                stock_cache.set(sym, data)
                result[sym] = data
                continue

            h_list = histories_by_stock.get(stock.stock_id, [])
            
            # Calculate day change percentage
            day_change = 0.0
            if len(h_list) >= 2:
                prev_close = float(h_list[1].close)
                curr_close = float(h_list[0].close)
                if prev_close > 0:
                    day_change = round(((curr_close - prev_close) / prev_close) * 100, 2)

            current_price_local = float(stock.current_price) if stock.current_price else None
            latest_close_local = float(h_list[0].close) if h_list else None

            data = {
                "stock_id": stock.stock_id,
                "symbol": stock.symbol.upper(),
                "name": stock.name,
                "sector": stock.sector,
                "current_price_local": current_price_local,
                "latest_close_local": latest_close_local,
                "day_change": day_change
            }
            stock_cache.set(sym, data)
            result[sym] = data

    except Exception as e:
        print(f"Error bulk fetching stock data, falling back: {e}", file=sys.stderr)
        # Fallback to single-symbol queries to ensure service continuity
        for sym in missing_symbols:
            try:
                stock = db.query(Stock).filter(Stock.symbol == sym).first()
                if stock:
                    h_list = db.query(PriceHistory).filter(
                        PriceHistory.stock_id == stock.stock_id
                    ).order_by(desc(PriceHistory.date)).limit(2).all()
                    
                    day_change = 0.0
                    if len(h_list) >= 2:
                        prev_close = float(h_list[1].close)
                        curr_close = float(h_list[0].close)
                        if prev_close > 0:
                            day_change = round(((curr_close - prev_close) / prev_close) * 100, 2)
                            
                    data = {
                        "stock_id": stock.stock_id,
                        "symbol": stock.symbol.upper(),
                        "name": stock.name,
                        "sector": stock.sector,
                        "current_price_local": float(stock.current_price) if stock.current_price else None,
                        "latest_close_local": float(h_list[0].close) if h_list else None,
                        "day_change": day_change
                    }
                else:
                    data = {
                        "stock_id": None,
                        "symbol": sym,
                        "name": sym,
                        "sector": None,
                        "current_price_local": 100.0,
                        "latest_close_local": 100.0,
                        "day_change": 0.0
                    }
                stock_cache.set(sym, data)
                result[sym] = data
            except Exception as inner_e:
                print(f"Fallback failed for {sym}: {inner_e}", file=sys.stderr)

    return {sym: result[sym] for sym in unique_symbols if sym in result}

def get_usd_price(stock_data: dict, rate: float) -> float:
    """Helper to convert cached stock local price to USD using fallbacks."""
    if stock_data.get("current_price_local") and stock_data["current_price_local"] > 0:
        return stock_data["current_price_local"] * rate
    if stock_data.get("latest_close_local") and stock_data["latest_close_local"] > 0:
        return stock_data["latest_close_local"] * rate
    return 100.0 * rate
