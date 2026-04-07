"""
Delete user account by email
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

def delete_user_by_email(email: str):
    """Delete user and all related data"""
    with engine.connect() as conn:
        try:
            # Get user_id first
            result = conn.execute(text("""
                SELECT user_id FROM users WHERE email = :email
            """), {"email": email})
            
            user = result.fetchone()
            if not user:
                print(f"❌ User with email {email} not found")
                return
            
            user_id = user[0]
            print(f"Found user_id: {user_id}")
            
            # Delete related data
            conn.execute(text("DELETE FROM oauth_providers WHERE user_id = :user_id"), {"user_id": user_id})
            conn.execute(text("DELETE FROM email_verifications WHERE user_id = :user_id"), {"user_id": user_id})
            conn.execute(text("DELETE FROM user_stats WHERE user_id = :user_id"), {"user_id": user_id})
            conn.execute(text("DELETE FROM post_likes WHERE user_id = :user_id"), {"user_id": user_id})
            conn.execute(text("DELETE FROM posts WHERE user_id = :user_id"), {"user_id": user_id})
            conn.execute(text("DELETE FROM user_follows WHERE follower_id = :user_id OR following_id = :user_id"), {"user_id": user_id})
            
            # Delete user
            conn.execute(text("DELETE FROM users WHERE user_id = :user_id"), {"user_id": user_id})
            
            conn.commit()
            print(f"✅ Successfully deleted user: {email}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    email = "jokerzxz503@gmail.com"
    print(f"Deleting user: {email}")
    delete_user_by_email(email)
