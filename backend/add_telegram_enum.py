from sqlalchemy import create_engine, text

# Database Config
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

def add_telegram_enum():
    """Add 'telegram' value to oauth_provider_enum type in PostgreSQL."""
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check if 'telegram' already exists in the enum
            # Note: This is specific to PostgreSQL
            conn.execute(text("COMMIT")) # Enums can't be altered inside a transaction block in some versions, but usually safe to commit first
            
            try:
                print("Attempting to add 'telegram' to oauth_provider_enum...")
                conn.execute(text("ALTER TYPE oauth_provider_enum ADD VALUE IF NOT EXISTS 'telegram'"))
                print("✅ Successfully added 'telegram' to oauth_provider_enum.")
            except Exception as e:
                print(f"⚠️  Note: {e}")
                
    except Exception as e:
        print(f"❌ Database connection error: {e}")

if __name__ == "__main__":
    add_telegram_enum()
