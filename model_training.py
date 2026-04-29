"""
model_training.py - Optimized Hybrid LSTM + XGBoost Training

Architecture:
  - LSTM  : Weekly training only (sequential, heavy, saved to disk)
  - XGBoost: Daily training using LSTM features (parallel across stocks)

What gets stored per stock (61 rows max):
  - 60 test-set rows  (is_test_set=True)  → actual vs predicted, for chart & metrics
  - 1 next-day row    (is_test_set=False) → tomorrow prediction

NO full historical backfilling. NO per-day loop over entire history.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, date as date_type, timezone
from concurrent.futures import ProcessPoolExecutor, as_completed
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# ── Force UTF-8 on Windows ───────────────────────────────────────────────────
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── Path setup ───────────────────────────────────────────────────────────────
_THIS_FILE   = os.path.abspath(__file__)
_ROOT_DIR    = os.path.dirname(_THIS_FILE)
_BACKEND_DIR = os.path.join(_ROOT_DIR, "backend")

sys.path.insert(0, _ROOT_DIR)
sys.path.insert(0, _BACKEND_DIR)

load_dotenv(os.path.join(_ROOT_DIR,    ".env"))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))

from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error

from preparedata import Base, ModelMetric, Stock, PriceHistory
from prediction_models import PricePrediction

# ── Configuration ────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    import urllib.parse
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "123123")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB   = os.getenv("PG_DB",   "Stocksdata")
    encoded_pass = urllib.parse.quote_plus(PG_PASS)
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{encoded_pass}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

MODEL_DIR = os.path.join(_ROOT_DIR, "trained_models")
LOOK_BACK  = 60   # LSTM sequence length = test window size
TRAIN_SPLIT = 0.8 # 80% train / 20% test (chronological)

# ── DB Helpers ───────────────────────────────────────────────────────────────

def get_engine():
    return create_engine(DATABASE_URL, echo=False)


def create_tables():
    engine = get_engine()
    Base.metadata.create_all(engine)
    from models import Base as AuthBase
    AuthBase.metadata.create_all(engine)
    print("✅ Tables verified.")


def get_all_tickers() -> list:
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT DISTINCT symbol FROM stocks ORDER BY symbol"))
        return [r[0] for r in rows]


def load_data(ticker: str) -> pd.DataFrame | None:
    engine = get_engine()
    query = f"""
        SELECT ph.date, ph.close, ph.volume,
               ti.rsi, ti.macd, ti.macd_signal, ti.sma_20, ti.sma_50
        FROM price_history ph
        JOIN technical_indicator ti
          ON ph.stock_id = ti.stock_id AND ph.date = ti.date
        JOIN stocks s ON ph.stock_id = s.stock_id
        WHERE s.symbol = '{ticker}'
        ORDER BY ph.date ASC
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return None
    df["date"] = pd.to_datetime(df["date"])
    df.set_index("date", inplace=True)
    df.dropna(inplace=True)
    return df


def next_trading_day(ref: date_type) -> date_type:
    nxt = ref + timedelta(days=1)
    while nxt.weekday() >= 5:
        nxt += timedelta(days=1)
    return nxt

# ── LSTM helpers ─────────────────────────────────────────────────────────────

def _build_sequences(scaled: np.ndarray, look_back: int):
    X, y = [], []
    for i in range(look_back, len(scaled)):
        X.append(scaled[i - look_back:i, 0])
        y.append(scaled[i, 0])
    return np.array(X), np.array(y)


def _build_lstm(look_back: int) -> Sequential:
    m = Sequential([
        Input(shape=(look_back, 1)),
        LSTM(50, return_sequences=True),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1),
    ])
    m.compile(optimizer="adam", loss="mean_squared_error")
    return m

# ── WEEKLY: Train LSTM ────────────────────────────────────────────────────────

def lstm_needs_training(ticker_dir: str) -> bool:
    """Return True if LSTM was not trained in the last 7 days."""
    marker = os.path.join(ticker_dir, "lstm_trained_at.txt")
    if not os.path.exists(marker):
        return True
    try:
        with open(marker) as f:
            ts = datetime.fromisoformat(f.read().strip())
        return (datetime.utcnow() - ts).days >= 7
    except Exception:
        return True


