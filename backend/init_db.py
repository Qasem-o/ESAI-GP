import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(current_dir)
sys.path.append(parent_dir)

from models import Base as AuthBase
from portfolio_models import PortfolioHolding, PortfolioTransaction, PortfolioCash, Watchlist
from community_models import UserStats, UserFollow, Post, PostLike
from simulator_models import SimulatorHolding, SimulatorTransaction, SimulatorState
from preparedata import Base as StockBase, Stock, PriceHistory, TechnicalIndicator, ModelMetric

# Load environment variables
load_dotenv(os.path.join(current_dir, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://") and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)

def init_db():
    print(f"🚀 Initializing database: {DATABASE_URL.split('@')[-1]}")
    
    try:
        print("Creating tables for Auth and Portfolio...")
        AuthBase.metadata.create_all(engine)
        
        print("Creating tables for Stocks and Metrics...")
        StockBase.metadata.create_all(engine)
        
        print("✅ All tables created successfully!")
        
        # Verify tables
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            print(f"📊 Current tables in DB ({len(tables)}): {tables}")
            
    except Exception as e:
        print(f"❌ Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
