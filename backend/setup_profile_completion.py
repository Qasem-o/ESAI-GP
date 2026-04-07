"""
Add profile_completed field and create uploads directory
"""

from sqlalchemy import create_engine, text
import os

# Database Config
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(DATABASE_URL)

def add_profile_completed_field():
    """Add profile_completed column to users table"""
    with engine.connect() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='profile_completed'
            """))
            
            if result.fetchone():
                print("⚠️  profile_completed column already exists")
                return
            
            # Add profile_completed column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE
            """))
            conn.commit()
            
            print("✅ Added profile_completed column to users table")
            
            # Set existing users to profile_completed = TRUE
            conn.execute(text("""
                UPDATE users 
                SET profile_completed = TRUE 
                WHERE username IS NOT NULL AND username != ''
            """))
            conn.commit()
            
            print("✅ Set existing users to profile_completed = TRUE")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()

def create_uploads_directory():
    """Create uploads directory for avatars"""
    uploads_dir = "uploads/avatars"
    
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print(f"✅ Created directory: {uploads_dir}")
    else:
        print(f"⚠️  Directory already exists: {uploads_dir}")

if __name__ == "__main__":
    print("=" * 60)
    print("Profile Completion Setup")
    print("=" * 60)
    add_profile_completed_field()
    create_uploads_directory()
    print("\n✅ Setup complete!")
