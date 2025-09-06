from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
import yfinance as yf


app = FastAPI(title="StockEye AI Backend", version="1.0")

# CORS for Vite dev server and local files
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Paths relative to the main project folder
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trained_models", "linear_regression")
SCALER_DIR = os.path.join(MODEL_DIR, "scalers")

# Debug: Print the actual paths being used
print(f"DATA_DIR: {DATA_DIR}")
print(f"MODEL_DIR: {MODEL_DIR}")
print(f"SCALER_DIR: {SCALER_DIR}")
print(f"Current working directory: {os.getcwd()}")
print(f"Backend file location: {__file__}")
print(f"Directory contents of DATA_DIR: {os.listdir(DATA_DIR) if os.path.exists(DATA_DIR) else 'DIRECTORY NOT FOUND'}")
print(f"Directory contents of MODEL_DIR: {os.listdir(MODEL_DIR) if os.path.exists(MODEL_DIR) else 'DIRECTORY NOT FOUND'}")

# Map frontend symbols to dataset/model filenames and Yahoo symbols
SYMBOL_MAP = {
    "AAPL": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "AAPL",
        "name": "Apple Inc.",
    },
    "2222.SR": {
        "dataset": "2222.sr_stock_data.csv",
        "model": "2222.sr_stock_data_lr_model.pkl",
        "scaler": "2222.sr_stock_datalr_scaler.pkl",
        "yahoo": "2222.SR",
        "name": "Saudi Aramco",
    },
    # Add market indices
    "^GSPC": {
        "dataset": "AAPL_stock_data.csv",  # Fallback to existing dataset
        "model": "AAPL_stock_data_lr_model.pkl",  # Fallback to existing model
        "scaler": "AAPL_stock_datalr_scaler.pkl",  # Fallback to existing scaler
        "yahoo": "^GSPC",
        "name": "S&P 500",
    },
    "^IXIC": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "^IXIC",
        "name": "NASDAQ Composite",
    },
    "^DJI": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "^DJI",
        "name": "Dow Jones Industrial Average",
    },
    # Add other stocks
    "GOOGL": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "GOOGL",
        "name": "Alphabet Inc.",
    },
    "TSLA": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "TSLA",
        "name": "Tesla, Inc.",
    },
    "MSFT": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "MSFT",
        "name": "Microsoft Corporation",
    },
    "AMZN": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "AMZN",
        "name": "Amazon.com, Inc.",
    },
    "NVDA": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "NVDA",
        "name": "NVIDIA Corporation",
    },
    "META": {
        "dataset": "AAPL_stock_data.csv",
        "model": "AAPL_stock_data_lr_model.pkl",
        "scaler": "AAPL_stock_datalr_scaler.pkl",
        "yahoo": "META",
        "name": "Meta Platforms, Inc.",
    },
}


class GenerateResponse(BaseModel):
    symbol: str
    name: str
    currentPrice: float
    prediction: float
    confidence: float
    chartData: list


def _load_model_and_scalers(symbol_key: str):
    paths = SYMBOL_MAP[symbol_key]
    model_path = os.path.join(MODEL_DIR, paths["model"])
    scaler_path = os.path.join(SCALER_DIR, paths["scaler"])
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise HTTPException(status_code=404, detail="Model or scaler not found for symbol")
    model = joblib.load(model_path)
    feature_scaler, target_scaler = joblib.load(scaler_path)
    return model, feature_scaler, target_scaler


