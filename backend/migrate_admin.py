#!/usr/bin/env python3
"""
Admin Migration Script
- Adds is_admin column to the users table
- Creates the price_predictions table
Run once: python backend/migrate_admin.py
"""
import os
import sys
from dotenv import load_dotenv

# Load env from backend dir first, then root
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    import urllib.parse
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "123123")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB   = os.getenv("PG_DB",   "Stocksdata")
    
    # URL encode the password to handle special characters like '@'
    encoded_pass = urllib.parse.quote_plus(PG_PASS)
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{encoded_pass}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)

MIGRATIONS = [
    # 1. Add is_admin to users (safe: uses IF NOT EXISTS logic)
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='users' AND column_name='is_admin'
        ) THEN
            ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
            RAISE NOTICE 'Added is_admin column to users table.';
        ELSE
            RAISE NOTICE 'is_admin column already exists. Skipping.';
        END IF;
    END $$;
    """,

    # 2. Create price_predictions table
    """
    CREATE TABLE IF NOT EXISTS price_predictions (
        prediction_id   SERIAL PRIMARY KEY,
        stock_id        INTEGER NOT NULL REFERENCES stocks(stock_id) ON DELETE CASCADE,
        prediction_date DATE    NOT NULL,
        predicted_price NUMERIC(20, 6) NOT NULL,
        confidence      NUMERIC(5, 2),
        direction       VARCHAR(10),
        change_percent  NUMERIC(10, 4),
        model_type      VARCHAR(50) DEFAULT 'Hybrid',
        trained_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_prediction_stock_date UNIQUE (stock_id, prediction_date)
    );
    """,

    # 3. Index for fast lookup by stock_id
    """
    CREATE INDEX IF NOT EXISTS idx_price_predictions_stock_id
        ON price_predictions(stock_id);
    """,
]

def run():
    print("[*] Running admin migrations...")
    with engine.begin() as conn:
        for i, sql in enumerate(MIGRATIONS, start=1):
            print(f"  [{i}/{len(MIGRATIONS)}] Executing migration...")
            conn.execute(text(sql))
    print("[OK] All migrations applied successfully.")

if __name__ == "__main__":
    run()
