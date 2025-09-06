"""
EyeStocks - Stock Price Prediction Model Training
This script trains Linear Regression models for stock price prediction using historical data.
It processes CSV files containing stock data, trains models, and saves them for later use.
"""

import pandas as pd
import numpy as np
import os
import joblib
import logging
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Configure logging to show timestamp, level, and message
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Directory paths for data and model storage
DATA_DIR = 'datasets'  # Directory containing stock data CSV files
MODEL_DIR = 'trained_models/linear_regression'  # Directory for saving trained models
SCALER_DIR = 'trained_models/linear_regression/scalers'  # Directory for saving data scalers

# Create necessary directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(SCALER_DIR, exist_ok=True)

# List of stock data files to process
files = [
    '2222.sr_stock_data.csv',  # Saudi Aramco stock data
    'AAPL_stock_data.csv'      # Apple Inc. stock data
]

def mean_absolute_percentage_error(y_true, y_pred):
    """
    Calculate Mean Absolute Percentage Error (MAPE)
    
    Args:
        y_true: Actual values
        y_pred: Predicted values
        
    Returns:
        float: MAPE value as a percentage
    """
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_idx = y_true != 0  # Avoid division by zero
    y_true, y_pred = y_true[non_zero_idx], y_pred[non_zero_idx]
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

# Process each stock data file
for file in files:
    # Load and prepare data
    path = os.path.join(DATA_DIR, file)
    df = pd.read_csv(path)

    # Convert date column and filter data
    df['Date'] = pd.to_datetime(df['Date'])
    df = df[df['Date'] > '2010-01-01']  # Use data from 2010 onwards
    df = df.sort_values('Date')  # Ensure chronological order

    # Select features and target
    features = df[['Open', 'High', 'Low', 'Volume']]  # Input features
    target = df[['Close']]  # Target variable (next day's closing price)

    # Handle missing values by filling with mean
    features.fillna(features.mean(), inplace=True)

    # Initialize and apply data scaling
    feature_scaler = MinMaxScaler()  # Scale features to [0,1] range
    target_scaler = MinMaxScaler()   # Scale target to [0,1] range

    # Transform data
    features_scaled = feature_scaler.fit_transform(features)
    target_scaled = target_scaler.fit_transform(target)

    # Split data into training and testing sets (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(features_scaled, target_scaled, test_size=0.2, shuffle=False)

    # Train Linear Regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Make predictions and inverse transform to original scale
    y_pred = model.predict(X_test)
    y_pred_inverse = target_scaler.inverse_transform(y_pred.reshape(-1, 1))
    y_test_inverse = target_scaler.inverse_transform(y_test.reshape(-1, 1))

    # Calculate error metrics
    mae = mean_absolute_error(y_test_inverse, y_pred_inverse)  # Mean Absolute Error
    rmse = np.sqrt(mean_squared_error(y_test_inverse, y_pred_inverse))  # Root Mean Square Error
    mape = mean_absolute_percentage_error(y_test_inverse, y_pred_inverse)  # Mean Absolute Percentage Error

    # Log model performance metrics
    logging.info(f"Results for {file}:")
    logging.info(f"  MAE:  {mae:.4f}")  # Average absolute error
    logging.info(f"  RMSE: {rmse:.4f}")  # Square root of average squared error
    logging.info(f"  MAPE: {mape:.2f}%\n")  # Average percentage error

    # Save trained model
    model_filename = os.path.join(MODEL_DIR, file.replace('.csv', '_lr_model.pkl'))
    joblib.dump(model, model_filename)

    # Save scalers for later use
    scaler_filename = os.path.join(SCALER_DIR, file.replace('.csv', 'lr_scaler.pkl'))
    joblib.dump((feature_scaler, target_scaler), scaler_filename)
