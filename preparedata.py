#!/usr/bin/env python3
"""
fetch_store.py
- Download stock history from Yahoo Finance (yfinance)
- Clean/preprocess
- Compute technical indicators (SMA, EMA, RSI, MACD, Bollinger)
- Store into database following provided ER schema (PriceHistory, TechnicalIndicator, Stock)
Usage:
  # The script now uses internal hardcoded values and does not require command-line arguments.
  # python fetch_store.py
"""

import argparse
import decimal
from datetime import datetime
import os
from dotenv import load_dotenv

import pandas as pd
import yfinance as yf
from sqlalchemy import (Column, Date, DateTime, Enum, ForeignKey, Integer,
                        Numeric, String, Text, BigInteger, create_engine,
                        UniqueConstraint, desc)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker

# ---------------------------
# Config / DB setup (MODIFIED TO USE HARDCODED VALUES)
# ---------------------------

# Load environment variables from backend/.env if it exists, otherwise from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))
load_dotenv()

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")
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
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Hardcoded Tickers and Dates
HARDCODED_TICKERS = [
    "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "TSLA", "META", "NFLX", "AMD", "INTC", 
    "BRK-B", "JPM", "KO", "PEP", "V",
    # Saudi Stocks
    "2222.SR", "1120.SR", "2010.SR", "7010.SR", "1180.SR", "1150.SR", "2082.SR", "1211.SR", "2280.SR",
    # New Saudi Stocks
    "1010.SR", "5110.SR", "4280.SR", "4030.SR",
    # Regional Stocks
    "KFH.KW", "IQCD.QA" # Removed COMI.CA, FAB.AD, EMAAR.DU
]
HARDCODED_START = "2018-01-01"
HARDCODED_END = (datetime.today() + pd.Timedelta(days=1)).strftime("%Y-%m-%d")

# DATABASE_URL = "sqlite:///eyestock.db" # Use this for SQLite

def get_engine_from_env():
    """Returns a SQLAlchemy engine using the same DATABASE_URL logic above."""
    return create_engine(DATABASE_URL, echo=False)

Base = declarative_base()

# ---------------------------
# ORM models (No changes needed)
# ---------------------------
class Stock(Base):
    __tablename__ = "stocks"
    stock_id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(32), unique=True, nullable=False)
    name = Column(String(255))
    sector = Column(String(255))
    current_price = Column(Numeric(20,6))
    description = Column(Text)
    industry = Column(String(255))
    market_cap = Column(BigInteger)
    pe_ratio = Column(Numeric(10,2))
    eps = Column(Numeric(10,2))
    dividend_yield = Column(Numeric(10,4))
    fifty_two_week_high = Column(Numeric(20,6))
    fifty_two_week_low = Column(Numeric(20,6))

class PriceHistory(Base):
    __tablename__ = "price_history"
    price_history_id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    open = Column(Numeric(20,6))
    high = Column(Numeric(20,6))
    low = Column(Numeric(20,6))
    close = Column(Numeric(20,6))
    volume = Column(BigInteger)
    __table_args__ = (UniqueConstraint('stock_id','date', name='u_stock_date'),)

class TechnicalIndicator(Base):
    __tablename__ = "technical_indicator"
    indicator_id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    rsi = Column(Numeric(10,4))
    macd = Column(Numeric(20,6))
    macd_signal = Column(Numeric(20,6))
    macd_histogram = Column(Numeric(20,6))
    sma_20 = Column(Numeric(20,6))
    sma_50 = Column(Numeric(20,6))
    ema_20 = Column(Numeric(20,6))
    ema_50 = Column(Numeric(20,6))
    bollinger_upper = Column(Numeric(20,6))
    bollinger_middle = Column(Numeric(20,6))
    bollinger_lower = Column(Numeric(20,6))
    __table_args__ = (UniqueConstraint('stock_id','date', name='u_indicator_stock_date'),)

