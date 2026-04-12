import os
import sys
from sqlalchemy import create_engine, desc, func
from sqlalchemy.orm import sessionmaker

# Add root directory to path to import from preparedata
sys.path.append(os.path.dirname(os.path.abspath(__name__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__name__)), 'backend'))
from preparedata import Base
from community_models import Post

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "123123")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB = os.getenv("PG_DB", "Stocksdata")
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("Checking posts for 'PEP'...")
posts = db.query(Post).filter(func.upper(Post.stock_symbol) == 'PEP').all()
print(f"Found {len(posts)} posts for PEP.")
for p in posts:
    print(f"- ID: {p.post_id}, Symbol: {p.stock_symbol}, Created: {p.created_at}, Content: {p.content[:30]}...")

db.close()
