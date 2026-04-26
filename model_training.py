"""
model_training.py - Dynamic Training & Next-Day Prediction

Reads ALL stocks from the database (no hardcoded lists).
For each stock:
  1. Loads price history + technical indicators from DB.
  2. Trains a Hybrid LSTM + XGBoost model.
  3. Predicts the next trading day's price.
  4. Saves predictions + metrics to the DB.

Usage:
  python model_training.py
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib

# Force UTF-8 output on Windows (avoids UnicodeEncodeError with emoji on cp1252)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from datetime import datetime, timedelta, date as date_type
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# ─── Path setup ────────────────────────────────────────────────────────────────
# model_training.py lives in the project root.
# We always need both root and backend/ on sys.path.
_THIS_FILE   = os.path.abspath(__file__)
_ROOT_DIR    = os.path.dirname(_THIS_FILE)
_BACKEND_DIR = os.path.join(_ROOT_DIR, "backend")

sys.path.insert(0, _ROOT_DIR)
sys.path.insert(0, _BACKEND_DIR)

# Load env files (try both locations)
load_dotenv(os.path.join(_ROOT_DIR, '.env'))
load_dotenv(os.path.join(_BACKEND_DIR, '.env'))

from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error

from preparedata import Base, ModelMetric, Stock, PriceHistory

# Import prediction model
from prediction_models import PricePrediction

# ─── Configuration ─────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    import urllib.parse
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "123123")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB   = os.getenv("PG_DB",   "Stocksdata")
    
    # URL encode the password to handle special characters like '@'
    encoded_pass = urllib.parse.quote_plus(PG_PASS)
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{encoded_pass}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

MODEL_DIR = os.path.join(_ROOT_DIR, "trained_models")

# ─── DB Helpers ────────────────────────────────────────────────────────────────

def get_db_engine():
    return create_engine(DATABASE_URL, echo=False)


def create_tables_if_not_exist():
    engine = get_db_engine()
    Base.metadata.create_all(engine)
    # Also ensure price_predictions table exists
    from prediction_models import PricePrediction  # noqa already imported above
    from models import Base as AuthBase
    AuthBase.metadata.create_all(engine)
    print("✅ Verified/Created all database tables.")


def get_all_tickers():
    """Fetch ALL stock symbols from the DB (fully dynamic, no hardcoded list)."""
    engine = get_db_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT DISTINCT symbol FROM stocks ORDER BY symbol"))
        tickers = [row[0] for row in result]
    return tickers


def load_data_from_db(ticker: str) -> pd.DataFrame | None:
    """Load price history + technical indicators for a ticker from the DB."""
    engine = get_db_engine()
    query = f"""
    SELECT
        ph.date, ph.close, ph.volume,
        ti.rsi, ti.macd, ti.macd_signal, ti.sma_20, ti.sma_50
    FROM price_history ph
    JOIN technical_indicator ti ON ph.stock_id = ti.stock_id AND ph.date = ti.date
    JOIN stocks s ON ph.stock_id = s.stock_id
    WHERE s.symbol = '{ticker}'
    ORDER BY ph.date ASC
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return None
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    df.dropna(inplace=True)
    return df


# ─── Next Trading Day ──────────────────────────────────────────────────────────

def next_trading_day(ref_date: date_type) -> date_type:
    """Returns the next weekday (Mon-Fri) after ref_date."""
    nxt = ref_date + timedelta(days=1)
    while nxt.weekday() >= 5:  # Saturday=5, Sunday=6
        nxt += timedelta(days=1)
    return nxt


# ─── Training Logic ────────────────────────────────────────────────────────────