class ModelMetric(Base):
    __tablename__ = "model_metrics"
    metric_id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id"), nullable=False, index=True)
    model_type = Column(String(50), nullable=False) # e.g. 'LSTM', 'XGBoost', 'Hybrid'
    rmse = Column(Numeric(10, 4))
    mape = Column(Numeric(10, 4))
    directional_accuracy = Column(Numeric(5, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint('stock_id', 'model_type', name='u_metric_stock_type'),)

# ---------------------------
# Helpers: indicators (pure pandas) (No changes needed)
# ---------------------------
def compute_sma(series: pd.Series, window: int):
    return series.rolling(window=window, min_periods=1).mean()

def compute_ema(series: pd.Series, span: int):
    return series.ewm(span=span, adjust=False).mean()

def compute_rsi(series: pd.Series, period: int = 14):
    if len(series) < period: return pd.Series(index=series.index, data=None)
    delta = series.diff()
    gain = delta.clip(lower=0).fillna(0)
    loss = -1 * delta.clip(upper=0).fillna(0)
    
    # Use EWM for smoother RSI (Standard)
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    
    rs = avg_gain / (avg_loss.replace(0, 1e-10))
    rsi = 100 - (100 / (1 + rs))
    return rsi

def compute_macd(series: pd.Series, span_short=12, span_long=26, span_signal=9):
    if len(series) < span_long:
        return pd.Series(0, index=series.index), pd.Series(0, index=series.index), pd.Series(0, index=series.index)
    ema_short = series.ewm(span=span_short, adjust=False).mean()
    ema_long = series.ewm(span=span_long, adjust=False).mean()
    macd = ema_short - ema_long
    signal = macd.ewm(span=span_signal, adjust=False).mean()
    hist = macd - signal
    return macd, signal, hist

def compute_bollinger(series: pd.Series, window=20, n_std=2):
    sma = compute_sma(series, window)
    rolling_std = series.rolling(window=window, min_periods=1).std()
    upper = sma + (rolling_std * n_std)
    lower = sma - (rolling_std * n_std)
    return upper, sma, lower

def to_dec(x):
    if pd.isna(x): return None
    try:
        return decimal.Decimal(str(round(float(x), 6)))
    except:
        return None

# ---------------------------
# Core pipeline
# ---------------------------
def fetch_prices(ticker, start, end, interval="1d"):
    """
    Fetch historical prices from yfinance. 
    NOTE: 'end' date is exclusive in yfinance, so we should pass today+1 to include today.
    """
    df = yf.download(ticker, start=start, end=end, interval=interval, auto_adjust=False, progress=False)
    if df.empty:
        return df
    
    # 1. Ensure index is Date and add Date column
    df = df.reset_index()

    # Handle MultiIndex columns (for single ticker, yfinance returns MultiIndex)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.droplevel(1)

    # 2. DEFENSIVE CHECK: Ensure the required columns exist.
    # Some stocks might not have 'Adj Close' or it might be renamed.
    if 'Adj Close' not in df.columns and 'Close' in df.columns:
        df['Adj Close'] = df['Close']
    
    required_cols = ['Date','Open','High','Low','Close','Adj Close','Volume']
    
    # 3. Handle NaN in the last row (common for current day data in yfinance)
    if not df.empty:
        last_idx = df.index[-1]
        if pd.isna(df.loc[last_idx, 'Close']):
            try:
                t_obj = yf.Ticker(ticker)
                live_price = t_obj.info.get('currentPrice') or t_obj.info.get('regularMarketPrice')
                if live_price:
                    df.loc[last_idx, 'Close'] = live_price
                    df.loc[last_idx, 'Adj Close'] = live_price
                    for col in ['Open', 'High', 'Low']:
                        if pd.isna(df.loc[last_idx, col]):
                            df.loc[last_idx, col] = live_price
            except Exception as e:
                print(f"⚠️ Could not fetch live price for {ticker}: {e}")

    missing_cols = [col for col in required_cols if col not in df.columns]

    if missing_cols:
        print(f"⚠️ Warning: Missing columns for {ticker}. Missing: {missing_cols}. Columns received: {list(df.columns)}")
        # If essential columns are missing, return empty
        if 'Close' not in df.columns:
            return pd.DataFrame()
            
    # 3. Keep only available required cols and rename to lowercase
    available_cols = [col for col in required_cols if col in df.columns]
    df = df[available_cols].rename(columns={
        'Date':'date',
        'Open':'open',
        'High':'high', 
        'Low':'low',
        'Close':'close',
        'Adj Close':'adj_close',
        'Volume':'volume'
    })  
    return df

def prepare_and_store(session: Session, ticker: str, df: pd.DataFrame, store_from: str = None):
    # Upsert stock
    stock = session.query(Stock).filter(Stock.symbol==ticker).one_or_none()
    if not stock:
        stock = Stock(symbol=ticker, name=ticker)
        session.add(stock)
        session.flush()  # get id

    stock.current_price = decimal.Decimal(str(df['close'].iloc[-1])) if not df.empty else stock.current_price

    # Compute indicators
    df['sma_20'] = compute_sma(df['close'], 20).ffill().bfill()
    df['sma_50'] = compute_sma(df['close'], 50).ffill().bfill()
    df['ema_20'] = compute_ema(df['close'], 20).ffill().bfill()
    df['ema_50'] = compute_ema(df['close'], 50).ffill().bfill()
    df['rsi_14'] = compute_rsi(df['close'], 14).ffill().bfill()
    macd, signal, hist = compute_macd(df['close'])
    df['macd'] = macd.ffill().bfill()
    df['macd_signal'] = signal.ffill().bfill()
    df['macd_hist'] = hist.ffill().bfill()
    upper, middle, lower = compute_bollinger(df['close'], 20, 2)
    df['boll_upper'] = upper.ffill().bfill()
    df['boll_mid'] = middle.ffill().bfill()
    df['boll_lower'] = lower.ffill().bfill()

    # Filter DF to only include rows from store_from if provided
    if store_from:
        df_to_store = df[df['date'] >= pd.to_datetime(store_from)].copy()
        if df_to_store.empty:
            print(f"  No new rows to store for {ticker} after {store_from}")
            return
    else:
        df_to_store = df

    # Determine if we need to check existence or just bulk insert
    history_count = session.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id).count()
    is_fresh = history_count == 0

    if is_fresh:
        print(f"  Bulk inserting {len(df_to_store)} rows for {ticker}...")
        ph_list = []
        ti_list = []
        for _, row in df_to_store.iterrows():
            d = pd.to_datetime(row['date']).date()
            ph_list.append(PriceHistory(
                stock_id=stock.stock_id, 
                date=d,
                open=to_dec(row['open']),
                high=to_dec(row['high']),
                low=to_dec(row['low']),
                close=to_dec(row['close']),
                volume=int(row['volume']) if not pd.isna(row['volume']) else 0
            ))
            
            ti_list.append(TechnicalIndicator(
                stock_id=stock.stock_id, 
                date=d,
                rsi=to_dec(row.get('rsi_14')),
                macd=to_dec(row.get('macd')),
                macd_signal=to_dec(row.get('macd_signal')),
                macd_histogram=to_dec(row.get('macd_hist')),
                sma_20=to_dec(row.get('sma_20')),
                sma_50=to_dec(row.get('sma_50')),
                ema_20=to_dec(row.get('ema_20')),
                ema_50=to_dec(row.get('ema_50')),
                bollinger_upper=to_dec(row.get('boll_upper')),
                bollinger_middle=to_dec(row.get('boll_mid')),
                bollinger_lower=to_dec(row.get('boll_lower'))
            ))
        
        session.bulk_save_objects(ph_list)
        session.bulk_save_objects(ti_list)
    else:
        print(f"  Updating/Refreshing {len(df_to_store)} rows for {ticker}...")
        for _, row in df_to_store.iterrows():
            d = pd.to_datetime(row['date']).date()
            
            # 1. Price History
            ph = session.query(PriceHistory).filter(PriceHistory.stock_id==stock.stock_id, PriceHistory.date==d).first()
            if not ph:
                ph = PriceHistory(stock_id=stock.stock_id, date=d)
                session.add(ph)
            
            ph.open = to_dec(row['open'])
            ph.high = to_dec(row['high'])
            ph.low = to_dec(row['low'])
            ph.close = to_dec(row['close'])
            ph.volume = int(row['volume']) if not pd.isna(row['volume']) else 0

            # 2. Technical Indicators
            ti = session.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id==stock.stock_id, TechnicalIndicator.date==d).first()
            if not ti:
                ti = TechnicalIndicator(stock_id=stock.stock_id, date=d)
                session.add(ti)
                
            ti.rsi = to_dec(row.get('rsi_14'))
            ti.macd = to_dec(row.get('macd'))
            ti.macd_signal = to_dec(row.get('macd_signal'))
            ti.macd_histogram = to_dec(row.get('macd_hist'))
            ti.sma_20 = to_dec(row.get('sma_20'))
            ti.sma_50 = to_dec(row.get('sma_50'))
            ti.ema_20 = to_dec(row.get('ema_20'))
            ti.ema_50 = to_dec(row.get('ema_50'))
            ti.bollinger_upper = to_dec(row.get('boll_upper'))
            ti.bollinger_middle = to_dec(row.get('boll_mid'))
            ti.bollinger_lower = to_dec(row.get('boll_lower'))

            # 3. Update Actual Price in Predictions (NEW)
            # Find any prediction made for this date and update its actual_price
            from prediction_models import PricePrediction
            pred = session.query(PricePrediction).filter(
                PricePrediction.stock_id == stock.stock_id,
                PricePrediction.prediction_date == d
            ).first()
            if pred:
                pred.actual_price = to_dec(row['close'])

    session.commit()
    print(f"Successfully processed {len(df_to_store)} rows for {ticker}")

