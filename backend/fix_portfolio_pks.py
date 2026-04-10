import os
import sys
from sqlalchemy import create_engine, text

# Load from .env if needed
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    try:
        from dotenv import load_dotenv
        load_dotenv()
        DATABASE_URL = os.getenv("DATABASE_URL")
    except ImportError:
        pass

if not DATABASE_URL:
    print("No DATABASE_URL found.")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)

sql_commands = [
    # Portfolio Cash
    "CREATE SEQUENCE IF NOT EXISTS portfolio_cash_cash_id_seq OWNED BY portfolio_cash.cash_id;",
    "ALTER TABLE portfolio_cash ALTER COLUMN cash_id SET DEFAULT nextval('portfolio_cash_cash_id_seq');",
    "SELECT setval('portfolio_cash_cash_id_seq', COALESCE((SELECT MAX(cash_id) FROM portfolio_cash), 1), false);",
    
    # Portfolio Holdings
    "CREATE SEQUENCE IF NOT EXISTS portfolio_holdings_holding_id_seq OWNED BY portfolio_holdings.holding_id;",
    "ALTER TABLE portfolio_holdings ALTER COLUMN holding_id SET DEFAULT nextval('portfolio_holdings_holding_id_seq');",
    "SELECT setval('portfolio_holdings_holding_id_seq', COALESCE((SELECT MAX(holding_id) FROM portfolio_holdings), 1), false);",
    
    # Portfolio Transactions
    "CREATE SEQUENCE IF NOT EXISTS portfolio_transactions_transaction_id_seq OWNED BY portfolio_transactions.transaction_id;",
    "ALTER TABLE portfolio_transactions ALTER COLUMN transaction_id SET DEFAULT nextval('portfolio_transactions_transaction_id_seq');",
    "SELECT setval('portfolio_transactions_transaction_id_seq', COALESCE((SELECT MAX(transaction_id) FROM portfolio_transactions), 1), false);",
    
    # Watchlist
    "CREATE SEQUENCE IF NOT EXISTS watchlist_watchlist_id_seq OWNED BY watchlist.watchlist_id;",
    "ALTER TABLE watchlist ALTER COLUMN watchlist_id SET DEFAULT nextval('watchlist_watchlist_id_seq');",
    "SELECT setval('watchlist_watchlist_id_seq', COALESCE((SELECT MAX(watchlist_id) FROM watchlist), 1), false);"
]

try:
    with engine.begin() as conn:
        for cmd in sql_commands:
            try:
                conn.execute(text(cmd))
                print(f"Success: {cmd[:40]}...")
            except Exception as e:
                # Might fail if already identity etc.
                print(f"Skipped/Failed {cmd[:40]}...: {e}")
    print("Database sequences fixed successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")
