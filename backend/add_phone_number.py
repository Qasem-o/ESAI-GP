"""
Add phone_number field to users table
"""

from sqlalchemy import create_engine, text

# Database Config
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(DATABASE_URL)

def add_phone_number_field():
    """Add phone_number column to users table"""
    with engine.connect() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='phone_number'
            """))
            
            if result.fetchone():
                print("⚠️  phone_number column already exists")
                return
            
            # Add phone_number column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN phone_number VARCHAR(20) NULL
            """))
            conn.commit()
            
            print("✅ Added phone_number column to users table")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    print("=" * 60)
    print("Adding phone_number field to users table")
    print("=" * 60)
    add_phone_number_field()
    print("\n✅ Migration complete!")