def main(): # Removed 'args' from main function signature
    # Attempt to create engine, will use the hardcoded DATABASE_URL
    try:
        engine = create_engine(DATABASE_URL, echo=False)
        print(f"Connecting to database via URL: {DATABASE_URL.split('@')[-1]}")
        Base.metadata.create_all(engine)
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
    except Exception as e:
        print(f"❌ Failed to connect to the database. Check your configuration values.")
        print(f"Error: {e}")
        return

    # Use hardcoded values
    tickers = HARDCODED_TICKERS
    start = HARDCODED_START
    end = HARDCODED_END

    # --- NEW: Delete specified stocks ---
    stocks_to_delete = ["COMI.CA", "FAB.AD", "EMAAR.DU"]
    print(f"Checking for stocks to delete: {stocks_to_delete}")
    for s_sym in stocks_to_delete:
        s_obj = session.query(Stock).filter(Stock.symbol == s_sym).one_or_none()
        if s_obj:
            print(f"  Deleting {s_sym} (id={s_obj.stock_id}) ...")
            # Cascade delete should handle related rows if configured, but let's be explicit if needed
            # Assuming cascade is NOT configured in ORM or DB, we delete children first manually to be safe
            session.query(PriceHistory).filter(PriceHistory.stock_id == s_obj.stock_id).delete()
            session.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == s_obj.stock_id).delete()
            session.delete(s_obj)
            session.commit()
            print(f"  Deleted {s_sym}.")
        else:
            print(f"  {s_sym} not found in DB.")

    for t in tickers:
        print(f"Processing {t} ...")
        
        # --- Fetch Metadata (Sector & Description) ---
        try:
            # Check if metadata already exists to avoid redundant calls (optional, but good for speed)
            # For now, we update it every time as requested or to ensure freshness
            pass 
            
            ticker_obj = yf.Ticker(t)
            # Don't fetch info if we just want to quickly check DB, but user wants metadata. 
            # limits are loose for metadata usually.
            
            # Upsert/Update Stock with metadata
            stock = session.query(Stock).filter(Stock.symbol==t).one_or_none()
            if not stock:
                stock = Stock(symbol=t, name=t)
                session.add(stock)
                session.commit() # Commit to get ID
                print(f"  Created new stock entry for {t}")
            
            # Update metadata
            try:
                 info = ticker_obj.info
                 sector = info.get('sector')
                 description = info.get('longBusinessSummary')
                 name = info.get('shortName') or info.get('longName')

                 industry = info.get('industry')
                 market_cap = info.get('marketCap')
                 pe_ratio = info.get('trailingPE')
                 eps = info.get('trailingEps')
                 dividend_yield = info.get('dividendYield') or info.get('dividendRate')
                 high_52 = info.get('fiftyTwoWeekHigh')
                 low_52 = info.get('fiftyTwoWeekLow')
                 
                 # Update current price with live data if available
                 live_price = info.get('currentPrice') or info.get('regularMarketPrice')
                 if live_price:
                     stock.current_price = decimal.Decimal(str(live_price))
                 
                 if sector: stock.sector = sector
                 if description: stock.description = description
                 if name: stock.name = name
                 if industry: stock.industry = industry
                 if market_cap: stock.market_cap = market_cap
                 if pe_ratio: stock.pe_ratio = pe_ratio
                 if eps: stock.eps = eps
                 if dividend_yield: 
                     # dividendYield is usually a float (e.g. 0.005 for 0.5%), dividendRate is amount
                     # info dict varies. dividendYield is safer if available.
                     # But some APIs return percent as 0.5 for 0.5%. YFinance usually 0.005.
                     stock.dividend_yield = dividend_yield
                 if high_52: stock.fifty_two_week_high = high_52
                 if low_52: stock.fifty_two_week_low = low_52

                 session.commit()
                 # print(f"  Updated metadata for {t}")
            except Exception as e_meta:
                print(f"  ⚠️ Could not fetch metadata for {t}: {e_meta}")

        except Exception as e:
            print(f"  ❌ Error processing stock entry for {t}: {e}")
            session.rollback()
            continue

        # --- Incremental Price History & Technical Indicators ---
        # Get the latest date we have in the database for this stock
        latest_history = session.query(PriceHistory.date).filter(PriceHistory.stock_id == stock.stock_id)\
            .order_by(desc(PriceHistory.date)).first()
        
        if latest_history:
            last_db_date = latest_history[0]
            # Refresh last 3 days to fix potential null indicators, plus 60 days context
            refresh_start = (last_db_date - pd.Timedelta(days=3))
            context_start = (refresh_start - pd.Timedelta(days=60)).strftime("%Y-%m-%d")
            actual_store_start = refresh_start.strftime("%Y-%m-%d")
            
            print(f"  Existing data found (latest: {last_db_date}). Fetching context from {context_start}...")
            df = fetch_prices(t, context_start, end)
            
            if not df.empty and 'close' in df.columns:
                df = df.dropna(subset=['close']).reset_index(drop=True)
                prepare_and_store(session, t, df, store_from=actual_store_start)
        else:
            print(f"  No existing data. Fetching NEW price history for {t} from {start} to {end} ...")
            df = fetch_prices(t, start, end)
            if not df.empty and 'close' in df.columns:
                df = df.dropna(subset=['close']).reset_index(drop=True)
                prepare_and_store(session, t, df)

    session.close()
    print("Done.")

if __name__ == "__main__":
    # Removed argparse setup as it's no longer needed for hardcoded values
    main()