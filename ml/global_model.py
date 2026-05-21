"""
ml/global_model.py
==================
Global multi-stock Bidirectional LSTM for EyeStocks AI using PyTorch.

Architecture overview
---------------------
  Input  : (batch, LOOK_BACK, n_features)   — sliding window of ALL_FEATURE_COLS
  Output : (batch, N_STEPS)                  — N_STEPS predicted percentage returns

A single model is trained on pooled sequences from ALL stocks simultaneously.
The ticker identity is encoded as a numeric ID and concatenated to each timestep.

Phase 4 change: Direct multi-step forecasting
---------------------------------------------
Instead of recursively predicting one day at a time (which causes error
accumulation and oversmoothing), the model now predicts N_STEPS returns
in a single forward pass.

  N_STEPS = 7  →  predict [day+1, day+2, ..., day+7] simultaneously

This eliminates:
  - Error accumulation across days
  - Oversmoothing from repeated averaging
  - Unrealistic flat prediction curves

Model saved to:  trained_models/global/global_bilstm.pt
Scaler saved to: trained_models/global/feature_scaler.pkl
Encoder saved:   trained_models/global/ticker_encoder.pkl
Metadata saved:  trained_models/global/metadata.json

Training target
---------------
  target[t] = [return[t+1], return[t+2], ..., return[t+N_STEPS]]
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, RobustScaler

import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

# ─── Paths ────────────────────────────────────────────────────────────────────

_ROOT_DIR   = Path(__file__).resolve().parent.parent
GLOBAL_DIR  = _ROOT_DIR / "trained_models" / "global"
GLOBAL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH   = GLOBAL_DIR / "global_bilstm.pt"
SCALER_PATH  = GLOBAL_DIR / "feature_scaler.pkl"
ENCODER_PATH = GLOBAL_DIR / "ticker_encoder.pkl"
META_PATH    = GLOBAL_DIR / "metadata.json"

# ─── Constants ────────────────────────────────────────────────────────────────

LOOK_BACK   = 60          # timesteps per input sequence
N_STEPS     = 7           # number of future returns predicted simultaneously
TRAIN_SPLIT = 0.80        # fraction of each stock's data used for training
VAL_SPLIT   = 0.10        # fraction used for validation (remaining = test)
HUBER_DELTA = 0.5         # Huber loss delta (tighter than before for return scale)
MAX_RETURN  = 0.20        # clip returns to ±20% to reduce split-event noise


# ─── GPU setup ────────────────────────────────────────────────────────────────

def setup_gpu() -> None:
    """Check GPU status for training."""
    if torch.cuda.is_available():
        print(f"[GPU] PyTorch is using GPU: {torch.cuda.get_device_name(0)}", flush=True)
    else:
        print("[GPU] No GPU detected — training on CPU.", flush=True)


# ─── Sequence builder ─────────────────────────────────────────────────────────

def build_sequences(
    X: np.ndarray,
    y: np.ndarray,
    look_back: int,
    n_steps: int = 1,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Build (input_seq, target) pairs for multi-step forecasting.

    Parameters
    ----------
    X        : (T, n_features)
    y        : (T,)  — target return at each timestep
    look_back: int   — input window size
    n_steps  : int   — number of future steps to predict simultaneously

    Returns
    -------
    Xs : (N, look_back, n_features)
    ys : (N, n_steps)              — multi-step targets
    where N = T - look_back - n_steps + 1
    """
    Xs, ys = [], []
    max_i = len(X) - look_back - n_steps + 1
    for i in range(max_i):
        Xs.append(X[i : i + look_back])
        # Target: next n_steps outputs starting from look_back position
        ys.append(y[i + look_back : i + look_back + n_steps])
    return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)


# ─── Architecture ─────────────────────────────────────────────────────────────

class TemporalBatchNorm(nn.Module):
    """Batch Normalization over the sequence features (last axis) in PyTorch."""
    def __init__(self, num_features: int):
        super().__init__()
        self.bn = nn.BatchNorm1d(num_features)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch, seq_len, num_features)
        x = x.transpose(1, 2)
        x = self.bn(x)
        return x.transpose(1, 2)


