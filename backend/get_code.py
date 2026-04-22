import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB = os.getenv("PG_DB", "postgres")
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, verification_code, created_at FROM email_verifications ORDER BY created_at DESC LIMIT 5"))
        print("\nRecent Verification Codes:")
        print("-" * 80)
        for row in result:
            print(f"Email: {row.email:<30} | Code: {row.verification_code} | Time: {row.created_at}")
        print("-" * 80)
except Exception as e:
    print(f"Error connecting to database: {e}")
