import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from concurrent.futures import ProcessPoolExecutor, as_completed

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
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
load_dotenv(os.path.join(_root, ".env"))
load_dotenv(os.path.join(_backend, ".env"))

MODEL_DIR   = os.path.join(_root, "trained_models")
LOOK_BACK   = 60
TRAIN_SPLIT = 0.8
FEATURE_COLS = ["rsi", "macd", "macd_signal", "sma_20", "sma_50", "volume"]

def get_engine():
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
    return create_engine(db_url, echo=False)

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
        LSTM(50, return_sequences=True),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1),
    ])
    m.compile(optimizer="adam", loss="mean_squared_error")
    return m

def train_xgboost_for_ticker(ticker: str) -> dict:
    import os, sys, joblib, numpy as np, pandas as pd
    from datetime import datetime, timedelta, timezone
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
    from xgboost import XGBRegressor

    _root = os.path.dirname(os.path.abspath(__file__))
    _backend = os.path.join(_root, "backend")
    sys.path.insert(0, _root)
    sys.path.insert(0, _backend)

    from model_training import get_engine, _build_sequences, _build_lstm, LOOK_BACK, TRAIN_SPLIT, MODEL_DIR, FEATURE_COLS
    from preparedata import Stock, ModelMetric
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
        df.dropna(inplace=True)

        ticker_dir = os.path.join(MODEL_DIR, ticker)
        os.makedirs(ticker_dir, exist_ok=True)

        lstm_path = os.path.join(ticker_dir, "lstm_model.h5")
        scaler_path = os.path.join(ticker_dir, "scaler.pkl")
        marker_path = os.path.join(ticker_dir, "lstm_trained_at.txt")
        
        needs_lstm = True
        if os.path.exists(marker_path):
            with open(marker_path) as f:
                ts = datetime.fromisoformat(f.read().strip())
            needs_lstm = (datetime.utcnow() - ts).days >= 7

        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled = scaler.fit_transform(df[["close"]])

        if needs_lstm or not os.path.exists(lstm_path):
            X_all, y_all = _build_sequences(scaled, LOOK_BACK)
            if len(X_all) == 0: return {"ticker": ticker, "status": "skip", "msg": "Sequence build failed"}
            train_n_lstm = int(len(X_all) * TRAIN_SPLIT)
            X_train_lstm = X_all[:train_n_lstm].reshape(-1, LOOK_BACK, 1)
            y_train_lstm = y_all[:train_n_lstm]
            
            lstm_model = _build_lstm(LOOK_BACK)
            lstm_model.fit(X_train_lstm, y_train_lstm, batch_size=32, epochs=10, verbose=0)
            lstm_model.save(lstm_path)
            joblib.dump(scaler, scaler_path)
            with open(marker_path, "w") as f: f.write(datetime.utcnow().isoformat())
        else:
            lstm_model = load_model(lstm_path, compile=False)
            scaler = joblib.load(scaler_path)

        X_full, _ = _build_sequences(scaled, LOOK_BACK)
        X_full_seq = X_full.reshape(-1, LOOK_BACK, 1)
        lstm_full_pred_scaled = lstm_model.predict(X_full_seq, verbose=0)
        lstm_full_pred = scaler.inverse_transform(lstm_full_pred_scaled).flatten()
        
        train_n = int(len(X_full) * TRAIN_SPLIT)
        lstm_train_pred = lstm_full_pred[:train_n]
        
        train_actual = df["close"].iloc[LOOK_BACK: LOOK_BACK + train_n].values
        train_res = train_actual - lstm_train_pred
        X_feat_train = df[FEATURE_COLS].iloc[LOOK_BACK - 1 : LOOK_BACK + train_n - 1]
        
        hybrid = XGBRegressor(n_estimators=500, learning_rate=0.05, tree_method="hist", n_jobs=1)
        hybrid.fit(X_feat_train, train_res)
        hybrid.save_model(os.path.join(ticker_dir, "hybrid_corrector.json"))

        n_test = len(X_full) - train_n
        use_n = min(n_test, LOOK_BACK)
        test_start_idx = LOOK_BACK + train_n + (n_test - use_n)
        
        test_actual = df["close"].iloc[test_start_idx:].values[:use_n]
        test_dates = df.index[test_start_idx:][:use_n]
        X_feat_test = df[FEATURE_COLS].iloc[test_start_idx - 1 : test_start_idx + use_n - 1]
        
        lstm_test_slice = lstm_full_pred[train_n + (n_test - use_n):]
        hybrid_corr = hybrid.predict(X_feat_test)
        test_preds = lstm_test_slice + hybrid_corr

        mape = float(mean_absolute_percentage_error(test_actual, test_preds))
        rmse = float(np.sqrt(mean_squared_error(test_actual, test_preds)))
        dir_acc = float(np.mean((np.diff(test_actual) > 0) == (np.diff(test_preds) > 0)) * 100) if len(test_actual) > 1 else 0.0

        last_seq = scaled[-LOOK_BACK:].reshape(1, LOOK_BACK, 1)
        lstm_next = float(scaler.inverse_transform(lstm_model.predict(last_seq, verbose=0))[0][0])
        last_feat = df[FEATURE_COLS].iloc[[-1]]
        corr_next = float(hybrid.predict(last_feat)[0])
        next_price = round(lstm_next + corr_next, 4)
        
        curr_price = float(df["close"].iloc[-1])
        chg_pct = round(((next_price - curr_price) / curr_price) * 100, 4) if curr_price else 0.0
        direction = "bullish" if chg_pct > 0 else ("bearish" if chg_pct < 0 else "neutral")
        
        last_date = df.index[-1].date()
        pred_date = last_date + timedelta(days=1)
        is_saudi = ticker.endswith(".SR")
        if is_saudi:
            while pred_date.weekday() in [4, 5]: pred_date += timedelta(days=1)
        else:
            while pred_date.weekday() in [5, 6]: pred_date += timedelta(days=1)

        session = Session()
        try:
            stock = session.query(Stock).filter(Stock.symbol == ticker).one()
            metric = session.query(ModelMetric).filter(ModelMetric.stock_id == stock.stock_id, ModelMetric.model_type == "Hybrid").one_or_none()
            if not metric:
                metric = ModelMetric(stock_id=stock.stock_id, model_type="Hybrid")
                session.add(metric)
            metric.rmse, metric.mape, metric.directional_accuracy = round(rmse,4), round(mape,4), round(dir_acc,2)

            true_history_dates = {r.prediction_date for r in session.query(PricePrediction.prediction_date).filter(
                PricePrediction.stock_id == stock.stock_id, PricePrediction.is_test_set == False, PricePrediction.actual_price != None
            ).all()}

            session.query(PricePrediction).filter(
                PricePrediction.stock_id == stock.stock_id, (PricePrediction.is_test_set == True) | (PricePrediction.actual_price == None)
            ).delete()

            now_utc = datetime.now(timezone.utc)
            to_insert = []
            
            for i in range(use_n):
                d = test_dates[i].date()
                if d in true_history_dates: continue
                pred_p, act_p = float(test_preds[i]), float(test_actual[i])
                prev_p = float(test_actual[i-1]) if i > 0 else act_p
                chg = round(((pred_p - prev_p)/prev_p)*100, 4) if prev_p else 0.0
                to_insert.append(PricePrediction(
                    stock_id=stock.stock_id, prediction_date=d, predicted_price=pred_p, actual_price=act_p,
                    confidence=round(dir_acc, 2), direction=("bullish" if chg > 0 else "bearish"),
                    change_percent=chg, model_type="Hybrid", trained_at=now_utc, is_test_set=True
                ))

            to_insert.append(PricePrediction(
                stock_id=stock.stock_id, prediction_date=pred_date, predicted_price=next_price, actual_price=None,
                confidence=round(dir_acc, 2), direction=direction, change_percent=chg_pct,
                model_type="Hybrid", trained_at=now_utc, is_test_set=False
            ))
            session.bulk_save_objects(to_insert)
            session.commit()
            return {"ticker": ticker, "status": "ok", "msg": "success"}
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