def _fetch_yahoo_features(yahoo_symbol: str):
    # Get last daily candle to extract Open/High/Low/Volume
    hist = yf.Ticker(yahoo_symbol).history(period="5d", interval="1d")
    if hist is None or hist.empty:
        raise HTTPException(status_code=404, detail="Yahoo Finance returned no data")
    last = hist.iloc[-1]
    open_v = float(last.get("Open", np.nan))
    high_v = float(last.get("High", np.nan))
    low_v = float(last.get("Low", np.nan))
    vol_v = float(last.get("Volume", np.nan))
    close_v = float(last.get("Close", np.nan))
    if any(np.isnan([open_v, high_v, low_v, vol_v, close_v])):
        raise HTTPException(status_code=500, detail="Incomplete OHLCV data from Yahoo Finance")
    return {
        "Open": open_v,
        "High": high_v,
        "Low": low_v,
        "Volume": vol_v,
        "Close": close_v,
    }


def _load_chart_data(dataset_filename: str, limit: int = 120):
    path = os.path.join(DATA_DIR, dataset_filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Dataset not found")
    df = pd.read_csv(path)
    # Ensure chronological order and restrict columns
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"])  # type: ignore
        df = df.sort_values("Date")
    else:
        df = df.reset_index()
        df.rename(columns={"index": "Date"}, inplace=True)
    tail = df.tail(limit)
    records = []
    for _, row in tail.iterrows():
        records.append({
            "time": row["Date"].strftime("%Y-%m-%d") if isinstance(row["Date"], pd.Timestamp) else str(row["Date"]),
            "price": float(row.get("Close", np.nan)),
        })
    return records


@app.get("/price/{symbol}")
def get_price(symbol: str):
    if symbol not in SYMBOL_MAP:
        raise HTTPException(status_code=400, detail="Unsupported symbol")
    yahoo_symbol = SYMBOL_MAP[symbol]["yahoo"]
    feats = _fetch_yahoo_features(yahoo_symbol)
    return {"symbol": symbol, "name": SYMBOL_MAP[symbol]["name"], "price": feats["Close"]}


@app.get("/chart/{symbol}")
def get_chart(symbol: str, limit: int = Query(120, ge=30, le=1000)):
    if symbol not in SYMBOL_MAP:
        raise HTTPException(status_code=400, detail="Unsupported symbol")
    data = _load_chart_data(SYMBOL_MAP[symbol]["dataset"], limit=limit)
    return {"symbol": symbol, "data": data}


@app.get("/generate", response_model=GenerateResponse)
def generate(symbol: str = Query(..., description="Symbol e.g., AAPL or 2222.SR")):
    if symbol not in SYMBOL_MAP:
        raise HTTPException(status_code=400, detail="Unsupported symbol")
    
    # Load the pre-trained model (no training, just prediction)
    model, feature_scaler, target_scaler = _load_model_and_scalers(symbol)
    yahoo_symbol = SYMBOL_MAP[symbol]["yahoo"]
    
    # Get current market data from Yahoo Finance
    feats = _fetch_yahoo_features(yahoo_symbol)

    # Prepare features in trained order: Open, High, Low, Volume
    feature_vec = np.array([[feats["Open"], feats["High"], feats["Low"], feats["Volume"]]], dtype=float)
    feature_vec_scaled = feature_scaler.transform(feature_vec)
    pred_scaled = model.predict(feature_vec_scaled)
    pred = float(target_scaler.inverse_transform(np.array(pred_scaled).reshape(-1, 1))[0][0])

    # Confidence: simple heuristic using volatility, bounded 75-98
    high_low_spread = max(1e-6, feats["High"] - feats["Low"])  # avoid zero
    rel_volatility = min(1.0, high_low_spread / max(1e-6, feats["Close"]))
    confidence = float(max(75.0, min(98.0, 98.0 - rel_volatility * 40.0)))

    # Chart data: only last 30 days from dataset
    chart = _load_chart_data(SYMBOL_MAP[symbol]["dataset"], limit=30)

    return GenerateResponse(
        symbol=symbol,
        name=SYMBOL_MAP[symbol]["name"],
        currentPrice=float(feats["Close"]),
        prediction=float(pred),
        confidence=round(confidence, 2),
        chartData=chart,
    )


# Health check
@app.get("/")
def root():
    return {"status": "ok"}