def train_lstm(ticker: str, df: pd.DataFrame, ticker_dir: str):
    """Train LSTM on full training split and save. Returns scaler."""
    print(f"  [LSTM] Training LSTM for {ticker}...")
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(df[["close"]])

    train_len = int(len(scaled) * TRAIN_SPLIT)
    X_all, y_all = _build_sequences(scaled, LOOK_BACK)
    train_lstm_len = int(len(X_all) * TRAIN_SPLIT)

    X_train = X_all[:train_lstm_len].reshape(-1, LOOK_BACK, 1)
    y_train = y_all[:train_lstm_len]

    model = _build_lstm(LOOK_BACK)
    model.fit(X_train, y_train, batch_size=32, epochs=10, verbose=0)
    model.save(os.path.join(ticker_dir, "lstm_model.h5"))
    joblib.dump(scaler, os.path.join(ticker_dir, "scaler.pkl"))

    # Write training timestamp
    with open(os.path.join(ticker_dir, "lstm_trained_at.txt"), "w") as f:
        f.write(datetime.utcnow().isoformat())

    print(f"  [LSTM] ✅ LSTM saved for {ticker}")
    return scaler


def load_lstm_and_scaler(ticker_dir: str):
    """Load saved LSTM model and scaler from disk."""
    model  = load_model(os.path.join(ticker_dir, "lstm_model.h5"), compile=False)
    scaler = joblib.load(os.path.join(ticker_dir, "scaler.pkl"))
    return model, scaler

# ── DAILY: Train XGBoost (called per-ticker, safe for multiprocessing) ────────