def run_daily(tickers: list, workers: int = 4):
    results = {"ok": [], "skip": [], "error": []}
    with ProcessPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(train_xgboost_for_ticker, t): t for t in tickers}
        for fut in as_completed(futures):
            r = fut.result()
            results[r["status"]].append(r["ticker"])
    return results

def get_stocks_needing_training(tickers: list) -> list:
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    session = Session()
    needing = []
    try:
        for t in tickers:
            res_h = session.execute(text("SELECT MAX(date) FROM price_history ph JOIN stocks s ON s.stock_id = ph.stock_id WHERE s.symbol = :t"), {"t": t}).scalar()
            res_p = session.execute(text("SELECT MAX(trained_at) FROM price_predictions pp JOIN stocks s ON s.stock_id = pp.stock_id WHERE s.symbol = :t"), {"t": t}).scalar()
            if res_h and (not res_p or res_h >= res_p.date()): needing.append(t)
        return needing
    finally: session.close()

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbols", nargs="*", default=None)
    parser.add_argument("--skip-trained-today", action="store_true")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    create_tables()
    all_tickers = get_all_tickers()
    tickers = [t for t in all_tickers if t in [s.upper() for s in args.symbols]] if args.symbols else all_tickers
    if args.skip_trained_today: tickers = get_stocks_needing_training(tickers)
    
    if not tickers:
        print("All stocks up to date.")
        return

    print(f"Training {len(tickers)} stocks...")
    results = run_daily(tickers, workers=args.workers)
    print(f"Done! OK: {len(results['ok'])} | Errors: {len(results['error'])}")

if __name__ == "__main__":
    main()
