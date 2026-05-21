"""
model_training.py
=================
EyeStocks AI — Improved Hybrid Stock Prediction Pipeline
=========================================================

Architecture
------------
  1. GLOBAL BiLSTM (ml/global_model.py)
       - Trained on ALL stocks simultaneously
       - Predicts percentage return: (close[t+1] - close[t]) / close[t]
       - Bidirectional, Huber loss, RobustScaler (train-only fit)
       - Retrained monthly (--force-lstm triggers full rebuild)

  2. Per-stock XGBoost residual corrector
       - Trained on: residual = actual_return - lstm_predicted_return
       - Final prediction: lstm_return + xgb_correction → price

Prediction quality improvements
--------------------------------
  * Return-based target eliminates price-level scale drift
  * Iterative multi-step rollout uses return accumulation (no flat-line)
  * Composite confidence score: volatility + ensemble agreement + history
  * Trend signal: BUY / HOLD / SELL based on predicted return + confidence

CLI usage
---------
  python model_training.py [--symbols AAPL MSFT] [--force-lstm]
                           [--monthly-retrain] [--workers N]
                           [--skip-trained-today]
"""

import os
import sys
import calendar
import json
import time
from datetime import datetime, timedelta, timezone, date
from pathlib import Path

import numpy as np
import pandas as pd
import joblib

try:
    import torch
    _TORCH_AVAILABLE = True
except ImportError:
    _TORCH_AVAILABLE = False
    print("[WARN] PyTorch not installed. Model training will fail.")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ─── Path setup ───────────────────────────────────────────────────────────────

_ROOT    = Path(__file__).resolve().parent
_BACKEND = _ROOT / "backend"
sys.path.insert(0, str(_ROOT))
sys.path.insert(0, str(_BACKEND))

from dotenv import load_dotenv
load_dotenv(_BACKEND / ".env")
load_dotenv(_ROOT / ".env", override=True)

# ─── ML sub-modules ───────────────────────────────────────────────────────────

from ml.feature_engineering import (
    engineer_all_features,
    build_return_target,
    clip_outlier_returns,
    get_feature_matrix,
    ALL_FEATURE_COLS,
)
from ml.market_context import get_market_context_for_ticker
from ml.global_model import (
    train_global_model,
    load_global_model,
    predict_return,
    is_model_stale,
    LOOK_BACK,
    MAX_RETURN,
    GLOBAL_DIR,
)
from ml.training_logger import get_logger

# ─── Constants ────────────────────────────────────────────────────────────────

MODEL_DIR   = _ROOT / "trained_models"
TRAIN_SPLIT = 0.80      # 80 % train, 10 % val, 10 % test (within model)
# LOOK_BACK is imported from ml.global_model and re-exported for backward compat
# (value = 60 timesteps)

# Feature columns sent to XGBoost (superset of model input)
XGB_FEATURE_COLS = ALL_FEATURE_COLS + ["ticker_id"]

# ─── Database helpers ─────────────────────────────────────────────────────────

def get_engine():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        import urllib.parse
        pw = urllib.parse.quote_plus(os.getenv("PG_PASS", "your_db_password"))
        db_url = (
            f"postgresql+psycopg2://{os.getenv('PG_USER','your_db_user')}:{pw}"
            f"@{os.getenv('PG_HOST','localhost')}:{os.getenv('PG_PORT','5432')}"
            f"/{os.getenv('PG_DB','your_db_name')}"
        )
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif "postgresql://" in db_url and "+psycopg2" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    return create_engine(
        db_url,
        echo=False,
        pool_size=10,
        max_overflow=5,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
    )


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