class TemporalAttention(nn.Module):
    """
    Computes attention weights over the sequence length and returns a weighted context vector.
    """
    def __init__(self, hidden_size: int):
        super().__init__()
        self.attention = nn.Linear(hidden_size, 1)

    def forward(self, rnn_output: torch.Tensor) -> torch.Tensor:
        # rnn_output: (batch_size, seq_len, hidden_size)
        attn_weights = torch.tanh(self.attention(rnn_output))  # (batch, seq, 1)
        attn_weights = torch.softmax(attn_weights, dim=1)      # (batch, seq, 1)
        # Weighted sum over sequence
        context = torch.sum(attn_weights * rnn_output, dim=1)  # (batch, hidden_size)
        return context


class GlobalCNNAttentionLSTM(nn.Module):
    """
    Multi-Task CNN -> BiLSTM -> Attention Architecture (RTX 3060).
    Outputs (return, direction, volatility) for N_STEPS simultaneously.
    """
    def __init__(self, n_features: int, n_steps: int = N_STEPS):
        super().__init__()
        self.n_steps = n_steps

        # 1D CNN for local pattern extraction
        self.conv1 = nn.Conv1d(in_channels=n_features, out_channels=64, kernel_size=3, padding=1)
        self.bn_conv = nn.BatchNorm1d(64)
        self.relu_conv = nn.ReLU()

        # BiLSTM Layer
        self.bilstm = nn.LSTM(
            input_size=64,
            hidden_size=64,
            batch_first=True,
            bidirectional=True
        )
        self.bn_lstm  = TemporalBatchNorm(128)
        self.drop_lstm = nn.Dropout(0.30)

        # Temporal Attention
        self.attention = TemporalAttention(hidden_size=128)
        self.bn_attn = nn.BatchNorm1d(128)
        self.drop_attn = nn.Dropout(0.20)

        # Shared Dense
        self.dense_shared = nn.Linear(128, 64)
        self.relu_shared = nn.ReLU()

        # Multi-task Heads
        self.head_return = nn.Linear(64, n_steps)
        self.head_direction = nn.Linear(64, n_steps)
        self.head_volatility = nn.Linear(64, n_steps)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        # x: (batch, seq_len, n_features)
        
        # Conv1d expects (batch, channels, seq_len)
        x = x.transpose(1, 2)
        x = self.conv1(x)
        x = self.bn_conv(x)
        x = self.relu_conv(x)
        
        # Back to (batch, seq_len, channels) for LSTM
        x = x.transpose(1, 2)

        x, _ = self.bilstm(x)  # (batch, seq_len, 128)
        x = self.bn_lstm(x)
        x = self.drop_lstm(x)

        x = self.attention(x)  # (batch, 128)
        x = self.bn_attn(x)
        x = self.drop_attn(x)

        x = self.relu_shared(self.dense_shared(x)) # (batch, 64)

        out_return = self.head_return(x)                # Regression: linear
        out_direction = torch.sigmoid(self.head_direction(x)) # Binary Classification: sigmoid
        out_volatility = torch.nn.functional.softplus(self.head_volatility(x)) # Positive Regression: softplus

        return out_return, out_direction, out_volatility


# ─── Training entry point ─────────────────────────────────────────────────────

