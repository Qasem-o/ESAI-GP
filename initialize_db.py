import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Force stdout to use utf-8 to avoid Windows console encoding errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))
load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    import urllib.parse
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASS = os.getenv("PG_PASS", "your_local_db_password_here")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB = os.getenv("PG_DB", "postgres")
    
    # URL encode the password to handle special characters like '@'
    encoded_pass = urllib.parse.quote_plus(PG_PASS)
    db_url = f"postgresql+psycopg2://{PG_USER}:{encoded_pass}@{PG_HOST}:{PG_PORT}/{PG_DB}"
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif "postgresql://" in db_url and "+psycopg2" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

print("Connecting to database to initialize schema...")
try:
    engine = create_engine(db_url)
    
    with open("schema.sql", "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split by semicolon, filter out empty statements, and execute
    sql_content = sql_content.replace("\r\n", "\n")
    statements = sql_content.split(";")
    
    with engine.connect() as conn:
        for stmt in statements:
            stmt_stripped = stmt.strip()
            if stmt_stripped:
                first_line = stmt_stripped.split("\n")[0]
                try:
                    # Check if it creates the enum type, make it safer
                    if "CREATE TYPE oauth_provider_enum" in stmt_stripped:
                        # Use a safe block for oauth_provider_enum
                        safe_stmt = """
                        DO $$ 
                        BEGIN 
                            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oauth_provider_enum') THEN 
                                CREATE TYPE oauth_provider_enum AS ENUM ('google', 'facebook', 'github', 'telegram'); 
                            END IF; 
                        END $$;
                        """
                        print("Executing: Safe creation of oauth_provider_enum...")
                        conn.execute(text(safe_stmt))
                    else:
                        print(f"Executing: {first_line}...")
                        conn.execute(text(stmt_stripped))
                except Exception as stmt_error:
                    error_msg = str(stmt_error)
                    if "already exists" in error_msg or "DuplicateObject" in error_msg:
                        print(f"  -> Info: Already exists, skipping.")
                    else:
                        print(f"  -> Error executing statement: {error_msg}")
                        # We don't exit here so other tables can be created
        print("Database schema check/initialization complete!")
            
except Exception as e:
    print(f"Failed to connect or initialize. Error: {e}")
    sys.exit(1)
