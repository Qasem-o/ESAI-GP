#!/usr/bin/env python3
"""
daily_update.py
- stand-alone automation script for daily stock price ingestion.
- Queries all active tickers in the database.
- Downloads the latest price records from yfinance.
- Performs data cleaning, technical indicators calculation, and actual price prediction mapping.
- Stores historical prices, indicators, and updates live current prices.
- Saves execution timestamp to system settings for admin panel visibility.
"""

import os
import sys
import decimal
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Force stdout/stderr to UTF-8 to prevent Windows console encoding errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Ensure script directory and backend directory are in the import path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, "backend"))

# Load environment variables
load_dotenv(os.path.join(current_dir, 'backend', '.env'))
load_dotenv()

from preparedata import (
    get_engine_from_env, Stock, PriceHistory, TechnicalIndicator,
    fetch_prices, prepare_and_store
)
from backend.prediction_models import SystemSetting
from sqlalchemy.orm import sessionmaker
from sqlalchemy import desc

def run_daily_update():
    print("=" * 60)
    print(f"🚀 [ESAI] DAILY DATA UPDATE PROCESS STARTED AT: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    try:
        engine = get_engine_from_env()
        Session = sessionmaker(bind=engine)
        session = Session()
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)

    try:
        # 1. Fetch all stocks from the DB
        stocks = session.query(Stock).order_by(Stock.symbol).all()
        if not stocks:
            print("⚠️ No stocks found in the database. Please run seed or init script first.")
            session.close()
            return

        print(f"📈 Found {len(stocks)} stocks to synchronize...")
        
        summary_results = []
        today_utc = datetime.now(timezone.utc).date()

        # 2. Iterate through each stock and update its history and indicators
        for i, stock in enumerate(stocks):
            ticker = stock.symbol
            print(f"\n🔄 [{i+1}/{len(stocks)}] Processing Ticker: {ticker}")

            # Check latest record dates in the database
            latest_price_row = session.query(PriceHistory).filter(PriceHistory.stock_id == stock.stock_id)\
                .order_by(desc(PriceHistory.date)).first()
            
            latest_tech_row = session.query(TechnicalIndicator).filter(TechnicalIndicator.stock_id == stock.stock_id)\
                .order_by(desc(TechnicalIndicator.date)).first()

            # Skip check if already updated today (UTC)
            is_up_to_date = latest_price_row and latest_price_row.date >= today_utc and latest_price_row.close is not None
            has_indicators = latest_tech_row and latest_tech_row.rsi is not None

            if is_up_to_date and has_indicators:
                print(f"  ✨ Already up to date for today. Skipping download.")
                summary_results.append((ticker, "SKIPPED (Up-to-date)", latest_price_row.close))
                continue

            # Determine start and end date for yfinance download
            if latest_price_row:
                # Go back 5 days to cover weekend gaps and ensure technical indicators overlapping window is filled correctly
                refresh_start = latest_price_row.date - timedelta(days=5)
                # We need context historical days (at least 60 days) to compute correct technical indicators (like 50-day SMA, RSI)
                context_start = refresh_start - timedelta(days=70)
                start_date = context_start.strftime("%Y-%m-%d")
                actual_update_from = refresh_start.strftime("%Y-%m-%d")
            else:
                # Fresh import
                start_date = "2018-01-01"
                actual_update_from = start_date

            end_date = (today_utc + timedelta(days=1)).strftime("%Y-%m-%d")
            
            print(f"  📥 Downloading price history from {start_date} to {end_date}...")
            try:
                # Download using yfinance
                df = fetch_prices(ticker, start_date, end_date)
                if df.empty or "close" not in df.columns:
                    print(f"  ⚠️ No new prices returned from yfinance for {ticker}.")
                    summary_results.append((ticker, "NO DATA", "N/A"))
                    continue

                # Drop invalid rows and sort by date
                df = df.dropna(subset=["close"]).reset_index(drop=True)

                # Process, compute indicators, mapping actual prices, and save to DB
                print(f"  ⚙️ Calculating indicators and storing into database...")
                prepare_and_store(session, ticker, df, store_from=actual_update_from)
                
                # Fetch latest price for summary logs
                session.refresh(stock)
                print(f"  ✅ Successfully updated. Current price: {stock.current_price}")
                summary_results.append((ticker, "SUCCESS", stock.current_price))

            except Exception as e:
                print(f"  ❌ Error processing {ticker}: {e}")
                summary_results.append((ticker, f"FAILED: {str(e)[:50]}", "N/A"))
                session.rollback()

        # 3. Save the global fetch execution timestamp
        try:
            ts = datetime.now(timezone.utc).isoformat()
            setting = session.query(SystemSetting).filter(SystemSetting.key == "last_daily_fetch").first()
            if setting:
                setting.value = ts
                setting.updated_at = datetime.now(timezone.utc)
            else:
                session.add(SystemSetting(key="last_daily_fetch", value=ts))
            session.commit()
            print(f"\n💾 Saved last daily fetch timestamp: {ts}")
        except Exception as e:
            print(f"⚠️ Failed to update last_daily_fetch system setting: {e}")
            session.rollback()

        # 4. Print execution report
        print("\n" + "=" * 60)
        print("📊 DAILY DATA UPDATE SYNCHRONIZATION REPORT")
        print("=" * 60)
        print(f"{'TICKER':<12} | {'STATUS':<25} | {'CURRENT PRICE':<15}")
        print("-" * 60)
        for ticker, status, price in summary_results:
            price_str = f"${float(price):.2f}" if isinstance(price, (decimal.Decimal, float, int)) else str(price)
            print(f"{ticker:<12} | {status:<25} | {price_str:<15}")
        print("=" * 60)
        print("🎉 [ESAI] Synchronization finished successfully!")
        print("=" * 60)

    except Exception as master_error:
        print(f"💥 Master execution error occurred: {master_error}")
    finally:
        session.close()

if __name__ == "__main__":
    run_daily_update()