def train_global_model(
    stock_data: dict[str, pd.DataFrame],
    feature_cols: list[str],
    look_back: int = LOOK_BACK,
    n_steps: int = N_STEPS,
    epochs: int = 80,
    batch_size: int = 256,
    force_retrain: bool = False,
) -> tuple[nn.Module, RobustScaler, LabelEncoder, dict]:
    """
    Train the global BiLSTM on pooled data from all tickers using PyTorch.
    Now trains for multi-step (n_steps) simultaneous forecasting.
    """
    setup_gpu()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── 1. Check for existing model ──────────────────────────────────────────
    if not force_retrain and MODEL_PATH.exists() and SCALER_PATH.exists() and META_PATH.exists():
        try:
            with open(META_PATH, "r") as f:
                meta = json.load(f)
            # Verify n_features and n_steps match
            saved_n_features = meta.get("n_features", -1)
            saved_n_steps    = meta.get("n_steps", 1)
            expected_n_feat  = len(feature_cols) + 1  # +1 for ticker_id

            if saved_n_features == expected_n_feat and saved_n_steps == n_steps:
                print("[GlobalModel] Loading existing Multi-Task PyTorch model from disk ...", flush=True)
                scaler  = joblib.load(str(SCALER_PATH))
                encoder = joblib.load(str(ENCODER_PATH))
                model = GlobalCNNAttentionLSTM(n_features=saved_n_features, n_steps=n_steps)
                model.load_state_dict(torch.load(str(MODEL_PATH), map_location=device))
                model.to(device)
                model.eval()
                return model, scaler, encoder, meta
            else:
                print(
                    f"[GlobalModel] Feature count or n_steps mismatch "
                    f"(saved: {saved_n_features} features, {saved_n_steps} steps | "
                    f"expected: {expected_n_feat} features, {n_steps} steps). "
                    "Retraining...", flush=True
                )
        except Exception as e:
            print(f"[GlobalModel] Could not load saved model ({e}). Retraining...", flush=True)

    print(f"[GlobalModel] Building training dataset from {len(stock_data)} tickers ...", flush=True)
    t_start = time.time()

    tickers = sorted(stock_data.keys())
    encoder = LabelEncoder()
    encoder.fit(tickers)

    # ── 2. Build per-ticker sequences (train / val split) ────────────────────
    all_X_train, all_y_train = [], []
    all_X_val,   all_y_val   = [], []

    for ticker in tickers:
        df = stock_data[ticker].copy()

        if len(df) < look_back + n_steps + 20:
            print(f"[GlobalModel] Skipping {ticker}: too few rows ({len(df)})", flush=True)
            continue

        # Ticker ID feature (normalised 0-1)
        ticker_id = float(encoder.transform([ticker])[0]) / max(len(tickers) - 1, 1)
        df["ticker_id"] = ticker_id

        # Compute targets: Return, Direction, Volatility
        close = df["close"].astype(float)
        
        # 1. Return Target
        t_ret = close.shift(-1).sub(close).div(close).clip(-MAX_RETURN, MAX_RETURN)
        # 2. Direction Target
        t_dir = (t_ret > 0).astype(float)
        # 3. Volatility Target (short-term rolling vol)
        if "return_std_5" in df.columns:
            t_vol = df["return_std_5"].shift(-1).fillna(0.0)
        else:
            t_vol = t_ret.rolling(5, min_periods=3).std().shift(-1).fillna(0.0)

        # Stack into (T, 3)
        targets = np.column_stack([t_ret.values, t_dir.values, t_vol.values]).astype(np.float32)

        # Drop rows where features are NaN (warmup periods), but keep last rows for target
        # We must index carefully. df.dropna() changes row count.
        valid_idx = df[feature_cols].notna().all(axis=1)
        df_valid = df[valid_idx]
        targets_valid = targets[valid_idx]
        
        if len(df_valid) < look_back + n_steps + 20:
            continue

        feat_matrix = df_valid[feature_cols].values.astype(np.float32)
        # Fill any NaN in targets with 0 (last row has no next-day return)
        targets_valid = np.nan_to_num(targets_valid, nan=0.0)

        n       = len(feat_matrix)
        n_train = int(n * TRAIN_SPLIT)
        n_val   = int(n * VAL_SPLIT)

        feat_train = feat_matrix[:n_train]
        feat_val   = feat_matrix[n_train : n_train + n_val]
        y_train    = targets_valid[:n_train]
        y_val      = targets_valid[n_train : n_train + n_val]

        all_X_train.append(feat_train)
        all_y_train.append(y_train)
        all_X_val.append(feat_val)
        all_y_val.append(y_val)

    if not all_X_train:
        raise ValueError("No usable training data found across all tickers.")

    # ── 3. Fit scaler on training data ONLY ───────────────────────────────────
    X_train_raw = np.vstack(all_X_train)
    scaler = RobustScaler()
    scaler.fit(X_train_raw)

    # ── 4. Scale & build multi-step sequences ─────────────────────────────────
    def scale_and_seq(X_list, y_list):
        Xs_all, ys_all = [], []
        for X, y in zip(X_list, y_list):
            X_s = scaler.transform(X)
            Xs, ys = build_sequences(X_s, y, look_back, n_steps)
            if len(Xs) > 0:
                Xs_all.append(Xs)
                ys_all.append(ys)
        if not Xs_all:
            return np.array([]).reshape(0, look_back, X_list[0].shape[1]), np.array([]).reshape(0, n_steps, 3)
        return np.vstack(Xs_all), np.vstack(ys_all)

    X_train, y_train = scale_and_seq(all_X_train, all_y_train)
    X_val,   y_val   = scale_and_seq(all_X_val,   all_y_val)

    if len(X_train) == 0:
        raise ValueError("No sequences could be built from training data.")

    # Shuffle training data across tickers
    rng = np.random.default_rng(42)
    idx = rng.permutation(len(X_train))
    X_train, y_train = X_train[idx], y_train[idx]

    print(f"[GlobalModel] Train: {X_train.shape} | Val: {X_val.shape}", flush=True)

    # ── 5. Build PyTorch model ─────────────────────────────────────────────────
    n_features = X_train.shape[2]
    model = GlobalCNNAttentionLSTM(n_features=n_features, n_steps=n_steps)
    model.to(device)

    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"[GlobalModel] PyTorch model: {total_params:,} trainable params | "
          f"n_features={n_features} | n_steps={n_steps}", flush=True)

    # PyTorch DataLoaders
    train_dataset = TensorDataset(
        torch.tensor(X_train, dtype=torch.float32),
        torch.tensor(y_train, dtype=torch.float32),   # shape: (N, n_steps, 3)
    )
    val_dataset = TensorDataset(
        torch.tensor(X_val, dtype=torch.float32),
        torch.tensor(y_val,   dtype=torch.float32),
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True,
                              pin_memory=torch.cuda.is_available(), num_workers=0)
    val_loader   = DataLoader(val_dataset,   batch_size=batch_size, shuffle=False,
                              pin_memory=torch.cuda.is_available(), num_workers=0)

    # Optimizer, Loss, Scheduler
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    criterion_ret = nn.HuberLoss(delta=HUBER_DELTA)
    criterion_dir = nn.BCELoss()
    criterion_vol = nn.MSELoss()
    
    scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(
        optimizer, T_0=20, T_mult=2, eta_min=1e-6
    )

    # Early stopping
    patience          = 12
    best_val_loss     = float("inf")
    best_val_mae      = float("inf")
    best_model_state  = None
    patience_counter  = 0

    print(f"[GlobalModel] Starting training on {device} for {epochs} epochs ...", flush=True)

    # ── 6. Training Loop ──────────────────────────────────────────────────────
    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        model.train()
        train_loss = 0.0
        train_mae  = 0.0

        for batch_x, batch_y in train_loader:
            batch_x = batch_x.to(device, non_blocking=True)
            batch_y = batch_y.to(device, non_blocking=True)
            
            t_ret = batch_y[:, :, 0]
            t_dir = batch_y[:, :, 1]
            t_vol = batch_y[:, :, 2]

            optimizer.zero_grad()
            pred_ret, pred_dir, pred_vol = model(batch_x)
            
            loss_ret = criterion_ret(pred_ret, t_ret)
            loss_dir = criterion_dir(pred_dir, t_dir)
            loss_vol = criterion_vol(pred_vol, t_vol)
            loss = loss_ret + loss_dir + loss_vol
            
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += loss.item() * batch_x.size(0)
            train_mae  += torch.mean(torch.abs(pred_ret - t_ret)).item() * batch_x.size(0)

        train_loss /= len(train_dataset)
        train_mae  /= len(train_dataset)

        # Validation
        model.eval()
        val_loss = 0.0
        val_mae  = 0.0
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x = batch_x.to(device, non_blocking=True)
                batch_y = batch_y.to(device, non_blocking=True)
                
                t_ret = batch_y[:, :, 0]
                t_dir = batch_y[:, :, 1]
                t_vol = batch_y[:, :, 2]

                pred_ret, pred_dir, pred_vol = model(batch_x)
                
                loss_ret = criterion_ret(pred_ret, t_ret)
                loss_dir = criterion_dir(pred_dir, t_dir)
                loss_vol = criterion_vol(pred_vol, t_vol)
                loss = loss_ret + loss_dir + loss_vol
                
                val_loss += loss.item() * batch_x.size(0)
                val_mae  += torch.mean(torch.abs(pred_ret - t_ret)).item() * batch_x.size(0)

        val_loss /= len(val_dataset)
        val_mae  /= len(val_dataset)

        epoch_time   = time.time() - epoch_start
        ms_per_step  = (epoch_time / len(train_loader)) * 1000 if len(train_loader) > 0 else 0

        print(
            f"Epoch {epoch}/{epochs} - "
            f"{ms_per_step:.0f}ms/step - "
            f"loss: {train_loss:.5f} - "
            f"mae: {train_mae:.5f} - "
            f"val_loss: {val_loss:.5f} - "
            f"val_mae: {val_mae:.5f}",
            flush=True
        )

        scheduler.step(epoch)

        # Early stopping
        if val_loss < best_val_loss:
            best_val_loss    = val_loss
            best_val_mae     = val_mae
            best_model_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"[GlobalModel] Early stopping at epoch {epoch}. Restoring best weights.", flush=True)
                break

    # Restore best weights
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
        model.to(device)

    # ── 7. Save model + artefacts ─────────────────────────────────────────────
    torch.save(model.state_dict(), str(MODEL_PATH))
    joblib.dump(scaler,  str(SCALER_PATH))
    joblib.dump(encoder, str(ENCODER_PATH))

    meta = {
        "trained_at":   datetime.now(timezone.utc).isoformat(),
        "look_back":    look_back,
        "n_steps":      n_steps,
        "n_features":   n_features,
        "feature_cols": feature_cols,
        "tickers":      tickers,
        "n_tickers":    len(tickers),
        "huber_delta":  HUBER_DELTA,
        "val_mae":      round(best_val_mae, 6),
        "val_loss":     round(best_val_loss, 6),
        "duration_s":   round(time.time() - t_start, 1),
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    print(
        f"[GlobalModel] Training done in {meta['duration_s']:.1f}s | "
        f"val_mae={best_val_mae:.5f} | n_steps={n_steps}",
        flush=True,
    )
    return model, scaler, encoder, meta


# ─── Inference helpers ────────────────────────────────────────────────────────

def load_global_model() -> tuple[nn.Module, RobustScaler, LabelEncoder, dict]:
    """
    Load the saved global PyTorch model, scaler, encoder and metadata.
    Raises FileNotFoundError if the model has not been trained yet.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Global model not found at {MODEL_PATH}. "
            "Run training first: python model_training.py --force-lstm"
        )

    with open(META_PATH, "r") as f:
        meta = json.load(f)

    device     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    n_features = meta.get("n_features", 15)
    n_steps    = meta.get("n_steps", N_STEPS)

    model = GlobalCNNAttentionLSTM(n_features=n_features, n_steps=n_steps)
    model.load_state_dict(torch.load(str(MODEL_PATH), map_location=device))
    model.to(device)
    model.eval()

    scaler  = joblib.load(str(SCALER_PATH))
    encoder = joblib.load(str(ENCODER_PATH))
    return model, scaler, encoder, meta


def predict_returns(
    model: nn.Module,
    scaler: RobustScaler,
    X_window: np.ndarray,       # shape (LOOK_BACK, n_features)
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Run a single multi-step inference step for Multi-Task model.

    Returns
    -------
    (pred_ret, pred_dir, pred_vol) — each shape (n_steps,)
    """
    model.eval()
    X_s = scaler.transform(X_window)           # (LOOK_BACK, n_features)
    X_t = torch.tensor(X_s, dtype=torch.float32).unsqueeze(0)  # (1, LOOK_BACK, n_features)

    device = next(model.parameters()).device
    X_t = X_t.to(device)

    with torch.no_grad():
        p_ret, p_dir, p_vol = model(X_t)   # each (1, n_steps)

    return (
        p_ret[0].cpu().numpy(),
        p_dir[0].cpu().numpy(),
        p_vol[0].cpu().numpy()
    )


def predict_return(
    model: nn.Module,
    scaler: RobustScaler,
    X_window: np.ndarray,
) -> tuple[float, float, float]:
    """
    Backward-compatible single-step wrapper around predict_returns().
    Returns only the first predicted return, direction prob, and vol (day+1).
    Used during backtest evaluation on the historical test slice.
    """
    p_ret, p_dir, p_vol = predict_returns(model, scaler, X_window)
    return float(p_ret[0]), float(p_dir[0]), float(p_vol[0])


def is_model_stale(max_age_days: int = 35) -> bool:
    """
    Return True if the global model is older than `max_age_days` or doesn't exist.
    Used to trigger monthly retraining automatically.
    """
    if not META_PATH.exists() or not MODEL_PATH.exists():
        return True
    with open(META_PATH, "r") as f:
        meta = json.load(f)
    trained_at_str = meta.get("trained_at", "")
    if not trained_at_str:
        return True
    try:
        trained_at = datetime.fromisoformat(trained_at_str.replace("Z", "+00:00"))
        age = (datetime.now(timezone.utc) - trained_at).days
        return age >= max_age_days
    except Exception:
        return True
