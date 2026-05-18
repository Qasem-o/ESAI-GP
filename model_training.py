import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone, date
import calendar

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, BatchNormalization
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
except ImportError:
    print("WARNING: TensorFlow not found. Training will fail. Run 'pip install tensorflow'")
    tf = None

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

_root    = os.path.dirname(os.path.abspath(__file__))
_backend = os.path.join(_root, "backend")
sys.path.insert(0, _root)
sys.path.insert(0, _backend)

from dotenv import load_dotenv
load_dotenv(os.path.join(_backend, ".env"))
load_dotenv(os.path.join(_root, ".env"), override=True)

MODEL_DIR   = os.path.join(_root, "trained_models")
LOOK_BACK   = 60
TRAIN_SPLIT = 0.8

# Base feature columns from the database
DB_FEATURE_COLS = ["rsi", "macd", "macd_signal", "sma_20", "sma_50", "volume"]

# All feature columns used for XGBoost (includes engineered features)
FEATURE_COLS = [
    "rsi", "macd", "macd_signal", "sma_20", "sma_50", "volume",
    "ema_12", "ema_26", "bb_upper", "bb_lower", "bb_width",
    "atr", "daily_return", "vol_ratio"
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute additional technical indicators from OHLCV data."""
    close = df["close"]

    # EMA
    df["ema_12"] = close.ewm(span=12, adjust=False).mean()
    df["ema_26"] = close.ewm(span=26, adjust=False).mean()

    # Bollinger Bands (20-day)
    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    df["bb_upper"]  = bb_mid + 2 * bb_std
    df["bb_lower"]  = bb_mid - 2 * bb_std
    df["bb_width"]  = (df["bb_upper"] - df["bb_lower"]) / (bb_mid + 1e-9)

    # ATR (14-day) — approximated from close only (no high/low in DB)
    daily_change = close.diff().abs()
    df["atr"] = daily_change.rolling(14).mean()

    # Daily return & volume ratio
    df["daily_return"] = close.pct_change()
    df["vol_ratio"]    = df["volume"] / (df["volume"].rolling(20).mean() + 1e-9)

    return df

def get_engine():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        import urllib.parse
        pw = urllib.parse.quote_plus(os.getenv("PG_PASS", "your_db_password"))
        db_url = (f"postgresql+psycopg2://{os.getenv('PG_USER','your_db_user')}:{pw}"
                  f"@{os.getenv('PG_HOST','localhost')}:{os.getenv('PG_PORT','5432')}"
                  f"/{os.getenv('PG_DB','your_db_name')}")
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif "postgresql://" in db_url and "+psycopg2" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
    is_pooler = "pooler.supabase.com" in db_url or ":6543" in db_url
    
    if is_pooler:
        from sqlalchemy.pool import NullPool
        if "prepared_statement" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url += f"{separator}prepared_statement=false"
        engine_kwargs = {
            "poolclass": NullPool
        }
    else:
        engine_kwargs = {}
        
    return create_engine(db_url, echo=False, **engine_kwargs)

from preparedata import Stock, ModelMetric
from prediction_models import PricePrediction

def create_tables():
    engine = get_engine()
    from preparedata import Base
    from prediction_models import Base as PredBase
    Base.metadata.create_all(engine)
    PredBase.metadata.create_all(engine)

def get_all_tickers():
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("SELECT symbol FROM stocks")).fetchall()
    return [r[0] for r in res]

def _build_sequences(scaled: np.ndarray, look_back: int):
    X, y = [], []
    for i in range(look_back, len(scaled)):
        X.append(scaled[i - look_back:i, 0])
        y.append(scaled[i, 0])
    return np.array(X), np.array(y)

def _build_lstm(look_back: int):
    if tf is None: raise ImportError("TensorFlow not installed.")
    m = Sequential([
        Input(shape=(look_back, 1)),
        LSTM(128, return_sequences=True),
        Dropout(0.2),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.1),
        Dense(32, activation="relu"),
        Dense(16, activation="relu"),
        Dense(1),
    ])
    m.compile(optimizer="adam", loss="mean_squared_error")
    return m


def get_remaining_business_days(last_date: date, ticker: str) -> list:
    """
    Returns a list of business day dates from last_date+1 to the end of the
    current calendar month. Saudi tickers (.SR) use Sun-Thu schedule;
    all others use Mon-Fri.
    """
    is_saudi = ticker.upper().endswith(".SR")
    # Sun=6,Mon=0,Tue=1,Wed=2,Thu=3,Fri=4,Sat=5
    if is_saudi:
        work_days = {6, 0, 1, 2, 3}   # Sun-Thu
    else:
        work_days = {0, 1, 2, 3, 4}   # Mon-Fri

    today = datetime.now(timezone.utc).date()
    # Start from the day after last data, but at least today
    start = max(last_date + timedelta(days=1), today)

    # End of current calendar month
    _, month_end_day = calendar.monthrange(today.year, today.month)
    month_end = date(today.year, today.month, month_end_day)

    bdays = []
    current = start
    while current <= month_end:
        if current.weekday() in work_days:
            bdays.append(current)
        current += timedelta(days=1)

    return bdays


def train_xgboost_for_ticker(ticker, force_lstm=False):
    import pandas as pd
    import numpy as np
    import os
    import sys
    import joblib
    from datetime import datetime, timedelta, timezone
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import text
    from sklearn.preprocessing import MinMaxScaler
    from xgboost import XGBRegressor
    from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
    from tensorflow.keras.models import load_model, Sequential
    from tensorflow.keras.layers import LSTM, Dense, Input, Dropout
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

    # Use globals from the module instead of re-importing
    from preparedata import Stock, ModelMetric
    from model_training import get_engine, get_remaining_business_days
    from prediction_models import PricePrediction

    engine = get_engine()
    Session = sessionmaker(bind=engine)
    
    try:
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
            return {"ticker": ticker, "status": "skip", "msg": f"Not enough data ({len(df)} rows)"}

        df["date"] = pd.to_datetime(df["date"])
        df.set_index("date", inplace=True)
        print(f"[{ticker}] Raw data: {len(df)} rows. Date range: {df.index.min()} to {df.index.max()}")

        # Engineer additional features before dropping NaNs
        df = engineer_features(df)
        df.dropna(inplace=True)
        print(f"[{ticker}] After features & dropna: {len(df)} rows. Date range: {df.index.min()} to {df.index.max()}")

        if len(df) < LOOK_BACK + 20:
            return {"ticker": ticker, "status": "skip", "msg": f"Not enough data after feature engineering ({len(df)} rows)"}

        ticker_dir = os.path.join(MODEL_DIR, ticker)
        os.makedirs(ticker_dir, exist_ok=True)

        lstm_path   = os.path.join(ticker_dir, "lstm_model.h5")
        scaler_path = os.path.join(ticker_dir, "scaler.pkl")
        marker_path = os.path.join(ticker_dir, "lstm_trained_at.txt")
        
        needs_lstm = True
        if os.path.exists(marker_path):
            with open(marker_path) as f:
                ts = datetime.fromisoformat(f.read().strip())
            needs_lstm = (datetime.now(timezone.utc).replace(tzinfo=None) - ts).days >= 7

        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled = scaler.fit_transform(df[["close"]])

        if force_lstm or needs_lstm or not os.path.exists(lstm_path):
            print(f"[{ticker}] Training NEW LSTM model...")
            X_all, y_all = _build_sequences(scaled, LOOK_BACK)
            if len(X_all) == 0: return {"ticker": ticker, "status": "skip", "msg": "Sequence build failed"}
            train_n_lstm = len(X_all)
            X_train_lstm = X_all[:train_n_lstm].reshape(-1, LOOK_BACK, 1)
            y_train_lstm = y_all[:train_n_lstm]
            
            lstm_model = _build_lstm(LOOK_BACK)
            early_stop = EarlyStopping(
                monitor="val_loss", patience=8, restore_best_weights=True, verbose=0
            )
            reduce_lr = ReduceLROnPlateau(
                monitor="val_loss", factor=0.5, patience=4, verbose=0, min_lr=1e-6
            )
            lstm_model.fit(
                X_train_lstm, y_train_lstm,
                batch_size=32, epochs=50, verbose=0,
                validation_split=0.1,
                callbacks=[early_stop, reduce_lr]
            )
            lstm_model.save(lstm_path)
            joblib.dump(scaler, scaler_path)
            with open(marker_path, "w") as f: f.write(datetime.now(timezone.utc).replace(tzinfo=None).isoformat())
            print(f"[{ticker}] LSTM model saved.")
        else:
            print(f"[{ticker}] Using existing LSTM model.")
            from tensorflow.keras.models import load_model
            lstm_model = load_model(lstm_path, compile=False)
            scaler = joblib.load(scaler_path)

        print(f"[{ticker}] Generating residual targets via LSTM...")
        X_full, _ = _build_sequences(scaled, LOOK_BACK)
        X_full_seq = X_full.reshape(-1, LOOK_BACK, 1)
        lstm_full_pred_scaled = lstm_model.predict(X_full_seq, verbose=0)
        lstm_full_pred = scaler.inverse_transform(lstm_full_pred_scaled).flatten()
        
        train_n = len(X_full)
        lstm_train_pred = lstm_full_pred
        
        train_actual = df["close"].iloc[LOOK_BACK: LOOK_BACK + train_n].values
        train_res = train_actual - lstm_train_pred
        X_feat_train = df[FEATURE_COLS].iloc[LOOK_BACK - 1 : LOOK_BACK + train_n - 1]
        
        print(f"[{ticker}] Training XGBoost corrector...")
        hybrid = XGBRegressor(
            n_estimators=400,
            learning_rate=0.03,
            max_depth=4,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.5,
            min_child_weight=3,
            tree_method="hist",
            n_jobs=1,
            early_stopping_rounds=30,
            eval_metric="rmse"
        )
        # Split train data for XGBoost early stopping
        xgb_val_size = max(10, int(len(X_feat_train) * 0.1))
        hybrid.fit(
            X_feat_train.iloc[:-xgb_val_size], train_res[:-xgb_val_size],
            eval_set=[(X_feat_train.iloc[-xgb_val_size:], train_res[-xgb_val_size:])],
            verbose=False
        )
        hybrid.save_model(os.path.join(ticker_dir, "hybrid_corrector.json"))

        # ── Backtest rows (is_test_set=True) ────────────────────────────────
        use_n = min(len(X_full), LOOK_BACK)
        test_start_idx = LOOK_BACK + len(X_full) - use_n
        
        test_actual = df["close"].iloc[test_start_idx:].values[:use_n]
        test_dates  = df.index[test_start_idx:][:use_n]
        X_feat_test = df[FEATURE_COLS].iloc[test_start_idx - 1 : test_start_idx + use_n - 1]
        
        lstm_test_slice = lstm_full_pred[-use_n:]
        hybrid_corr = hybrid.predict(X_feat_test)
        test_preds  = lstm_test_slice + hybrid_corr

        mape    = float(mean_absolute_percentage_error(test_actual, test_preds))
        rmse    = float(np.sqrt(mean_squared_error(test_actual, test_preds)))
        dir_acc = float(np.mean((np.diff(test_actual) > 0) == (np.diff(test_preds) > 0)) * 100) if len(test_actual) > 1 else 0.0

        # ── Monthly forward predictions (is_test_set=False) ─────────────────
        last_date    = df.index[-1].date()
        last_feat    = df[FEATURE_COLS].iloc[[-1]]
        curr_price   = float(df["close"].iloc[-1])

        business_days = get_remaining_business_days(last_date, ticker)
        print(f"[{ticker}] Generating {len(business_days)} forward predictions for rest of month...")

        # Current month tag e.g. "2026-06"
        today_utc     = datetime.now(timezone.utc)
        pred_month    = today_utc.strftime("%Y-%m")

        # Iterative multi-step forecast
        current_seq  = scaled.copy()        # shape (N, 1)
        current_feat = df[FEATURE_COLS].values[-1].copy()  # last known features

        monthly_preds = []   # list of (pred_date, predicted_price, change_pct, direction)
        prev_price    = curr_price

        for pred_date in business_days:
            seq_input  = current_seq[-LOOK_BACK:].reshape(1, LOOK_BACK, 1)
            lstm_scaled = lstm_model.predict(seq_input, verbose=0)
            lstm_price  = float(scaler.inverse_transform(lstm_scaled)[0][0])

            # XGBoost correction uses last known features
            xgb_corr   = float(hybrid.predict(last_feat)[0])
            final_price = round(lstm_price + xgb_corr, 4)

            chg_pct    = round(((final_price - prev_price) / prev_price) * 100, 4) if prev_price else 0.0
            direction  = "bullish" if chg_pct > 0 else ("bearish" if chg_pct < 0 else "neutral")

            monthly_preds.append((pred_date, final_price, chg_pct, direction))

            # Roll the sequence: append new scaled prediction, drop oldest
            new_scaled  = scaler.transform([[final_price]])
            current_seq = np.vstack([current_seq, new_scaled])
            prev_price  = final_price

        # ── Database writes ──────────────────────────────────────────────────
        session = Session()
        try:
            stock = session.query(Stock).filter(Stock.symbol == ticker).one()

            # Update model metrics
            metric = session.query(ModelMetric).filter(
                ModelMetric.stock_id == stock.stock_id,
                ModelMetric.model_type == "Hybrid"
            ).one_or_none()
            if not metric:
                metric = ModelMetric(stock_id=stock.stock_id, model_type="Hybrid")
                session.add(metric)
            metric.rmse               = round(rmse, 4)
            metric.mape               = round(mape, 4)
            metric.directional_accuracy = round(dir_acc, 2)
            metric.created_at         = datetime.now(timezone.utc)

            # Preserve rows where actual_price was already filled in (real history)
            true_history_dates = {
                r.prediction_date
                for r in session.query(PricePrediction.prediction_date).filter(
                    PricePrediction.stock_id == stock.stock_id,
                    PricePrediction.is_test_set == False,
                    PricePrediction.actual_price != None
                ).all()
            }

            # Delete old backtest rows + old future predictions (this month)
            session.query(PricePrediction).filter(
                PricePrediction.stock_id == stock.stock_id,
                (PricePrediction.is_test_set == True) |
                (
                    (PricePrediction.is_test_set == False) &
                    (PricePrediction.actual_price == None)
                )
            ).delete()

            now_utc    = datetime.now(timezone.utc)
            to_insert  = []

            # Backtest rows
            for i in range(use_n):
                d = test_dates[i].date()
                if d in true_history_dates:
                    continue
                pred_p, act_p = float(test_preds[i]), float(test_actual[i])
                prev_p = float(test_actual[i-1]) if i > 0 else act_p
                chg    = round(((pred_p - prev_p) / prev_p) * 100, 4) if prev_p else 0.0
                to_insert.append(PricePrediction(
                    stock_id=stock.stock_id, prediction_date=d,
                    predicted_price=pred_p, actual_price=act_p,
                    confidence=round(dir_acc, 2),
                    direction=("bullish" if chg > 0 else "bearish"),
                    change_percent=chg, model_type="Hybrid",
                    trained_at=now_utc, is_test_set=True,
                    prediction_month=pred_month
                ))

            # Monthly forward predictions
            for pred_date, final_price, chg_pct, direction in monthly_preds:
                to_insert.append(PricePrediction(
                    stock_id=stock.stock_id, prediction_date=pred_date,
                    predicted_price=final_price, actual_price=None,
                    confidence=round(dir_acc, 2),
                    direction=direction, change_percent=chg_pct,
                    model_type="Hybrid", trained_at=now_utc,
                    is_test_set=False, prediction_month=pred_month
                ))

            session.bulk_save_objects(to_insert)
            session.commit()
            print(f"[{ticker}] Saved {len(monthly_preds)} monthly predictions + {use_n} backtest rows.")
            return {"ticker": ticker, "status": "ok", "msg": f"success — {len(monthly_preds)} forward days"}
        except Exception as e:
            session.rollback()
            return {"ticker": ticker, "status": "error", "msg": str(e)}
        finally:
            session.close()
            try:
                import tensorflow as tf
                tf.keras.backend.clear_session()
            except: pass

    except Exception as e:
        return {"ticker": ticker, "status": "error", "msg": str(e)}

def run_daily(tickers: list, workers: int = 1, force_lstm: bool = False):
    from concurrent.futures import ProcessPoolExecutor, as_completed
    results = {"ok": [], "skip": [], "error": []}
    if workers > 1:
        with ProcessPoolExecutor(max_workers=workers) as pool:
            futures = {pool.submit(train_xgboost_for_ticker, t, force_lstm=force_lstm): t for t in tickers}
            for fut in as_completed(futures):
                r = fut.result()
                if r["status"] == "error":
                    print(f"[ERROR] {r['ticker']}: {r.get('msg', 'unknown')}")
                results[r["status"]].append(r["ticker"])
    else:
        for t in tickers:
            r = train_xgboost_for_ticker(t, force_lstm=force_lstm)
            if r["status"] == "error":
                print(f"[ERROR] {r['ticker']}: {r.get('msg', 'unknown')}")
            results[r["status"]].append(r["ticker"])
    return results

def get_stocks_needing_training(tickers: list) -> list:
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    session = Session()
    needing = []
    today = datetime.now(timezone.utc).date()
    current_month = today.strftime("%Y-%m")
    try:
        for t in tickers:
            # Check if we already have forward predictions for this month
            res_month = session.execute(text(
                """SELECT COUNT(*) FROM price_predictions pp
                   JOIN stocks s ON s.stock_id = pp.stock_id
                   WHERE s.symbol = :t AND pp.is_test_set = false
                     AND pp.prediction_month = :month AND pp.actual_price IS NULL"""
            ), {"t": t, "month": current_month}).scalar()

            if res_month and res_month > 0:
                print(f"Skipping {t}: Already has {res_month} forward predictions for {current_month}.")
                continue

            res_h = session.execute(text(
                "SELECT MAX(date) FROM price_history ph JOIN stocks s ON s.stock_id = ph.stock_id WHERE s.symbol = :t"
            ), {"t": t}).scalar()

            if not res_h:
                print(f"Skipping {t}: No price history found.")
                continue

            needing.append(t)
        return needing
    finally:
        session.close()

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbols", nargs="*", default=None)
    parser.add_argument("--skip-trained-today", action="store_true")
    parser.add_argument("--force-lstm", action="store_true")
    parser.add_argument("--workers", type=int, default=1)
    args = parser.parse_args()

    create_tables()
    all_tickers = get_all_tickers()
    tickers = [t for t in all_tickers if t in [s.upper() for s in args.symbols]] if args.symbols else all_tickers
    if args.skip_trained_today:
        tickers = get_stocks_needing_training(tickers)
    
    if not tickers:
        print("All stocks already have monthly predictions for this month.")
        return

    print(f"Training {len(tickers)} stocks (Force LSTM: {args.force_lstm})...")
    results = run_daily(tickers, workers=args.workers, force_lstm=args.force_lstm)
    print(f"Done! OK: {len(results['ok'])} | Skipped: {len(results['skip'])} | Errors: {len(results['error'])}")
    if results['error']:
        print("[FAILED STOCKS]:")
        for t in results['error']:
            print(f"  - {t}")

if __name__ == "__main__":
    main()
