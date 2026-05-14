import os
from sqlalchemy import text
from preparedata import get_engine_from_env

def create_indexes():
    engine = get_engine_from_env()
    queries = [
        "CREATE INDEX IF NOT EXISTS idx_price_history_stock_date_desc ON price_history (stock_id, date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_technical_stock_date_desc ON technical_indicator (stock_id, date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_predictions_stock_test_date_desc ON price_predictions (stock_id, is_test_set, prediction_date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_posts_stock_symbol ON posts (stock_symbol);"
    ]
    with engine.connect() as conn:
        for q in queries:
            print(f"Executing: {q}")
            conn.execute(text(q))
        conn.commit()
    print("Indexes created successfully.")

if __name__ == "__main__":
    create_indexes()
