
from sqlalchemy import create_engine, text

# Database Config
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

def add_columns():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("COMMIT")) # Ensure no transaction block
        
        columns = [
            ("industry", "VARCHAR(255)"),
            ("market_cap", "BIGINT"),
            ("pe_ratio", "NUMERIC(10,2)"),
            ("eps", "NUMERIC(10,2)"),
            ("dividend_yield", "NUMERIC(10,4)"),
            ("fifty_two_week_high", "NUMERIC(20,6)"),
            ("fifty_two_week_low", "NUMERIC(20,6)")
        ]

        for col_name, col_type in columns:
            try:
                print(f"Adding column {col_name}...")
                conn.execute(text(f"ALTER TABLE stocks ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                print(f"✅ Added {col_name}")
            except Exception as e:
                print(f"⚠️ Error adding {col_name}: {e}")
                
        conn.commit()
        print("Schema update completed.")

if __name__ == "__main__":
    add_columns()
