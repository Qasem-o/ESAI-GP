"""
Migration script to create portfolio tables in the database.
Run: python migrate_portfolio.py
"""

import sys
import os

# Add parent to path for preparedata imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from models import Base
from portfolio_models import PortfolioHolding, PortfolioTransaction, PortfolioCash, Watchlist

# Database Config (same as main.py)
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(DATABASE_URL)

def migrate():
    print("Creating portfolio tables...")
    
    # Create only the new tables (won't touch existing ones)
    Base.metadata.create_all(engine, tables=[
        PortfolioHolding.__table__,
        PortfolioTransaction.__table__,
        PortfolioCash.__table__,
        Watchlist.__table__,
    ])
    
    print("✅ Portfolio tables created successfully!")
    
    # Verify tables exist
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('portfolio_holdings', 'portfolio_transactions', 'portfolio_cash', 'watchlist')
            ORDER BY table_name;
        """))
        tables = [row[0] for row in result]
        print(f"✅ Verified tables: {tables}")


if __name__ == "__main__":
    migrate()
