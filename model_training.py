import pandas as pd
import numpy as np
import os
import joblib
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
from preparedata import Base, ModelMetric, Stock # Import ORM models

# ==========================================
# 1. CONFIGURATION
# ==========================================
DB_CONFIG = {
    'user': 'postgres',
    'password': '123123',
    'host': 'localhost',
    'port': '5432',
    'database': 'Stocksdata' 
}

MODEL_DIR = "trained_models"

# ==========================================
# 2. DATA LOADING & HELPERS
# ==========================================
def get_db_engine():
    url = f"postgresql+psycopg2://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
    return create_engine(url)

def create_tables_if_not_exist():
    engine = get_db_engine()
    Base.metadata.create_all(engine)
    print("✅ Verified/Created database tables.")

def get_all_tickers():
    engine = get_db_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT DISTINCT symbol FROM stocks ORDER BY symbol"))
        tickers = [row[0] for row in result]
    return tickers

def load_data_from_postgres(ticker):
    # print(f"Fetching data for {ticker}...")
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

# ==========================================
# 3. TRAINING LOGIC
# ==========================================
def train_and_save_model(ticker):
    print(f"\n=========================================")
    print(f"🚀 Processing: {ticker}")
    print(f"=========================================")
    
    # 1. Load Data
    df = load_data_from_postgres(ticker)
    if df is None:
        print(f"⚠️ No data found for {ticker}. Skipping.")
        return
    
    if len(df) < 100:
        print(f"⚠️ Not enough data points ({len(df)}) for {ticker}. Skipping.")
        return

    # Directories
    ticker_dir = os.path.join(MODEL_DIR, ticker)
    os.makedirs(ticker_dir, exist_ok=True)

    # Features for XGBoost
    feature_cols = ['rsi', 'macd', 'macd_signal', 'sma_20', 'sma_50', 'volume']
    
    # Split
    train_size = int(len(df) * 0.8)
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size:]
    
    # -----------------------------------
    # MODEL 1: LSTM (Trend)
    # -----------------------------------
    print(f"  [1/3] Training LSTM...")
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df[['close']])
    
    look_back = 60
    
    def create_sequences(dataset):
        X, y = [], []
        for i in range(look_back, len(dataset)):
            X.append(dataset[i-look_back:i, 0])
            y.append(dataset[i, 0])
        return np.array(X), np.array(y)

    X_all, y_all = create_sequences(scaled_data)
    
    if len(X_all) == 0:
        print("    ⚠️ Not enough data for sequences.")
        return

    train_len_lstm = int(len(X_all) * 0.8)
    X_train_lstm = X_all[:train_len_lstm]
    y_train_lstm = y_all[:train_len_lstm]
    X_test_lstm = X_all[train_len_lstm:]
    
    X_train_lstm = np.reshape(X_train_lstm, (X_train_lstm.shape[0], look_back, 1))
    X_test_lstm = np.reshape(X_test_lstm, (X_test_lstm.shape[0], look_back, 1))
    
    # Define Model
    model_lstm = Sequential()
    model_lstm.add(Input(shape=(look_back, 1)))
    model_lstm.add(LSTM(50, return_sequences=True))
    model_lstm.add(Dropout(0.2))
    model_lstm.add(LSTM(50, return_sequences=False))
    model_lstm.add(Dropout(0.2))
    model_lstm.add(Dense(25))
    model_lstm.add(Dense(1))
    
    model_lstm.compile(optimizer='adam', loss='mean_squared_error')
    model_lstm.fit(X_train_lstm, y_train_lstm, batch_size=32, epochs=10, verbose=0) # Epochs reduced for speed in batch
    
    # Save LSTM & Scaler
    model_lstm.save(os.path.join(ticker_dir, 'lstm_model.h5'))
    joblib.dump(scaler, os.path.join(ticker_dir, 'scaler.pkl'))
    
    # Predict for Hybrid
    lstm_test_pred_scaled = model_lstm.predict(X_test_lstm, verbose=0)
    lstm_test_pred = scaler.inverse_transform(lstm_test_pred_scaled)

    # -----------------------------------
    # MODEL 2: XGBoost
    # -----------------------------------
    print(f"  [2/3] Training XGBoost...")
    X_train_xgb = train_df[feature_cols]
    y_train_xgb = train_df['close']
    X_test_xgb = test_df[feature_cols]
    
    xgb_model = XGBRegressor(n_estimators=500, learning_rate=0.05) # estimators reduced for speed
    xgb_model.fit(X_train_xgb, y_train_xgb, verbose=False)
    
    # Save XGBoost
    xgb_model.save_model(os.path.join(ticker_dir, 'xgb_model.json'))
    xgb_preds = xgb_model.predict(X_test_xgb)

    # -----------------------------------
    # MODEL 3: Hybrid Corrector
    # -----------------------------------
    print(f"  [3/3] Training Hybrid Corrector...")
    
    # Get LSTM predictions on TRAIN set to calculate residuals
    lstm_train_pred_scaled = model_lstm.predict(X_train_lstm, verbose=0)
    lstm_train_pred = scaler.inverse_transform(lstm_train_pred_scaled)
    
    # Align
    train_actual_aligned = df['close'].iloc[look_back : look_back + len(lstm_train_pred)].values
    residuals_train = train_actual_aligned - lstm_train_pred.flatten()
    
    # Train Corrector
    X_train_hybrid = df[feature_cols].iloc[look_back : look_back + len(lstm_train_pred)]
    hybrid_corrector = XGBRegressor(n_estimators=500, learning_rate=0.05)
    hybrid_corrector.fit(X_train_hybrid, residuals_train)
    
    # Save Corrector
    hybrid_corrector.save_model(os.path.join(ticker_dir, 'hybrid_corrector.json'))
    
    # Predict Residuals for Test
    # Align test features: The last len(lstm_test_pred) rows
    X_test_hybrid = df[feature_cols].iloc[-len(lstm_test_pred):]
    predicted_residuals = hybrid_corrector.predict(X_test_hybrid)
    
    hybrid_final_preds = lstm_test_pred.flatten() + predicted_residuals
    
    # -----------------------------------
    # Evaluation
    # -----------------------------------
    min_len = min(len(lstm_test_pred), len(xgb_preds), len(hybrid_final_preds))
    res_actual = df['close'].iloc[-min_len:].values
    res_hybrid = hybrid_final_preds[-min_len:]
    
    mape = mean_absolute_percentage_error(res_actual, res_hybrid)
    rmse = np.sqrt(mean_squared_error(res_actual, res_hybrid))
    
    # Directional Accuracy
    actual_dir = np.diff(res_actual) > 0
    pred_dir = np.diff(res_hybrid) > 0
    dir_acc = np.mean(actual_dir == pred_dir) * 100

    print(f"  ✅ Done. Hybrid RMSE: {rmse:.4f}, MAPE: {mape:.2%}, Dir Acc: {dir_acc:.2f}%")

    # -----------------------------------
    # Save Metrics to DB
    # -----------------------------------
    try:
        engine = get_db_engine()
        Session = sessionmaker(bind=engine)
        session = Session()

        # Get stock_id
        stock = session.query(Stock).filter(Stock.symbol == ticker).one_or_none()
        if stock:
            # Check for existing metric
            metric = session.query(ModelMetric).filter(
                ModelMetric.stock_id == stock.stock_id,
                ModelMetric.model_type == 'Hybrid'
            ).one_or_none()

            if not metric:
                metric = ModelMetric(stock_id=stock.stock_id, model_type='Hybrid')
                session.add(metric)
            
            metric.rmse = float(rmse)
            metric.mape = float(mape)
            metric.directional_accuracy = float(dir_acc)
            # metric.created_at = datetime.utcnow() # Auto-updated usually or default
            
            session.commit()
            print(f"  💾 Saved metrics to DB for {ticker}")
        else:
            print(f"  ⚠️ Stock {ticker} not found in DB stock table?")
        session.close()
    except Exception as e:
        print(f"  ❌ Error saving metrics to DB: {e}")

def main():
    print("Initializing...")
    create_tables_if_not_exist()
    
    print("Fetching tickers from database...")
    try:
        tickers = get_all_tickers()
    except Exception as e:
        print(f"❌ Failed to fetch tickers: {e}")
        return

    print(f"Found {len(tickers)} stocks: {tickers}")
    
    for t in tickers:
        try:
            train_and_save_model(t)
        except Exception as e:
            print(f"❌ Error training {t}: {e}")

    print("\n🎉 All training completed.")

if __name__ == "__main__":
    main()