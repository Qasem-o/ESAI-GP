"""
Simple script to create sample profile data
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User
from profile_models import UserStats, Post

# Database Config
PG_USER = "postgres"
PG_PASS = "123123"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "Stocksdata"
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # Get first user
    user = session.query(User).first()
    if not user:
        print("❌ No users found. Please create a user first.")
        exit(1)
    
    print(f"✅ Found user: {user.username} (ID: {user.user_id})")
    
    # Check if stats already exist
    existing_stats = session.query(UserStats).filter(UserStats.user_id == user.user_id).first()
    if existing_stats:
        print(f"⚠️  Stats already exist for {user.username}")
        response = input("Update existing stats? (y/n): ")
        if response.lower() != 'y':
            print("Skipping stats creation.")
            exit(0)
        stats = existing_stats
    else:
        stats = UserStats(user_id=user.user_id)
        session.add(stats)
    
    # Set stats values
    stats.followers_count = 1247
    stats.following_count = 342
    stats.posts_count = 89
    stats.total_trades = 247
    stats.winning_trades = 168
    stats.losing_trades = 79
    stats.win_rate = 68.0
    stats.avg_return = 12.5
    stats.best_trade = 45.0
    stats.worst_trade = -8.5
    stats.portfolio_value = 125750.50
    stats.portfolio_change = 12.5
    stats.total_invested = 111750.00
    stats.total_profit_loss = 14000.50
    
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
    
    # Delete existing posts for this user
    session.query(Post).filter(Post.user_id == user.user_id).delete()
    
    # Add new posts
    for post_data in posts_data:
        post = Post(user_id=user.user_id, **post_data)
        session.add(post)
    
    session.commit()
    
    print("\n✅ Sample data created successfully!")
    print(f"\nCreated for {user.username}:")
    print(f"  ✓ User stats (247 trades, 68% win rate)")
    print(f"  ✓ 3 sample posts")
    print(f"  ✓ Portfolio value: $125,750.50")
    print(f"  ✓ Followers: 1,247")
    print(f"  ✓ Following: 342")
    print("\n🎉 Your profile is now fully dynamic!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    session.rollback()
finally:
    session.close()
