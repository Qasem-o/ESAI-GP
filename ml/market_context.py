"""
ml/market_context.py
====================
Market context feature provider for EyeStocks AI.

Fetches SPY, QQQ, and VIX daily data from yfinance and computes
macro market features that give the model awareness of:
  - Broad market momentum (SPY return)
  - Tech sector momentum (QQQ return)
  - Market fear / volatility regime (VIX level and change)
  - Sector rotation signal (SPY vs QQQ divergence)

Features produced
-----------------
  spy_return      — SPY daily % return (broad market momentum)
  qqq_return      — QQQ daily % return (tech sector momentum)
  vix_level       — VIX closing level, normalized (÷ 100)
  vix_change      — Daily change in VIX (normalized ÷ 100)
  spy_qqq_div     — spy_return - qqq_return (sector rotation signal)

Usage
-----
    from ml.market_context import get_market_context_for_ticker
    ctx_df = get_market_context_for_ticker(stock_df, ticker="AAPL")
    # ctx_df is aligned with stock_df.index, same row count

Design rules
------------
  * No look-ahead: features at date T use market data up to T only.
  * Safe fallback: if download fails, returns zero-filled columns.
  * Caching: raw OHLCV saved to trained_models/market_context/ as CSV.
    Refreshed if cache is older than 1 day.
  * Saudi tickers (.SR): SPY/QQQ set to 0 (non-US markets). VIX kept.
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

# ─── Paths ────────────────────────────────────────────────────────────────────

_ROOT_DIR   = Path(__file__).resolve().parent.parent
CACHE_DIR   = _ROOT_DIR / "trained_models" / "market_context"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ─── Constants ────────────────────────────────────────────────────────────────

MARKET_SYMBOLS  = ["SPY", "QQQ", "^VIX"]
CACHE_MAX_AGE_H = 18        # Refresh cache if older than 18 hours
FETCH_START     = "2016-01-01"

CONTEXT_FEATURE_COLS = [
    "spy_return",
    "qqq_return",
    "vix_level",
    "vix_change",
    "spy_qqq_div",
]


# ─── Cache helpers ────────────────────────────────────────────────────────────

def _cache_path(symbol: str) -> Path:
    safe = symbol.replace("^", "VIX_").replace("/", "_")
    return CACHE_DIR / f"{safe}.csv"


def _is_cache_fresh(path: Path) -> bool:
    if not path.exists():
        return False
    age_hours = (time.time() - path.stat().st_mtime) / 3600
    return age_hours < CACHE_MAX_AGE_H


def _load_or_fetch(symbol: str, start: str) -> pd.DataFrame:
    """Load from cache or download from yfinance. Returns a DataFrame with 'close'."""
    cp = _cache_path(symbol)
    if _is_cache_fresh(cp):
        try:
            df = pd.read_csv(cp, index_col=0, parse_dates=True)
            df.index = pd.to_datetime(df.index)
            return df
        except Exception:
            pass  # fall through to re-download

    try:
        import yfinance as yf
        end = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
        raw = yf.download(symbol, start=start, end=end, progress=False, auto_adjust=True)
        if raw.empty:
            print(f"[MarketContext] WARNING: no data for {symbol}", flush=True)
            return pd.DataFrame()

        # Handle MultiIndex columns from yfinance
        if isinstance(raw.columns, pd.MultiIndex):
            raw.columns = raw.columns.droplevel(1)

        raw.index = pd.to_datetime(raw.index)
        # Normalize column names
        raw.columns = [c.lower() for c in raw.columns]
        keep = ["close"] if "close" in raw.columns else []
        if not keep:
            print(f"[MarketContext] WARNING: no close column for {symbol}", flush=True)
            return pd.DataFrame()

        out = raw[keep].copy()
        out.to_csv(cp)
        return out

    except Exception as e:
        print(f"[MarketContext] ERROR fetching {symbol}: {e}", flush=True)
        return pd.DataFrame()


# ─── Core builder ─────────────────────────────────────────────────────────────

def fetch_market_context(start: str = FETCH_START) -> pd.DataFrame:
    """
    Build a master market context DataFrame indexed by date.

    Returns
    -------
    pd.DataFrame with columns: spy_return, qqq_return, vix_level, vix_change, spy_qqq_div
    Index: DatetimeIndex (business days from start to today)
    """
    spy_df = _load_or_fetch("SPY", start)
    qqq_df = _load_or_fetch("QQQ", start)
    vix_df = _load_or_fetch("^VIX", start)

    ctx = pd.DataFrame(index=pd.DatetimeIndex([]))

    if not spy_df.empty:
        ctx["spy_close"] = spy_df["close"]
        ctx["spy_return"] = spy_df["close"].pct_change()
    else:
        ctx["spy_close"]  = np.nan
        ctx["spy_return"] = np.nan

    if not qqq_df.empty:
        qqq_aligned = qqq_df["close"].reindex(ctx.index) if not ctx.empty else qqq_df["close"]
        if ctx.empty:
            ctx = pd.DataFrame(index=qqq_df.index)
            ctx["spy_close"] = spy_df["close"].reindex(ctx.index) if not spy_df.empty else np.nan
            ctx["spy_return"] = ctx["spy_close"].pct_change()
        ctx["qqq_close"]  = qqq_df["close"].reindex(ctx.index)
        ctx["qqq_return"] = ctx["qqq_close"].pct_change()
    else:
        ctx["qqq_close"]  = np.nan
        ctx["qqq_return"] = np.nan

    if not vix_df.empty:
        ctx["vix_level"]  = vix_df["close"].reindex(ctx.index) / 100.0   # normalize
        ctx["vix_change"] = ctx["vix_level"].diff()
    else:
        ctx["vix_level"]  = np.nan
        ctx["vix_change"] = np.nan

    ctx["spy_qqq_div"] = ctx["spy_return"].fillna(0) - ctx["qqq_return"].fillna(0)

    # Forward-fill VIX (doesn't trade on weekends but stocks might)
    for col in ["vix_level", "vix_change"]:
        ctx[col] = ctx[col].ffill()

    # Keep only the derived feature cols
    keep = [c for c in CONTEXT_FEATURE_COLS if c in ctx.columns]
    ctx = ctx[keep].copy()

    # Clip extreme returns to avoid distortion
    for col in ["spy_return", "qqq_return", "spy_qqq_div"]:
        if col in ctx.columns:
            ctx[col] = ctx[col].clip(-0.15, 0.15)
    for col in ["vix_level"]:
        if col in ctx.columns:
            ctx[col] = ctx[col].clip(0.05, 1.5)  # VIX 5–150 range

    return ctx


# ─── Per-ticker alignment ─────────────────────────────────────────────────────

def get_market_context_for_ticker(
    stock_df: pd.DataFrame,
    ticker: str,
    start: str = FETCH_START,
) -> pd.DataFrame:
    """
    Return a market context DataFrame aligned to `stock_df.index`.

    For Saudi tickers (.SR), SPY and QQQ returns are zeroed out because
    those markets are not driven by US equity momentum in the same way.
    VIX (global fear) is retained for all tickers.

    Parameters
    ----------
    stock_df : pd.DataFrame
        Must have a DatetimeIndex of trading dates.
    ticker : str
        Stock ticker symbol (used to detect Saudi stocks).
    start : str
        Earliest date to request context data from.

    Returns
    -------
    pd.DataFrame aligned to stock_df.index with CONTEXT_FEATURE_COLS columns.
    All NaN values are filled with 0 (safe fallback for missing market days).
    """
    is_saudi = ticker.upper().endswith(".SR")
    is_kuwaiti = ticker.upper().endswith(".KW")
    is_qatar   = ticker.upper().endswith(".QA")
    is_non_us  = is_saudi or is_kuwaiti or is_qatar

    ctx = fetch_market_context(start=start)

    if ctx.empty:
        # Return zero-filled context if fetch completely failed
        result = pd.DataFrame(0.0, index=stock_df.index, columns=CONTEXT_FEATURE_COLS)
        return result

    # Align to stock index: left-join stock dates onto market context
    aligned = ctx.reindex(stock_df.index)

    # Forward-fill gaps (holidays when market closed but stock traded, or vice versa)
    aligned = aligned.ffill().bfill()

    # Zero out US-market-specific signals for non-US stocks
    if is_non_us:
        for col in ["spy_return", "qqq_return", "spy_qqq_div"]:
            if col in aligned.columns:
                aligned[col] = 0.0

    # Final fallback: fill any remaining NaN with 0
    aligned = aligned.fillna(0.0)

    return aligned


# ─── Quick test ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Fetching market context (SPY, QQQ, VIX)...")
    ctx = fetch_market_context()
    print(f"Context shape: {ctx.shape}")
    print(ctx.tail(10).to_string())
    print("\nColumns:", ctx.columns.tolist())
