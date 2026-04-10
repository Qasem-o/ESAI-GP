"""
Database migration script to add profile features
Run this to create the new tables for user stats, follows, and posts
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import models
from models import Base, User
from community_models import UserStats, UserFollow, Post, PostLike

# Database Config
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(DATABASE_URL)

def create_profile_tables():
    """Create profile-related tables"""
    print("Creating profile tables...")
    
    # Create tables
    Base.metadata.create_all(bind=engine, tables=[
        UserStats.__table__,
        UserFollow.__table__,
        Post.__table__,
        PostLike.__table__
    ])
    
    print("✅ Profile tables created successfully!")
    print("\nCreated tables:")
    print("  - user_stats (user statistics)")
    print("  - user_follows (follow relationships)")
    print("  - posts (user posts)")
    print("  - post_likes (post likes)")

def seed_sample_data():
    """Add sample data for testing"""
    from sqlalchemy.orm import sessionmaker
    from models import User
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get first user
        user = session.query(User).first()
        if not user:
            print("⚠️  No users found. Please create a user first.")
            return
        
        print(f"\n📊 Creating sample stats for user: {user.username}")
        
        # Create user stats
        stats = UserStats(
            user_id=user.user_id,
            followers_count=1247,
            following_count=342,
            posts_count=89,
            total_trades=247,
            winning_trades=168,
            losing_trades=79,
            win_rate=68.0,
            avg_return=12.5,
            best_trade=45.0,
            worst_trade=-8.5,
            portfolio_value=125750.50,
            portfolio_change=12.5,
            total_invested=111750.00,
            total_profit_loss=14000.50
        )
        session.add(stats)
        
        # Create sample posts
        posts_data = [
            {
                "content": "Just opened a position in $NVDA at $850. The AI chip demand is insane right now. Target is $950 by end of month. What do you think? 🚀",
                "stock_symbol": "NVDA",
                "likes_count": 45,
                "comments_count": 8,
                "shares_count": 3,
                "views_count": 1234
            },
            {
                "content": "Market analysis for today:\n\n✅ $SPY holding support at 515\n✅ Tech stocks showing strength\n⚠️ Watch for Fed minutes tomorrow\n\nStaying cautious but bullish overall",
                "stock_symbol": None,
                "likes_count": 89,
                "comments_count": 15,
                "shares_count": 7,
                "views_count": 2847
            },
            {
                "content": "Portfolio update: Up 12.5% this month! Best performers:\n1. $NVDA +18%\n2. $TSLA +15%\n3. $MSFT +9%\n\n#stockmarket #trading",
                "stock_symbol": None,
                "likes_count": 156,
                "comments_count": 27,
                "shares_count": 12,
                "views_count": 4562
            }
        ]
        
        for post_data in posts_data:
            post = Post(user_id=user.user_id, **post_data)
            session.add(post)
        
        session.commit()
        print("✅ Sample data created successfully!")
        print(f"\nCreated for {user.username}:")
        print(f"  - User stats (247 trades, 68% win rate)")
        print(f"  - 3 sample posts")
        print(f"  - Portfolio value: $125,750.50")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Profile Features Database Migration")
    print("=" * 60)
    
    create_profile_tables()
    
    # Ask if user wants sample data
    response = input("\n📝 Create sample data for testing? (y/n): ")
    if response.lower() == 'y':
        seed_sample_data()
    
    print("\n✅ Migration complete!")
    print("\nNext steps:")
    print("1. Restart your backend server")
    print("2. The profile page will now show dynamic data!")
