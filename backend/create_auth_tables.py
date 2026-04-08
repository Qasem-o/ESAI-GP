#!/usr/bin/env python3
"""
Database migration script to create authentication tables.
This script creates the User, OAuthProvider, and EmailVerification tables.
"""

from sqlalchemy import create_engine, text
from models import Base, User, OAuthProvider, EmailVerification

# Database Config (same as main.py)
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    PG_USER = "postgres"
    PG_PASS = "123123"
    PG_HOST = "localhost"
    PG_PORT = "5432"
    PG_DB = "Stocksdata"
    DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif DATABASE_URL.startswith("postgres://") and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

def create_auth_tables():
    """Create authentication tables in the database."""
    try:
        engine = create_engine(DATABASE_URL, echo=True)
        print(f"Connecting to database via URL: {DATABASE_URL.split('@')[-1]}") # Print host only for security
        
        # Create all tables defined in models
        Base.metadata.create_all(engine)
        
        print("\n✅ Successfully created authentication tables:")
        print("   - users")
        print("   - oauth_providers")
        print("   - email_verifications")
        
        # Verify tables were created
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'oauth_providers', 'email_verifications')
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            print(f"\n✅ Verified tables in database: {tables}")
            
            if len(tables) == 3:
                print("\n🎉 All authentication tables created successfully!")
            else:
                print(f"\n⚠️  Warning: Expected 3 tables, found {len(tables)}")
                
    except Exception as e:
        print(f"\n❌ Error creating authentication tables: {e}")
        raise

if __name__ == "__main__":
    create_auth_tables()