def train_xgboost_for_ticker(ticker: str) -> dict:
    """
    Full pipeline for one ticker:
      1. Load data from DB
      2. Train or load LSTM
      3. Generate LSTM features on test split (60 days)
      4. Train XGBoost (Hybrid Corrector) on train split residuals
      5. Predict on test split (60 rows)  ← stored as test set
      6. Predict next trading day         ← stored as next-day prediction
      7. Save metrics + predictions to DB

    Returns: {"ticker": str, "status": "ok"|"skip"|"error", "msg": str}
    """
    # Re-import inside function (required for ProcessPoolExecutor)
    import os, sys, joblib, numpy as np, pandas as pd
    from datetime import datetime, timedelta, timezone
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
    from xgboost import XGBRegressor

    # path setup for subprocess context
    _root    = os.path.dirname(os.path.abspath(__file__))
    _backend = os.path.join(_root, "backend")
    sys.path.insert(0, _root)
    sys.path.insert(0, _backend)

    from dotenv import load_dotenv
    load_dotenv(os.path.join(_root, ".env"))
    load_dotenv(os.path.join(_backend, ".env"))

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        import urllib.parse
        pw = urllib.parse.quote_plus(os.getenv("PG_PASS", "123123"))
        db_url = (f"postgresql+psycopg2://{os.getenv('PG_USER','postgres')}:{pw}"
                  f"@{os.getenv('PG_HOST','localhost')}:{os.getenv('PG_PORT','5432')}"
                  f"/{os.getenv('PG_DB','Stocksdata')}")
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif "postgresql://" in db_url and "+psycopg2" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    engine = create_engine(db_url, echo=False)
    Session = sessionmaker(bind=engine)

    from preparedata import Stock, ModelMetric
    from prediction_models import PricePrediction
    from tensorflow.keras.models import load_model as keras_load

    LOOK_BACK   = 60
    TRAIN_SPLIT = 0.8
    MODEL_DIR   = os.path.join(_root, "trained_models")
    feature_cols = ["rsi", "macd", "macd_signal", "sma_20", "sma_50", "volume"]

    try:
        # ── 1. Load data ──────────────────────────────────────────────────────
        from sqlalchemy import text
        query = f"""
            SELECT ph.date, ph.close, ph.volume,
                   ti.rsi, ti.macd, ti.macd_signal, ti.sma_20, ti.sma_50
            FROM price_history ph
            JOIN technical_indicator ti
              ON ph.stock_id = ti.stock_id AND ph.date = ti.date
            JOIN stocks s ON ph.stock_id = s.stock_id
            WHERE s.symbol = '{ticker}'
            ORDER BY ph.date ASC
        """
        df = pd.read_sql(query, engine)
        if df.empty or len(df) < 100:
            return {"ticker": ticker, "status": "skip",
                    "msg": f"Not enough data ({len(df)} rows)"}

        df["date"] = pd.to_datetime(df["date"])
        df.set_index("date", inplace=True)
        df.dropna(inplace=True)

        ticker_dir = os.path.join(MODEL_DIR, ticker)
        os.makedirs(ticker_dir, exist_ok=True)

        # ── 2. LSTM: train weekly or load existing ────────────────────────────
        lstm_path   = os.path.join(ticker_dir, "lstm_model.h5")
        scaler_path = os.path.join(ticker_dir, "scaler.pkl")
        marker_path = os.path.join(ticker_dir, "lstm_trained_at.txt")

        needs_lstm = True
        if os.path.exists(marker_path):
            try:
                with open(marker_path) as f:
                    ts = datetime.fromisoformat(f.read().strip())
                needs_lstm = (datetime.utcnow() - ts).days >= 7
            except Exception:
                needs_lstm = True

        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled = scaler.fit_transform(df[["close"]])

        if needs_lstm or not os.path.exists(lstm_path):
            X_all, y_all = [], []
            for i in range(LOOK_BACK, len(scaled)):
                X_all.append(scaled[i - LOOK_BACK:i, 0])
                y_all.append(scaled[i, 0])
            X_all, y_all = np.array(X_all), np.array(y_all)
            if len(X_all) == 0:
                return {"ticker": ticker, "status": "skip", "msg": "Not enough for sequences"}

            train_n = int(len(X_all) * TRAIN_SPLIT)
            X_train_lstm = X_all[:train_n].reshape(-1, LOOK_BACK, 1)
            y_train_lstm = y_all[:train_n]

            from tensorflow.keras.models import Sequential as KSeq
            from tensorflow.keras.layers import LSTM as KLstm, Dense as KDense, Dropout as KDrop, Input as KInput
            lstm_model = KSeq([
                KInput(shape=(LOOK_BACK, 1)),
                KLstm(50, return_sequences=True), KDrop(0.2),
                KLstm(50, return_sequences=False), KDrop(0.2),
                KDense(25), KDense(1),
            ])
            lstm_model.compile(optimizer="adam", loss="mean_squared_error")
            lstm_model.fit(X_train_lstm, y_train_lstm, batch_size=32, epochs=10, verbose=0)
            lstm_model.save(lstm_path)
            joblib.dump(scaler, scaler_path)
            with open(marker_path, "w") as f:
                f.write(datetime.utcnow().isoformat())
        else:
            lstm_model = keras_load(lstm_path, compile=False)
            scaler = joblib.load(scaler_path)
            # Re-scale with current data so scaler matches this run
            scaled = scaler.transform(df[["close"]])

        # ── 3. Build sequences for FULL dataset ───────────────────────────────
        X_all, y_all = [], []
        for i in range(LOOK_BACK, len(scaled)):
            X_all.append(scaled[i - LOOK_BACK:i, 0])
            y_all.append(scaled[i, 0])
        X_all = np.array(X_all)
        y_all = np.array(y_all)
        n_seq = len(X_all)

        train_n = int(n_seq * TRAIN_SPLIT)
        X_train_seq = X_all[:train_n].reshape(-1, LOOK_BACK, 1)
        X_test_seq  = X_all[train_n:].reshape(-1, LOOK_BACK, 1)

        # LSTM predictions on train & test
        lstm_train_pred = scaler.inverse_transform(
            lstm_model.predict(X_train_seq, verbose=0)
        ).flatten()
        lstm_test_pred  = scaler.inverse_transform(
            lstm_model.predict(X_test_seq, verbose=0)
        ).flatten()

        # ── 4. Train XGBoost Hybrid Corrector on train residuals ──────────────
        # Align actual values with sequence output indices
        # sequence index i corresponds to df row index (LOOK_BACK + i)
        train_actual = df["close"].iloc[LOOK_BACK: LOOK_BACK + train_n].values
        residuals    = train_actual - lstm_train_pred[:len(train_actual)]

        X_feat_train = df[feature_cols].iloc[LOOK_BACK: LOOK_BACK + train_n]
        hybrid = XGBRegressor(n_estimators=500, learning_rate=0.05,
                              tree_method="hist", n_jobs=1)
        hybrid.fit(X_feat_train, residuals[:len(X_feat_train)])
        hybrid.save_model(os.path.join(ticker_dir, "hybrid_corrector.json"))

        # ── 5. Predict on TEST split (last 60 days of sequences) ─────────────
        # Use only the last 60 rows of the test sequences for storage
        n_test  = len(X_test_seq)
        use_n   = min(n_test, LOOK_BACK)           # store at most 60 rows
        # indices in df for actual test values
        test_start_idx = LOOK_BACK + train_n + (n_test - use_n)
        test_actual    = df["close"].iloc[test_start_idx:].values[:use_n]
        test_dates     = df.index[test_start_idx:][:use_n]

        X_feat_test = df[feature_cols].iloc[test_start_idx:][:use_n]
        lstm_slice  = lstm_test_pred[-use_n:]
        hybrid_corr = hybrid.predict(X_feat_test)
        test_preds  = lstm_slice + hybrid_corr

        # ── Metrics ───────────────────────────────────────────────────────────
        mape    = float(mean_absolute_percentage_error(test_actual, test_preds))
        rmse    = float(np.sqrt(mean_squared_error(test_actual, test_preds)))
        dir_acc = float(np.mean(
            (np.diff(test_actual) > 0) == (np.diff(test_preds) > 0)
        ) * 100) if len(test_actual) > 1 else 0.0

        # ── 6. Next-day prediction ────────────────────────────────────────────
        last_seq    = scaled[-LOOK_BACK:].reshape(1, LOOK_BACK, 1)
        lstm_next   = float(scaler.inverse_transform(
            lstm_model.predict(last_seq, verbose=0)
        )[0][0])
        last_feat   = df[feature_cols].iloc[[-1]]
        corr_next   = float(hybrid.predict(last_feat)[0])
        next_price  = round(lstm_next + corr_next, 4)

        curr_price  = float(df["close"].iloc[-1])
        chg_pct     = round(((next_price - curr_price) / curr_price) * 100, 4) if curr_price else 0.0
        direction   = "bullish" if chg_pct > 0 else ("bearish" if chg_pct < 0 else "neutral")
        last_date   = df.index[-1].date() if hasattr(df.index[-1], "date") else df.index[-1]
        pred_date   = last_date + timedelta(days=1)
        while pred_date.weekday() >= 5:
            pred_date += timedelta(days=1)

        # ── 7. Save to DB ─────────────────────────────────────────────────────
        session = Session()
        try:
            stock = session.query(Stock).filter(Stock.symbol == ticker).one_or_none()
            if not stock:
                return {"ticker": ticker, "status": "error", "msg": "Stock not in DB"}

            # Upsert ModelMetric
            metric = session.query(ModelMetric).filter(
                ModelMetric.stock_id == stock.stock_id,
                ModelMetric.model_type == "Hybrid"
            ).one_or_none()
            if not metric:
                metric = ModelMetric(stock_id=stock.stock_id, model_type="Hybrid")
                session.add(metric)
            metric.rmse = round(rmse, 4)
            metric.mape = round(mape, 4)
            metric.directional_accuracy = round(dir_acc, 2)

            # Delete old predictions for this stock
            session.query(PricePrediction).filter(
                PricePrediction.stock_id == stock.stock_id
            ).delete()

            now_utc = datetime.now(timezone.utc)
            to_insert = []

            # 60 test-set rows
            for i in range(use_n):
                d      = test_dates[i].date() if hasattr(test_dates[i], "date") else test_dates[i]
                pred_p = float(test_preds[i])
                act_p  = float(test_actual[i])
                prev_p = act_p  # fallback
                if i > 0:
                    prev_p = float(test_actual[i - 1])
                chg    = round(((pred_p - prev_p) / prev_p) * 100, 4) if prev_p else 0.0
                dirr   = "bullish" if chg > 0 else ("bearish" if chg < 0 else "neutral")
                to_insert.append(PricePrediction(
                    stock_id=stock.stock_id,
                    prediction_date=d,
                    predicted_price=pred_p,
                    actual_price=act_p,
                    confidence=round(dir_acc, 2),
                    direction=dirr,
                    change_percent=chg,
                    model_type="Hybrid",
                    trained_at=now_utc,
                    is_test_set=True,
                ))

            # 1 next-day row
            to_insert.append(PricePrediction(
                stock_id=stock.stock_id,
                prediction_date=pred_date,
                predicted_price=next_price,
                actual_price=None,
                confidence=round(dir_acc, 2),
                direction=direction,
                change_percent=chg_pct,
                model_type="Hybrid",
                trained_at=now_utc,
                is_test_set=False,
            ))

            session.bulk_save_objects(to_insert)
            session.commit()
            print(f"  💾 {ticker}: RMSE={rmse:.4f} MAPE={mape:.2%} DirAcc={dir_acc:.1f}% "
                  f"| Next={next_price:.4f} ({chg_pct:+.2f}% → {direction})")
            return {"ticker": ticker, "status": "ok", "msg": "success"}

        except Exception as e:
            session.rollback()
            return {"ticker": ticker, "status": "error", "msg": str(e)}
        finally:
            session.close()

    except Exception as e:
        return {"ticker": ticker, "status": "error", "msg": str(e)}