def train_and_predict(ticker: str):
    print(f"\n{'='*45}")
    print(f"🚀 Processing: {ticker}")
    print(f"{'='*45}")

    # 1. Load Data
    df = load_data_from_db(ticker)
    if df is None:
        print(f"  ⚠️  No data found for {ticker}. Skipping.")
        return
    if len(df) < 100:
        print(f"  ⚠️  Only {len(df)} rows for {ticker} (need ≥100). Skipping.")
        return

    ticker_dir = os.path.join(MODEL_DIR, ticker)
    os.makedirs(ticker_dir, exist_ok=True)

    feature_cols = ['rsi', 'macd', 'macd_signal', 'sma_20', 'sma_50', 'volume']
    look_back = 60

    train_size = int(len(df) * 0.8)
    train_df = df.iloc[:train_size]
    test_df  = df.iloc[train_size:]

    # ── MODEL 1: LSTM ──────────────────────────────────────────────────────
    print(f"  [1/3] Training LSTM...")
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df[['close']])

    def create_sequences(dataset):
        X, y = [], []
        for i in range(look_back, len(dataset)):
            X.append(dataset[i - look_back:i, 0])
            y.append(dataset[i, 0])
        return np.array(X), np.array(y)

    X_all, y_all = create_sequences(scaled_data)
    if len(X_all) == 0:
        print("    ⚠️  Not enough data for sequences.")
        return

    train_len_lstm = int(len(X_all) * 0.8)
    X_train_lstm  = X_all[:train_len_lstm].reshape(-1, look_back, 1)
    y_train_lstm  = y_all[:train_len_lstm]
    X_test_lstm   = X_all[train_len_lstm:].reshape(-1, look_back, 1)

    model_lstm = Sequential([
        Input(shape=(look_back, 1)),
        LSTM(50, return_sequences=True),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1),
    ])
    model_lstm.compile(optimizer='adam', loss='mean_squared_error')
    model_lstm.fit(X_train_lstm, y_train_lstm, batch_size=32, epochs=10, verbose=0)

    model_lstm.save(os.path.join(ticker_dir, 'lstm_model.h5'))
    joblib.dump(scaler, os.path.join(ticker_dir, 'scaler.pkl'))

    lstm_test_pred  = scaler.inverse_transform(model_lstm.predict(X_test_lstm, verbose=0))
    lstm_train_pred = scaler.inverse_transform(model_lstm.predict(X_train_lstm, verbose=0))

    # ── MODEL 2: XGBoost ───────────────────────────────────────────────────
    print(f"  [2/3] Training XGBoost...")
    xgb_model = XGBRegressor(n_estimators=500, learning_rate=0.05)
    xgb_model.fit(train_df[feature_cols], train_df['close'], verbose=False)
    xgb_model.save_model(os.path.join(ticker_dir, 'xgb_model.json'))

    # ── MODEL 3: Hybrid Corrector ──────────────────────────────────────────
    print(f"  [3/3] Training Hybrid Corrector...")
    train_actual = df['close'].iloc[look_back: look_back + len(lstm_train_pred)].values
    residuals_train = train_actual - lstm_train_pred.flatten()
    X_train_hybrid = df[feature_cols].iloc[look_back: look_back + len(lstm_train_pred)]

    hybrid_corrector = XGBRegressor(n_estimators=500, learning_rate=0.05)
    hybrid_corrector.fit(X_train_hybrid, residuals_train)
    hybrid_corrector.save_model(os.path.join(ticker_dir, 'hybrid_corrector.json'))

    X_test_hybrid = df[feature_cols].iloc[-len(lstm_test_pred):]
    hybrid_preds  = lstm_test_pred.flatten() + hybrid_corrector.predict(X_test_hybrid)

    # ── Evaluation ─────────────────────────────────────────────────────────
    min_len    = min(len(lstm_test_pred), len(hybrid_preds))
    res_actual = df['close'].iloc[-min_len:].values
    res_hybrid = hybrid_preds[-min_len:]

    mape   = mean_absolute_percentage_error(res_actual, res_hybrid)
    rmse   = float(np.sqrt(mean_squared_error(res_actual, res_hybrid)))
    dir_acc = float(np.mean((np.diff(res_actual) > 0) == (np.diff(res_hybrid) > 0)) * 100)

    print(f"  ✅ RMSE: {rmse:.4f} | MAPE: {mape:.2%} | Dir Acc: {dir_acc:.2f}%")

    # ── Next-Day Prediction ────────────────────────────────────────────────
    last_60_scaled = scaled_data[-look_back:].reshape(1, look_back, 1)
    lstm_next_scaled = model_lstm.predict(last_60_scaled, verbose=0)
    lstm_next_price  = float(scaler.inverse_transform(lstm_next_scaled)[0][0])

    last_features = df[feature_cols].iloc[[-1]]
    residual_corr = float(hybrid_corrector.predict(last_features)[0])
    next_price    = round(lstm_next_price + residual_corr, 4)

    current_price = float(df['close'].iloc[-1])
    change_pct    = round(((next_price - current_price) / current_price) * 100, 4) if current_price else 0.0
    direction     = "bullish" if change_pct > 0 else ("bearish" if change_pct < 0 else "neutral")
    last_date     = df.index[-1].date() if hasattr(df.index[-1], 'date') else df.index[-1]
    pred_date     = next_trading_day(last_date)

    print(f"  📈 Next Day ({pred_date}): {next_price:.4f} ({change_pct:+.2f}%  → {direction})")

    # ── Save to DB ─────────────────────────────────────────────────────────
    engine = get_db_engine()
    SessionClass = sessionmaker(bind=engine)
    session = SessionClass()
    try:
        stock = session.query(Stock).filter(Stock.symbol == ticker).one_or_none()
        if not stock:
            print(f"  ⚠️  Stock '{ticker}' not found in DB.")
            return

        # Upsert ModelMetric
        metric = session.query(ModelMetric).filter(
            ModelMetric.stock_id == stock.stock_id,
            ModelMetric.model_type == 'Hybrid'
        ).one_or_none()
        if not metric:
            metric = ModelMetric(stock_id=stock.stock_id, model_type='Hybrid')
            session.add(metric)
        metric.rmse = round(rmse, 4)
        metric.mape = round(float(mape), 4)
        metric.directional_accuracy = round(dir_acc, 2)

        # Upsert PricePrediction
        pred_row = session.query(PricePrediction).filter(
            PricePrediction.stock_id == stock.stock_id,
            PricePrediction.prediction_date == pred_date,
        ).one_or_none()
        if not pred_row:
            pred_row = PricePrediction(stock_id=stock.stock_id, prediction_date=pred_date)
            session.add(pred_row)
        pred_row.predicted_price = next_price
        pred_row.confidence      = round(dir_acc, 2)
        pred_row.direction       = direction
        pred_row.change_percent  = change_pct
        pred_row.model_type      = "Hybrid"
        pred_row.trained_at      = datetime.utcnow()

        session.commit()
        print(f"  💾 Saved prediction + metrics for {ticker}")
    except Exception as e:
        print(f"  ❌ DB save error for {ticker}: {e}")
        session.rollback()
    finally:
        session.close()


# ─── Entry Point ───────────────────────────────────────────────────────────────

def main():
    print("🔧 Initializing...")
    create_tables_if_not_exist()

    print("📋 Fetching tickers from database (dynamic)...")
    try:
        tickers = get_all_tickers()
    except Exception as e:
        print(f"❌ Failed to fetch tickers: {e}")
        return

    if not tickers:
        print("⚠️  No stocks found in the database. Add stocks via the Admin panel first.")
        return

    print(f"📊 Found {len(tickers)} stocks: {tickers}")
    failed = []
    for t in tickers:
        try:
            train_and_predict(t)
        except Exception as e:
            print(f"❌ Error training {t}: {e}")
            failed.append(t)

    print(f"\n🎉 Training complete! ({len(tickers) - len(failed)}/{len(tickers)} succeeded)")
    if failed:
        print(f"⚠️  Failed: {failed}")


if __name__ == "__main__":
    main()