def _load_ticker_df(ticker: str, engine) -> pd.DataFrame:
    """
    Load OHLCV + stored technical indicators for a single ticker from DB.
    Returns a DataFrame indexed by date, sorted ascending.
    """
    query = f"""
        SELECT
            ph.date, ph.open, ph.high, ph.low, ph.close, ph.volume,
            ti.rsi, ti.macd, ti.macd_signal,
            ti.sma_20, ti.sma_50,
            ti.ema_20, ti.ema_50,
            ti.bollinger_upper, ti.bollinger_lower
        FROM price_history ph
        JOIN technical_indicator ti
          ON ph.stock_id = ti.stock_id AND ph.date = ti.date
        JOIN stocks s ON ph.stock_id = s.stock_id
        WHERE s.symbol = '{ticker}'
        ORDER BY ph.date ASC
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return df
    df["date"] = pd.to_datetime(df["date"])
    df.set_index("date", inplace=True)
    return df


# ─── Business days ────────────────────────────────────────────────────────────

def get_remaining_business_days(last_date: date, ticker: str) -> list[date]:
    """
    Return business day dates from last_date+1 to end of current calendar month.
    Saudi tickers (.SR): Sun–Thu; all others: Mon–Fri.
    """
    is_saudi = ticker.upper().endswith(".SR")
    work_days = {6, 0, 1, 2, 3} if is_saudi else {0, 1, 2, 3, 4}

    today = datetime.now(timezone.utc).date()
    start = max(last_date + timedelta(days=1), today)
    _, month_end_day = calendar.monthrange(today.year, today.month)
    month_end = date(today.year, today.month, month_end_day)

    bdays, current = [], start
    while current <= month_end:
        if current.weekday() in work_days:
            bdays.append(current)
        current += timedelta(days=1)
    return bdays


# ─── Confidence & signal helpers ──────────────────────────────────────────────

def compute_confidence(
    recent_returns: np.ndarray,
    lstm_return: float,
    xgb_correction: float,
    historical_dir_acc: float,
    vix_level: float = 0.15,
    prediction_variance: float = 0.0,
) -> float:
    """
    Phase 5: Dynamic Confidence Scoring
    """
    recent_std = float(np.std(recent_returns)) if len(recent_returns) > 1 else 0.02
    
    # 1. Volatility regime score (30%)
    vol_regime = min(1.0, 0.02 / max(recent_std, 1e-9))
    vix_score  = max(0.0, 1.0 - (vix_level - 0.10) * 2.0)
    vol_score  = (vol_regime + vix_score) / 2.0
    
    # 2. Ensemble agreement (25%)
    denom = abs(lstm_return) + abs(xgb_correction) + 1e-9
    ensemble_diff = abs(lstm_return - (-xgb_correction)) / denom
    ensemble_score = max(0.0, 1.0 - ensemble_diff)
    if (lstm_return > 0) == (xgb_correction > 0):
        ensemble_score = min(1.0, ensemble_score + 0.2)

    # 3. Historical accuracy (20%)
    hist_score = max(0.0, min(1.0, historical_dir_acc / 100.0))
    
    # 4. Return magnitude (15%) - larger return = higher conviction
    mag_score = min(1.0, abs(lstm_return + xgb_correction) / 0.02)
    
    # 5. Prediction consistency (10%) - low variance across multi-step
    consist_score = min(1.0, 0.01 / max(prediction_variance, 1e-9))
    
    raw = (0.30 * vol_score) + (0.25 * ensemble_score) + (0.20 * hist_score) + (0.15 * mag_score) + (0.10 * consist_score)
    confidence = 40.0 + raw * 52.0
    return round(min(92.0, max(40.0, confidence)), 2)


def return_to_signal(predicted_return: float, confidence: float) -> str:
    """
    Generate BUY / HOLD / SELL signal.

    Rules:
      - |predicted_return| < 0.5 % or confidence < 55 → HOLD (weak signal)
      - predicted_return >  0.5 % and confidence >= 55 → bullish
      - predicted_return < -0.5 % and confidence >= 55 → bearish
    """
    threshold = 0.005   # 0.5 %
    if confidence < 55 or abs(predicted_return) < threshold:
        return "neutral"
    return "bullish" if predicted_return > 0 else "bearish"


# ─── Evaluation metrics ───────────────────────────────────────────────────────

def compute_metrics(
    actual_returns: np.ndarray,
    predicted_returns: np.ndarray,
    actual_prices: np.ndarray,
    predicted_prices: np.ndarray,
) -> dict:
    """
    Phase 6: Expanded Evaluation Metrics
    """
    eps = 1e-9
    mae  = float(np.mean(np.abs(actual_returns - predicted_returns)))
    rmse = float(np.sqrt(np.mean((actual_returns - predicted_returns) ** 2)))

    # MAPE on reconstructed prices
    mape = float(np.mean(
        np.abs((actual_prices - predicted_prices) / (np.abs(actual_prices) + eps))
    ) * 100)

    trend_acc = 50.0
    vol_sens  = 0.0
    
    if len(actual_returns) > 1:
        actual_dirs    = actual_returns > 0
        predicted_dirs = predicted_returns > 0
        dir_acc = float(np.mean(actual_dirs == predicted_dirs) * 100)
        
        # Trend accuracy (3+ day streaks)
        streaks_correct = 0
        streak_total = 0
        for i in range(len(actual_returns) - 2):
            if actual_dirs[i] == actual_dirs[i+1] == actual_dirs[i+2]:
                streak_total += 1
                if predicted_dirs[i] == actual_dirs[i] and predicted_dirs[i+1] == actual_dirs[i+1] and predicted_dirs[i+2] == actual_dirs[i+2]:
                    streaks_correct += 1
        if streak_total > 0:
            trend_acc = float((streaks_correct / streak_total) * 100)
            
        # Volatility sensitivity (correlation of absolute returns)
        abs_act = np.abs(actual_returns)
        abs_pred = np.abs(predicted_returns)
        if np.std(abs_act) > 0 and np.std(abs_pred) > 0:
            vol_sens = float(np.corrcoef(abs_act, abs_pred)[0, 1])
    else:
        dir_acc = 50.0

    return {
        "mae":               round(mae,  6),
        "rmse":              round(rmse, 6),
        "mape":              round(mape, 4),
        "direction_accuracy": round(dir_acc, 2),
        "trend_accuracy":    round(trend_acc, 2),
        "volatility_sensitivity": round(vol_sens, 4),
    }


# ─── Per-stock XGBoost residual trainer ──────────────────────────────────────

def train_xgboost_for_ticker(ticker: str, force_lstm: bool = False, monthly_retrain: bool = False):
    """
    Main training entry point for a single ticker.

    Steps:
    1.  Load OHLCV + indicator data from DB.
    2.  Engineer features (leak-free).
    3.  Load / train the global BiLSTM.
    4.  Generate LSTM return predictions for the full history.
    5.  Compute residuals = actual_return − lstm_pred_return.
    6.  Train per-stock XGBoost on the residuals.
    7.  Evaluate on held-out test set.
    8.  Generate iterative forward predictions for rest of month.
    9.  Persist results to DB.
    """
    from xgboost import XGBRegressor
    from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

    logger = get_logger()
    logger.log_training_start(ticker)
    t0 = time.time()

    try:
        engine = get_engine()

        # ── 1. Load data ──────────────────────────────────────────────────────
        df = _load_ticker_df(ticker, engine)
        if df.empty or len(df) < LOOK_BACK + 30:
            return {"ticker": ticker, "status": "skip",
                    "msg": f"Not enough data ({len(df)} rows)"}

        # ── 2. Feature engineering ────────────────────────────────────────────
        # Phase 1: Market Context Integration
        ctx_df = get_market_context_for_ticker(df, ticker)
        for col in ctx_df.columns:
            df[col] = ctx_df[col]
            
        df = engineer_all_features(df)

        # Add ticker_id (normalised) — will be loaded from encoder later
        df["ticker_id"] = 0.0     # placeholder; overwritten after encoder loads

        # Build return target
        df["_target"] = build_return_target(df)
        df["_target"] = clip_outlier_returns(df["_target"], n_std=5.0)

        # Drop NaN rows from warmup periods (where feature columns are NaN), but KEEP the last row with no target
        df.dropna(subset=ALL_FEATURE_COLS, inplace=True)

        if len(df) < LOOK_BACK + 20:
            return {"ticker": ticker, "status": "skip",
                    "msg": f"Insufficient rows after feature engineering ({len(df)})"}

        print(f"[{ticker}] Data ready: {len(df)} rows "
              f"({df.index.min().date()} -> {df.index.max().date()})", flush=True)

        # ── 3. Load / train global model ──────────────────────────────────────
        need_global = force_lstm or monthly_retrain or is_model_stale(max_age_days=35)

        if need_global and _TORCH_AVAILABLE:
            print("[GlobalModel] Triggering global model training ...", flush=True)
            all_tickers = get_all_tickers()
            stock_data  = {}
            for t in all_tickers:
                t_df = _load_ticker_df(t, engine)
                if not t_df.empty:
                    ctx_df = get_market_context_for_ticker(t_df, t)
                    for col in ctx_df.columns:
                        t_df[col] = ctx_df[col]
                    t_df = engineer_all_features(t_df)
                    t_df["ticker_id"] = 0.0
                    t_df["_target"]   = build_return_target(t_df)
                    t_df["_target"]   = clip_outlier_returns(t_df["_target"])
                    t_df.dropna(subset=ALL_FEATURE_COLS + ["_target"], inplace=True)
                    if len(t_df) >= LOOK_BACK + 20:
                        stock_data[t] = t_df
            if stock_data:
                model, feature_scaler, ticker_encoder, meta = train_global_model(
                    stock_data=stock_data,
                    feature_cols=ALL_FEATURE_COLS,
                    look_back=LOOK_BACK,
                    force_retrain=True,
                )
            else:
                return {"ticker": ticker, "status": "error",
                        "msg": "No stock data available for global model training"}
        else:
            model, feature_scaler, ticker_encoder, meta = load_global_model()

        # Set ticker_id using the loaded encoder
        known_tickers = list(ticker_encoder.classes_)
        if ticker in known_tickers:
            t_id = float(ticker_encoder.transform([ticker])[0]) / max(len(known_tickers) - 1, 1)
        else:
            t_id = 0.0   # unseen ticker — use neutral encoding
        df["ticker_id"] = t_id

        # Add ticker_id to feature cols for XGBoost
        feat_cols_with_id = ALL_FEATURE_COLS + ["ticker_id"]

        # ── 4. Generate LSTM predictions on full history ──────────────────────
        print(f"[{ticker}] Generating LSTM return predictions ...", flush=True)
        feature_matrix = get_feature_matrix(df, ALL_FEATURE_COLS).values.astype(np.float32)
        scaled_matrix  = feature_scaler.transform(feature_matrix)

        lstm_returns = []
        lstm_dirs = []
        lstm_vols = []
        
        for i in range(LOOK_BACK, len(scaled_matrix)):
            window = scaled_matrix[i - LOOK_BACK : i]        # (LOOK_BACK, n_feat)
            r, d, v = predict_return(model, feature_scaler, feature_matrix[i - LOOK_BACK : i])
            lstm_returns.append(r)
            lstm_dirs.append(d)
            lstm_vols.append(v)

        lstm_returns = np.array(lstm_returns, dtype=np.float32)
        lstm_dirs = np.array(lstm_dirs, dtype=np.float32)
        lstm_vols = np.array(lstm_vols, dtype=np.float32)

        # Align with df: LSTM preds start at index LOOK_BACK
        actual_returns = df["_target"].values[LOOK_BACK:]     # (N,)
        actual_closes  = df["close"].values[LOOK_BACK:]       # (N,)

        if len(lstm_returns) != len(actual_returns):
            actual_returns = actual_returns[:len(lstm_returns)]
            actual_closes  = actual_closes[:len(lstm_returns)]

        # ── 5. Residual = actual_return − lstm_return ──────────────────────────
        residuals = actual_returns - lstm_returns              # XGBoost target

        # Phase 3: XGBoost Feature Enrichment
        xgb_df = get_feature_matrix(df, feat_cols_with_id).iloc[LOOK_BACK:].copy()
        xgb_df["lstm_return_pred"] = lstm_returns
        xgb_df["lstm_dir_pred"]    = lstm_dirs
        xgb_df["lstm_vol_pred"]    = lstm_vols
        xgb_df["lstm_abs_return"]  = np.abs(lstm_returns)
        xgb_df["recent_error"]     = np.abs(residuals)
        xgb_df["recent_error_5"]   = xgb_df["recent_error"].rolling(5, min_periods=1).mean().shift(1).fillna(0)
        xgb_df["recent_pred_std"]  = xgb_df["lstm_return_pred"].rolling(5, min_periods=1).std().shift(1).fillna(0)
        xgb_df.drop(columns=["recent_error"], inplace=True)
        
        # We need the full expanded columns for inference
        X_feat_full = xgb_df.values

        # Train / test split for evaluation
        n_total  = len(residuals)
        n_train  = int(n_total * TRAIN_SPLIT)
        n_test   = n_total - n_train

        X_feat_train = X_feat_full[:n_train]
        X_feat_test  = X_feat_full[n_train:]
        res_train    = residuals[:n_train]
        res_test     = residuals[n_train:]

        # ── 6. Train XGBoost on residuals ─────────────────────────────────────
        print(f"[{ticker}] Training XGBoost residual corrector "
              f"(train={n_train}, test={n_test}) ...", flush=True)

        ticker_dir = MODEL_DIR / ticker
        ticker_dir.mkdir(parents=True, exist_ok=True)

        xgb_val_size = max(30, int(n_train * 0.15))
        xgb_model = XGBRegressor(
            n_estimators=150,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.75,
            reg_alpha=0.05,
            reg_lambda=1.0,
            min_child_weight=2,
            tree_method="hist",
            device="cuda" if _has_cuda() else "cpu",
            n_jobs=1,
            eval_metric="rmse",
        )
        xgb_model.fit(
            X_feat_train[:-xgb_val_size], res_train[:-xgb_val_size],
            eval_set=[(X_feat_train[-xgb_val_size:], res_train[-xgb_val_size:])],
            verbose=False,
        )
        xgb_model.save_model(str(ticker_dir / "xgb_residual.json"))

        # Log feature importance
        f_imp = xgb_model.feature_importances_
        cols = list(xgb_df.columns)
        top_indices = np.argsort(f_imp)[::-1][:5]
        top_features = {cols[i]: float(f_imp[i]) for i in top_indices if i < len(cols)}

        try:
            best_iter = xgb_model.best_iteration
        except AttributeError:
            best_iter = 150

        logger.log_xgb_training(
            ticker=ticker,
            n_estimators=best_iter,
            best_iteration=best_iter,
            val_rmse=0.0,
            feature_importance=top_features,
        )

        # ── 7. Evaluate on test slice ──────────────────────────────────────────
        xgb_test_preds = xgb_model.predict(X_feat_test)
        final_test_returns = lstm_returns[n_train:] + xgb_test_preds

        # Reconstruct prices from return chain
        test_start_close = float(df["close"].values[LOOK_BACK + n_train - 1])
        pred_prices, act_prices = _reconstruct_prices(
            predicted_returns=final_test_returns,
            actual_returns=res_test + lstm_returns[n_train:],   # = actual_returns[n_train:]
            start_close=test_start_close,
        )

        # Check if the last row of actual test returns is NaN (due to no future close for last day)
        # We only evaluate metrics on non-NaN actual returns
        eval_actual_returns = res_test + lstm_returns[n_train:]
        eval_predicted_returns = final_test_returns
        eval_actual_prices = np.array(act_prices)
        eval_predicted_prices = np.array(pred_prices)

        if len(eval_actual_returns) > 0 and np.isnan(eval_actual_returns[-1]):
            eval_actual_returns = eval_actual_returns[:-1]
            eval_predicted_returns = eval_predicted_returns[:-1]
            eval_actual_prices = eval_actual_prices[:-1]
            eval_predicted_prices = eval_predicted_prices[:-1]

        metrics = compute_metrics(
            actual_returns=eval_actual_returns,
            predicted_returns=eval_predicted_returns,
            actual_prices=eval_actual_prices,
            predicted_prices=eval_predicted_prices,
        )
        print(f"[{ticker}] Metrics: {metrics}", flush=True)
        logger.log_training_end(ticker, metrics, n_train_samples=n_train,
                                n_val_samples=n_test,
                                duration_seconds=time.time() - t0)
        logger.write_eval_report(ticker, metrics)

        dir_acc = metrics["direction_accuracy"]

        # ── 8. Forward predictions for rest of month ───────────────────────────
        last_date    = df.index[-1].date()
        business_days = get_remaining_business_days(last_date, ticker)
        print(f"[{ticker}] Generating {len(business_days)} forward predictions ...", flush=True)

        today_utc  = datetime.now(timezone.utc)
        pred_month = today_utc.strftime("%Y-%m")

        # Rolling window: last LOOK_BACK rows of feature matrix (unscaled)
        rolling_feats = feature_matrix[-LOOK_BACK:].copy()   # (LOOK_BACK, n_feat)
        prev_close    = float(df["close"].iloc[-1])
        
        # We need the last xgb row, but it has meta-features.
        xgb_last_row_df = xgb_df.iloc[-1:].copy()
        
        recent_returns = df["daily_return"].dropna().values[-20:]

        monthly_preds: list[tuple[date, float, float, str, float]] = []

        from ml.global_model import predict_returns
        lstm_preds_buffer = []
        lstm_dirs_buffer = []
        lstm_vols_buffer = []
        multi_preds = []

        for i, pred_date in enumerate(business_days):
            if len(lstm_preds_buffer) == 0:
                # Phase 4: get multi-step predictions
                p_ret, p_dir, p_vol = predict_returns(model, feature_scaler, rolling_feats)
                multi_preds = p_ret
                lstm_preds_buffer = list(p_ret)
                lstm_dirs_buffer = list(p_dir)
                lstm_vols_buffer = list(p_vol)
                
            lstm_ret = lstm_preds_buffer.pop(0)
            lstm_dir = lstm_dirs_buffer.pop(0)
            lstm_vol = lstm_vols_buffer.pop(0)
            
            # Reconstruct XGBoost meta-features for this step
            last_feat_row = xgb_last_row_df.values.copy()
            
            xgb_corr = float(xgb_model.predict(last_feat_row)[0])
            final_return = lstm_ret + xgb_corr
            final_return = float(np.clip(final_return, -MAX_RETURN, MAX_RETURN))

            final_price  = round(prev_close * (1.0 + final_return), 4)
            chg_pct      = round(final_return * 100, 4)
            
            # Phase 5: Confidence uses VIX and prediction variance
            try:
                vix_idx = ALL_FEATURE_COLS.index("vix_level")
                vix_val = float(rolling_feats[-1, vix_idx])
            except ValueError:
                vix_val = 0.15
                
            pred_var = float(np.std(multi_preds)) if len(multi_preds) > 0 else 0.0
            
            confidence   = compute_confidence(
                recent_returns=recent_returns,
                lstm_return=lstm_ret,
                xgb_correction=xgb_corr,
                historical_dir_acc=dir_acc,
                vix_level=vix_val,
                prediction_variance=pred_var,
            )
            direction    = return_to_signal(final_return, confidence)

            monthly_preds.append((pred_date, final_price, chg_pct, direction, confidence))

            logger.log_prediction(
                ticker=ticker,
                prediction_date=str(pred_date),
                predicted_return=final_return,
                predicted_price=final_price,
                confidence=confidence,
                direction=direction,
                lstm_return=lstm_ret,
                xgb_correction=xgb_corr,
            )

            # Roll the feature window forward (append a synthetic next row)
            new_row = rolling_feats[-1].copy()              # copy last row
            try:
                dr_idx = ALL_FEATURE_COLS.index("daily_return")
                new_row[dr_idx] = float(final_return)
            except ValueError:
                pass
            rolling_feats = np.vstack([rolling_feats[1:], new_row[np.newaxis, :]])
            prev_close = final_price
            recent_returns = np.append(recent_returns[1:], final_return)
            
            # Update XGBoost last row for next step
            # columns: ALL_FEATURE_COLS + ticker_id + lstm_return_pred, lstm_dir_pred, lstm_vol_pred, lstm_abs_return, recent_error_5, recent_pred_std
            xgb_last_row_df.iloc[0, :len(new_row)] = new_row
            xgb_last_row_df["lstm_return_pred"] = lstm_ret
            xgb_last_row_df["lstm_dir_pred"]    = lstm_dir
            xgb_last_row_df["lstm_vol_pred"]    = lstm_vol
            xgb_last_row_df["lstm_abs_return"]  = abs(lstm_ret)

        # ── 9. Backtest rows for chart overlay ────────────────────────────────
        use_n      = min(n_test, 90)
        test_dates = df.index[LOOK_BACK + n_total - use_n :][:use_n]
        bt_actual  = actual_closes[n_total - use_n:][:use_n]
        bt_preds_r = final_test_returns[-use_n:] if len(final_test_returns) >= use_n else final_test_returns

        # Reconstruct backtest predicted prices (non-compounded to avoid drift and align with actual prices)
        bt_pred_prices = []
        for i in range(use_n):
            prev_actual = float(df["close"].values[LOOK_BACK + n_total - use_n + i - 1])
            pred_return = float(bt_preds_r[i])
            bt_pred_prices.append(prev_actual * (1.0 + pred_return))

        # ── 10. Write to DB ────────────────────────────────────────────────────
        Session = sessionmaker(bind=engine)
        session = Session()
        try:
            stock = session.query(Stock).filter(Stock.symbol == ticker).one()

            # Update model metrics
            metric = session.query(ModelMetric).filter(
                ModelMetric.stock_id == stock.stock_id,
                ModelMetric.model_type == "Hybrid",
            ).one_or_none()
            if not metric:
                metric = ModelMetric(stock_id=stock.stock_id, model_type="Hybrid")
                session.add(metric)
            metric.rmse                 = round(metrics["rmse"], 4)
            metric.mape                 = round(metrics["mape"], 4)
            metric.directional_accuracy = round(dir_acc, 2)
            metric.created_at           = datetime.now(timezone.utc)

            test_dates_only = [t.date() for t in test_dates]

            # Delete old backtest rows, unfulfilled future predictions, and any existing predictions on the test dates we are replacing
            session.query(PricePrediction).filter(
                PricePrediction.stock_id == stock.stock_id,
                (PricePrediction.is_test_set == True) | (
                    (PricePrediction.is_test_set == False) &
                    (PricePrediction.actual_price == None)
                ) | (
                    PricePrediction.prediction_date.in_(test_dates_only)
                ),
            ).delete(synchronize_session=False)

            now_utc   = datetime.now(timezone.utc)
            to_insert = []

            # Backtest rows
            for i in range(min(len(bt_pred_prices), len(test_dates))):
                d = test_dates[i].date()
                pred_p = float(bt_pred_prices[i])
                act_p  = float(bt_actual[i])
                prev_p = float(bt_actual[i - 1]) if i > 0 else act_p
                chg    = round(((pred_p - prev_p) / (prev_p + 1e-9)) * 100, 4)
                to_insert.append(PricePrediction(
                    stock_id=stock.stock_id,
                    prediction_date=d,
                    predicted_price=pred_p,
                    actual_price=act_p,
                    confidence=float(round(dir_acc, 2)),
                    direction="bullish" if chg > 0 else "bearish",
                    change_percent=chg,
                    model_type="Hybrid",
                    trained_at=now_utc,
                    is_test_set=True,
                    prediction_month=pred_month,
                ))

            # Forward predictions
            for pred_date, final_price, chg_pct, direction, confidence in monthly_preds:
                to_insert.append(PricePrediction(
                    stock_id=stock.stock_id,
                    prediction_date=pred_date,
                    predicted_price=final_price,
                    actual_price=None,
                    confidence=float(round(confidence, 2)),
                    direction=direction,
                    change_percent=chg_pct,
                    model_type="Hybrid",
                    trained_at=now_utc,
                    is_test_set=False,
                    prediction_month=pred_month,
                ))

            session.bulk_save_objects(to_insert)
            session.commit()
            print(f"[{ticker}] Saved {len(monthly_preds)} forward + "
                  f"{len(bt_pred_prices)} backtest rows.", flush=True)
            return {"ticker": ticker, "status": "ok",
                    "msg": f"success — {len(monthly_preds)} forward days"}

        except Exception as e:
            session.rollback()
            logger.log_training_error(ticker, e)
            return {"ticker": ticker, "status": "error", "msg": str(e)}
        finally:
            session.close()
            if _TORCH_AVAILABLE:
                try:
                    torch.cuda.empty_cache()
                except Exception:
                    pass

    except Exception as e:
        logger.log_training_error(ticker, e)
        return {"ticker": ticker, "status": "error", "msg": str(e)}


# ─── Helper utilities ─────────────────────────────────────────────────────────

def _has_cuda() -> bool:
    """Return True if XGBoost CUDA device is available."""
    try:
        import subprocess
        result = subprocess.run(
            ["nvidia-smi"], capture_output=True, timeout=3
        )
        return result.returncode == 0
    except Exception:
        return False


def _reconstruct_prices(
    predicted_returns: np.ndarray,
    actual_returns: np.ndarray,
    start_close: float,
) -> tuple[list[float], list[float]]:
    """
    Reconstruct price series from a chain of percentage returns.
    """
    pred_prices, act_prices = [], []
    a_price = start_close
    for pr, ar in zip(predicted_returns, actual_returns):
        p_price = a_price * (1.0 + float(pr))
        a_price = a_price * (1.0 + float(ar))
        pred_prices.append(round(p_price, 4))
        act_prices.append(round(a_price, 4))
    return pred_prices, act_prices


# ─── Parallel runner ──────────────────────────────────────────────────────────

def run_daily(
    tickers: list[str],
    workers: int = 1,
    force_lstm: bool = False,
    monthly_retrain: bool = False,
) -> dict:
    from concurrent.futures import ProcessPoolExecutor, as_completed

    results: dict[str, list] = {"ok": [], "skip": [], "error": []}

    # Train global model ONCE before spawning workers (avoids race condition)
    if (force_lstm or monthly_retrain or is_model_stale()) and _TORCH_AVAILABLE and tickers:
        print("[Runner] Pre-training global model ...", flush=True)
        # Trigger via first ticker; subsequent tickers will load from disk
        r0 = train_xgboost_for_ticker(
            tickers[0], force_lstm=True, monthly_retrain=monthly_retrain
        )
        results[r0["status"]].append(r0["ticker"])
        remaining = tickers[1:]
    else:
        remaining = tickers

    if workers > 1:
        with ProcessPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(train_xgboost_for_ticker, t, False, False): t
                for t in remaining
            }
            for fut in as_completed(futures):
                r = fut.result()
                if r["status"] == "error":
                    print(f"[ERROR] {r['ticker']}: {r.get('msg','')}", flush=True)
                results[r["status"]].append(r["ticker"])
    else:
        for t in remaining:
            r = train_xgboost_for_ticker(t, force_lstm=False, monthly_retrain=False)
            if r["status"] == "error":
                print(f"[ERROR] {r['ticker']}: {r.get('msg','')}", flush=True)
            results[r["status"]].append(r["ticker"])

    return results


def get_stocks_needing_training(tickers: list[str]) -> list[str]:
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    session = Session()
    needing = []
    today  = datetime.now(timezone.utc).date()
    month  = today.strftime("%Y-%m")
    try:
        for t in tickers:
            res = session.execute(text("""
                SELECT COUNT(*) FROM price_predictions pp
                JOIN stocks s ON s.stock_id = pp.stock_id
                WHERE s.symbol = :t AND pp.is_test_set = false
                  AND pp.prediction_month = :month AND pp.actual_price IS NULL
            """), {"t": t, "month": month}).scalar()
            if res and res > 0:
                print(f"Skipping {t}: already has {res} forward predictions for {month}.")
                continue
            needing.append(t)
        return needing
    finally:
        session.close()


# ─── CLI entry point ──────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(description="EyeStocks AI — Model Training Pipeline")
    parser.add_argument("--symbols",             nargs="*", default=None)
    parser.add_argument("--skip-trained-today",  action="store_true")
    parser.add_argument("--force-lstm",          action="store_true",
                        help="Force LSTM/global model retraining")
    parser.add_argument("--monthly-retrain",     action="store_true",
                        help="Full monthly rebuild of global model + all stocks")
    parser.add_argument("--workers",             type=int, default=1)
    args = parser.parse_args()

    create_tables()
    all_tickers = get_all_tickers()
    tickers = (
        [t for t in all_tickers if t in [s.upper() for s in args.symbols]]
        if args.symbols else all_tickers
    )
    if args.skip_trained_today:
        tickers = get_stocks_needing_training(tickers)

    if not tickers:
        print("All stocks already have predictions for this month.")
        return

    print(f"Training {len(tickers)} stock(s) "
          f"[force_lstm={args.force_lstm}, monthly={args.monthly_retrain}] ...", flush=True)
    results = run_daily(
        tickers,
        workers=args.workers,
        force_lstm=args.force_lstm,
        monthly_retrain=args.monthly_retrain,
    )
    print(f"\nDone!  OK={len(results['ok'])}  "
          f"Skipped={len(results['skip'])}  Errors={len(results['error'])}")
    if results["error"]:
        print("Failed tickers:")
        for t in results["error"]:
            print(f"  - {t}")


if __name__ == "__main__":
    main()