# ── Daily entry (XGBoost parallel) ────────────────────────────────────────────

def run_daily(tickers: list, workers: int = 4):
    """
    Train XGBoost (+ LSTM if weekly) for each ticker.
    Uses ProcessPoolExecutor for parallelism.
    """
    print(f"\n⚡ Daily XGBoost training | {len(tickers)} stock(s) | workers={workers}")
    results = {"ok": [], "skip": [], "error": []}

    with ProcessPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(train_xgboost_for_ticker, t): t for t in tickers}
        for fut in as_completed(futures):
            r = fut.result()
            results[r["status"]].append(r["ticker"])
            if r["status"] == "error":
                print(f"  ❌ {r['ticker']}: {r['msg']}")
            elif r["status"] == "skip":
                print(f"  ⚠️  {r['ticker']}: {r['msg']}")

    return results


def get_trained_today() -> list:
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        today = datetime.now(timezone.utc).date()
        rows = (
            session.query(Stock.symbol)
            .join(PricePrediction, PricePrediction.stock_id == Stock.stock_id)
            .filter(PricePrediction.trained_at >= datetime.combine(today, datetime.min.time()))
            .distinct()
            .all()
        )
        return [r[0] for r in rows]
    except Exception:
        return []
    finally:
        session.close()


# ── CLI entry point ───────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Train Hybrid LSTM+XGBoost for stocks")
    parser.add_argument("--symbols",           nargs="*", default=None)
    parser.add_argument("--skip-trained-today",action="store_true")
    parser.add_argument("--workers",           type=int,  default=4)
    args = parser.parse_args()

    print(">> Initializing tables...")
    create_tables()

    print(">> Fetching tickers from DB...")
    all_tickers = get_all_tickers()
    if not all_tickers:
        print("[WARN] No stocks in DB.")
        return

    tickers = [t for t in all_tickers if t in [s.upper() for s in args.symbols]] \
              if args.symbols else all_tickers

    if args.skip_trained_today:
        trained = get_trained_today()
        skipped = [t for t in tickers if t in trained]
        tickers  = [t for t in tickers if t not in trained]
        if skipped:
            print(f">> Skipping already trained today: {skipped}")

    if not tickers:
        print(">> All stocks trained today. Nothing to do.")
        return

    print(f">> Training {len(tickers)} stock(s) with {args.workers} workers...")
    results = run_daily(tickers, workers=args.workers)

    total = len(tickers)
    print(f"\n>> Done! ✅ {len(results['ok'])}/{total} OK  "
          f"| ⚠️ {len(results['skip'])} skipped  "
          f"| ❌ {len(results['error'])} errors")
    if results["error"]:
        print(f"   Failed: {results['error']}")


if __name__ == "__main__":
    main()