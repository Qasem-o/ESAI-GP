"""
ml/training_logger.py
=====================
Structured JSON logging for EyeStocks AI training & prediction pipelines.

Writes three types of artefacts under  trained_models/logs/ :
  training_YYYY-MM-DD.log     — one line per log event during training
  prediction_YYYY-MM-DD.log   — per-inference prediction events
  eval_report_YYYY-MM.json    — monthly aggregated evaluation metrics

Usage
-----
    from ml.training_logger import TrainingLogger
    logger = TrainingLogger()
    logger.log_training_start("AAPL")
    logger.log_epoch(ticker="AAPL", epoch=1, loss=0.004, val_loss=0.005)
    logger.log_training_end("AAPL", metrics={"mae": 0.012, "rmse": 0.021})
    logger.log_prediction("AAPL", predicted_return=0.012, confidence=72.5)
"""

from __future__ import annotations

import json
import os
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ─── Paths ────────────────────────────────────────────────────────────────────

_ROOT_DIR = Path(__file__).resolve().parent.parent          # project root
LOGS_DIR  = _ROOT_DIR / "trained_models" / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _month_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─── Logger class ─────────────────────────────────────────────────────────────

class TrainingLogger:
    """
    Thread-safe, append-only JSON-lines logger for the EyeStocks AI ML pipeline.
    Each log entry is a single JSON object written as one line (JSONL format).
    """

    def __init__(self, echo: bool = True):
        """
        Parameters
        ----------
        echo : bool
            If True, also print log events to stdout.
        """
        self.echo = echo
        self._training_path  = LOGS_DIR / f"training_{_today_utc()}.log"
        self._prediction_path = LOGS_DIR / f"prediction_{_today_utc()}.log"

    # ── Internal write helper ─────────────────────────────────────────────────

    def _write(self, path: Path, record: dict) -> None:
        record.setdefault("ts", _now_iso())
        line = json.dumps(record, ensure_ascii=False, default=str)
        with path.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
        if self.echo:
            print(f"[LOG] {line}", flush=True)

    # ── Training events ───────────────────────────────────────────────────────

    def log_training_start(self, ticker: str, model_type: str = "global_bilstm") -> None:
        self._write(self._training_path, {
            "event": "training_start",
            "ticker": ticker,
            "model_type": model_type,
        })

    def log_epoch(
        self,
        ticker: str,
        epoch: int,
        loss: float,
        val_loss: Optional[float] = None,
        lr: Optional[float] = None,
    ) -> None:
        record: dict[str, Any] = {
            "event": "epoch",
            "ticker": ticker,
            "epoch": epoch,
            "loss": round(float(loss), 6),
        }
        if val_loss is not None:
            record["val_loss"] = round(float(val_loss), 6)
        if lr is not None:
            record["lr"] = float(lr)
        self._write(self._training_path, record)

    def log_training_end(
        self,
        ticker: str,
        metrics: dict[str, float],
        n_train_samples: int = 0,
        n_val_samples: int = 0,
        duration_seconds: float = 0.0,
    ) -> None:
        self._write(self._training_path, {
            "event": "training_end",
            "ticker": ticker,
            "metrics": {k: round(float(v), 6) for k, v in metrics.items()},
            "n_train_samples": n_train_samples,
            "n_val_samples": n_val_samples,
            "duration_seconds": round(duration_seconds, 2),
        })

    def log_training_error(self, ticker: str, error: Exception) -> None:
        self._write(self._training_path, {
            "event": "training_error",
            "ticker": ticker,
            "error": str(error),
            "traceback": traceback.format_exc(),
        })

    def log_xgb_training(
        self,
        ticker: str,
        n_estimators: int,
        best_iteration: int,
        val_rmse: float,
        feature_importance: dict[str, float] = None,
    ) -> None:
        record = {
            "event": "xgb_training",
            "ticker": ticker,
            "n_estimators": n_estimators,
            "best_iteration": best_iteration,
            "val_rmse": round(float(val_rmse), 6),
        }
        if feature_importance:
            record["feature_importance"] = feature_importance
        self._write(self._training_path, record)

    # ── Prediction events ─────────────────────────────────────────────────────

    def log_prediction(
        self,
        ticker: str,
        prediction_date: str,
        predicted_return: float,
        predicted_price: float,
        confidence: float,
        direction: str,
        lstm_return: float,
        xgb_correction: float,
    ) -> None:
        self._write(self._prediction_path, {
            "event": "prediction",
            "ticker": ticker,
            "prediction_date": prediction_date,
            "predicted_return": round(float(predicted_return), 6),
            "predicted_price": round(float(predicted_price), 4),
            "confidence": round(float(confidence), 2),
            "direction": direction,
            "lstm_return": round(float(lstm_return), 6),
            "xgb_correction": round(float(xgb_correction), 6),
        })

    def log_prediction_error(self, ticker: str, error: Exception) -> None:
        self._write(self._prediction_path, {
            "event": "prediction_error",
            "ticker": ticker,
            "error": str(error),
        })

    # ── Monthly evaluation report ─────────────────────────────────────────────

    def write_eval_report(self, ticker: str, metrics: dict[str, float]) -> None:
        """
        Append or update a monthly evaluation report JSON file.
        File: trained_models/logs/eval_report_YYYY-MM.json
        """
        report_path = LOGS_DIR / f"eval_report_{_month_utc()}.json"

        # Load existing report
        if report_path.exists():
            try:
                with report_path.open("r", encoding="utf-8") as f:
                    report: dict = json.load(f)
            except Exception:
                report = {"month": _month_utc(), "stocks": {}}
        else:
            report = {"month": _month_utc(), "stocks": {}}

        report["stocks"][ticker] = {
            "ts": _now_iso(),
            **{k: round(float(v), 6) for k, v in metrics.items()},
        }
        report["updated_at"] = _now_iso()

        with report_path.open("w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        if self.echo:
            print(f"[EVAL] {ticker}: {metrics}", flush=True)

    def write_global_model_report(
        self,
        tickers: list[str],
        val_mae: float,
        val_rmse: float,
        duration_seconds: float,
    ) -> None:
        """Write a summary for the global model training run."""
        report_path = LOGS_DIR / f"global_model_{_today_utc()}.json"
        report = {
            "ts": _now_iso(),
            "tickers": tickers,
            "n_tickers": len(tickers),
            "val_mae": round(float(val_mae), 6),
            "val_rmse": round(float(val_rmse), 6),
            "duration_seconds": round(float(duration_seconds), 2),
        }
        with report_path.open("w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        if self.echo:
            print(f"[GLOBAL] Training report saved -> {report_path}", flush=True)


# ─── Module-level convenience instance ────────────────────────────────────────

_default_logger: Optional[TrainingLogger] = None


def get_logger(echo: bool = True) -> TrainingLogger:
    """Return (or create) the module-level default logger."""
    global _default_logger
    if _default_logger is None:
        _default_logger = TrainingLogger(echo=echo)
    return _default_logger
