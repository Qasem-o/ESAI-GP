"""
ml/feature_engineering.py
==========================
Centralised, leak-free technical indicator computation for EyeStocks AI.

All indicators are computed on the **full** raw DataFrame, but scalers
must be fitted ONLY on the training split (handled in model_training.py).

Key design rules
----------------
* No look-ahead bias: every indicator uses only past data at each row.
* ATR uses real high/low columns if available; falls back to |close.diff()|.
* Volume change % is capped to avoid extreme outlier distortion.
* Returns a cleaned DataFrame with NaN rows dropped at the caller's discretion.
"""

import numpy as np
import pandas as pd


# ─── Individual indicator functions ──────────────────────────────────────────

def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Wilder's RSI using EWM (standard method, no look-ahead)."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    rs = avg_gain / (avg_loss.replace(0, 1e-10))
    return 100 - (100 / (1 + rs))


def compute_macd(
    series: pd.Series,
    span_fast: int = 12,
    span_slow: int = 26,
    span_signal: int = 9,
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """Returns (macd_line, signal_line, histogram)."""
    ema_fast = series.ewm(span=span_fast, adjust=False).mean()
    ema_slow = series.ewm(span=span_slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    signal = macd.ewm(span=span_signal, adjust=False).mean()
    hist = macd - signal
    return macd, signal, hist


def compute_ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def compute_bollinger(
    series: pd.Series, window: int = 20, n_std: float = 2.0
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """Returns (upper, middle, lower)."""
    mid = series.rolling(window, min_periods=window).mean()
    std = series.rolling(window, min_periods=window).std()
    return mid + n_std * std, mid, mid - n_std * std


def compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    True Average True Range.
    Uses high/low if available, otherwise approximates with |close.diff()|.
    """
    close = df["close"]
    if "high" in df.columns and "low" in df.columns:
        high = df["high"].astype(float)
        low  = df["low"].astype(float)
        prev_close = close.shift(1)
        tr = pd.concat([
            high - low,
            (high - prev_close).abs(),
            (low  - prev_close).abs(),
        ], axis=1).max(axis=1)
    else:
        tr = close.diff().abs()
    return tr.ewm(span=period, adjust=False).mean()


def compute_vol_change(volume: pd.Series, window: int = 20) -> pd.Series:
    """
    Volume relative to its rolling mean, capped to [-3, 3] to limit outliers.
    """
    rolling_mean = volume.rolling(window, min_periods=1).mean().replace(0, 1e-9)
    ratio = (volume / rolling_mean) - 1.0        # ~0 when volume is normal
    return ratio.clip(-3.0, 3.0)


# ─── Master feature engineer ──────────────────────────────────────────────────

# Columns expected from the database query (base features)
DB_FEATURE_COLS = [
    "rsi", "macd", "macd_signal",
    "sma_20", "sma_50",
    "ema_20", "ema_50",
    "bollinger_upper", "bollinger_lower",
    "volume",
]

# All engineered feature columns used as LSTM model input
# NOTE: market context columns (spy_return, qqq_return, etc.) are injected
# dynamically in model_training.py and appended to this list.
ALL_FEATURE_COLS = [
    # From DB (stored technical indicators)
    "rsi", "macd", "macd_signal",
    "sma_20", "sma_50",
    "ema_20", "ema_50",
    "bollinger_upper", "bollinger_lower",
    # Core engineered features
    "bb_width",           # (upper - lower) / middle  — bandwidth
    "ema_20_50_cross",    # ema_20 - ema_50  — momentum cross
    "atr",                # Average True Range — volatility proxy
    "vol_change",         # Volume deviation from rolling mean (20d)
    "daily_return",       # % return from close[t-1] to close[t]
    "return_std_10",      # Rolling 10-day std of daily_return — realised vol
    # ── Phase 2: Volatility-aware features ──────────────────────────────────
    "hl_range_pct",       # (high - low) / close * 100  — intraday range %
    "rolling_vol_20",     # 20-day rolling std of daily_return
    "vol_ratio",          # rolling_vol_20 / rolling_vol_60 — vol regime (>1 = rising)
    "candle_body_pct",    # |close - open| / (high - low + ε) — commitment strength
    "gap_pct",            # (open - prev_close) / prev_close — overnight gap %
    "vol_change_5",       # 5-day volume momentum vs 20-day avg
    "return_std_5",       # 5-day rolling std of returns — short-term realized vol
    # ── Phase 1: Market context features ────────────────────────────────────
    # These are injected by model_training.py after calling get_market_context_for_ticker()
    "spy_return",         # SPY daily % return (broad market momentum)
    "qqq_return",         # QQQ daily % return (tech sector momentum)
    "vix_level",          # VIX / 100 — normalized fear gauge
    "vix_change",         # Daily change in VIX
    "spy_qqq_div",        # spy_return - qqq_return — sector rotation signal
    # ── Phase 2: Market Regime features ─────────────────────────────────────
    "regime_bull",
    "regime_bear",
    "regime_sideways",
    "regime_high_vol",
    "regime_low_vol",
]


def engineer_all_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute all engineered features and append them to `df` in place.

    Parameters
    ----------
    df : pd.DataFrame
        Must contain at minimum: close, volume.
        Should also contain: high, low, open (for full volatility features).
        DB technical indicators (rsi, macd, etc.) should already be present.

    Returns
    -------
    pd.DataFrame
        Same df with additional engineered columns added.
        Rows with NaN in any feature column are NOT dropped here — caller decides.

    Notes
    -----
    * All computations use only past information at each timestep (no leakage).
    * Indicators that depend on DB columns (rsi, bollinger_upper, etc.) use the
      stored values so they are consistent with what the user sees in the UI.
    * Market context columns (spy_return, etc.) are NOT added here — they are
      merged in model_training.py from ml.market_context.
    """
    close  = df["close"].astype(float)
    volume = df["volume"].astype(float).replace(0, np.nan).ffill().fillna(1.0)

    # ── Bollinger Band width ───────────────────────────────────────────────────
    if "bollinger_upper" in df.columns and "bollinger_lower" in df.columns:
        bb_upper = df["bollinger_upper"].astype(float)
        bb_lower = df["bollinger_lower"].astype(float)
        bb_mid   = (bb_upper + bb_lower) / 2.0
    else:
        bb_upper, bb_mid, bb_lower = compute_bollinger(close, 20, 2.0)
        df["bollinger_upper"] = bb_upper
        df["bollinger_lower"] = bb_lower

    df["bb_width"] = (bb_upper - bb_lower) / (bb_mid.replace(0, 1e-9))

    # ── EMA cross ─────────────────────────────────────────────────────────────
    if "ema_20" in df.columns and "ema_50" in df.columns:
        df["ema_20_50_cross"] = df["ema_20"].astype(float) - df["ema_50"].astype(float)
    else:
        ema20 = compute_ema(close, 20)
        ema50 = compute_ema(close, 50)
        df["ema_20"] = ema20
        df["ema_50"] = ema50
        df["ema_20_50_cross"] = ema20 - ema50

    # ── ATR ───────────────────────────────────────────────────────────────────
    df["atr"] = compute_atr(df, period=14)

    # ── Volume change % (20d) ─────────────────────────────────────────────────
    df["vol_change"] = compute_vol_change(volume, window=20)

    # ── Daily return (target proxy; also a feature) ───────────────────────────
    df["daily_return"] = close.pct_change()

    # ── Realised volatility (rolling std of returns) ──────────────────────────
    df["return_std_10"] = df["daily_return"].rolling(10, min_periods=5).std()

    # ── Phase 2: Volatility-aware features ────────────────────────────────────

    # High-Low intraday range %
    if "high" in df.columns and "low" in df.columns:
        high = df["high"].astype(float)
        low  = df["low"].astype(float)
        df["hl_range_pct"] = ((high - low) / (close.replace(0, 1e-9))) * 100.0
    else:
        df["hl_range_pct"] = df["atr"] / (close.replace(0, 1e-9)) * 100.0  # fallback

    # Rolling 20-day volatility
    df["rolling_vol_20"] = df["daily_return"].rolling(20, min_periods=10).std()

    # Volatility ratio: short-term vol vs long-term vol (regime indicator)
    rolling_vol_60 = df["daily_return"].rolling(60, min_periods=20).std()
    df["vol_ratio"] = (df["rolling_vol_20"] / (rolling_vol_60.replace(0, 1e-9))).clip(0.1, 5.0)

    # Candle body % (commitment / conviction of price move)
    if "open" in df.columns and "high" in df.columns and "low" in df.columns:
        open_  = df["open"].astype(float)
        high   = df["high"].astype(float)
        low    = df["low"].astype(float)
        body   = (close - open_).abs()
        wick   = (high - low).replace(0, 1e-9)
        df["candle_body_pct"] = (body / wick).clip(0.0, 1.0)
    else:
        df["candle_body_pct"] = 0.5  # neutral fallback

    # Overnight gap %: open vs previous close
    if "open" in df.columns:
        open_ = df["open"].astype(float)
        prev_close = close.shift(1)
        df["gap_pct"] = ((open_ - prev_close) / (prev_close.replace(0, 1e-9))).clip(-0.15, 0.15)
    else:
        df["gap_pct"] = 0.0

    # 5-day volume momentum
    df["vol_change_5"] = compute_vol_change(volume, window=5)

    # 5-day rolling std of returns (short-term volatility)
    df["return_std_5"] = df["daily_return"].rolling(5, min_periods=3).std()

    # ── Phase 2: Explicit Market Regime Detection ─────────────────────────────
    # Uses moving averages of spy_return (if available) and vix_level.
    # We fallback to stock's own moving averages if spy_return is missing.
    spy_ret = df["spy_return"] if "spy_return" in df.columns else df["daily_return"]
    spy_trend = spy_ret.rolling(20, min_periods=5).mean()
    
    # 1 if positive trend > 0.0005, -1 if < -0.0005, else 0
    bull_mask = spy_trend > 0.0005
    bear_mask = spy_trend < -0.0005
    side_mask = ~(bull_mask | bear_mask)
    
    df["regime_bull"] = bull_mask.astype(float)
    df["regime_bear"] = bear_mask.astype(float)
    df["regime_sideways"] = side_mask.astype(float)
    
    vix = df["vix_level"] if "vix_level" in df.columns else df["rolling_vol_20"] * 10
    high_vol_mask = vix > 0.20
    df["regime_high_vol"] = high_vol_mask.astype(float)
    df["regime_low_vol"]  = (~high_vol_mask).astype(float)

    return df


def build_return_target(df: pd.DataFrame) -> pd.Series:
    """
    Compute the percentage return prediction target:
        target[t] = (close[t+1] - close[t]) / close[t]

    The returned Series is aligned with df.index but the LAST row will be NaN
    (no future price known). Drop or exclude it during training.
    """
    close = df["close"].astype(float)
    return close.shift(-1).sub(close).div(close)


def build_direction_target(return_target: pd.Series) -> pd.Series:
    """
    Compute binary direction target: 1 if return > 0 else 0.
    """
    return (return_target > 0).astype(float)


def build_volatility_target(df: pd.DataFrame, window: int = 7) -> pd.Series:
    """
    Compute forward volatility target (rolling std of future returns).
    We want to predict how volatile the next `window` days will be.
    We shift backwards so that at day t, the target is the std of [t+1 to t+window].
    """
    daily_returns = df["close"].astype(float).pct_change()
    # std of the *next* `window` days
    fwd_vol = daily_returns.shift(-window).rolling(window).std()
    return fwd_vol


def clip_outlier_returns(returns: pd.Series, n_std: float = 5.0) -> pd.Series:
    """
    Clip extreme return values to ±n_std standard deviations.
    Prevents rare events (earnings surprises, splits) from dominating loss.
    """
    mu  = returns.mean()
    std = returns.std()
    lo, hi = mu - n_std * std, mu + n_std * std
    return returns.clip(lo, hi)


def get_feature_matrix(df: pd.DataFrame, feature_cols: list[str]) -> pd.DataFrame:
    """
    Return a DataFrame with only the requested feature columns,
    forward-filling any remaining NaN gaps (only for indicators that
    legitimately start with NaN due to warmup periods).
    """
    X = df[feature_cols].copy()
    X = X.ffill()          # fill warmup NaNs forward
    X = X.fillna(0.0)      # any remaining NaN → 0
    return X
