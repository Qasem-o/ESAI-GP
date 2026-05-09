-- EyeStocks AI Database Schema (PostgreSQL)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(255),
    bio TEXT,
    profile_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. OAuth Providers
CREATE TYPE oauth_provider_enum AS ENUM ('google', 'facebook', 'github', 'telegram');

CREATE TABLE IF NOT EXISTS oauth_providers (
    oauth_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    provider oauth_provider_enum NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_provider_user UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers(user_id);

-- 3. Email Verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_code_used ON email_verifications(email, verification_code, is_used);

-- 4. Password Resets
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    reset_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_email_code_used ON password_resets(email, reset_code, is_used);

-- 5. Admin Notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    notification_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    market VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Stocks Table
CREATE TABLE IF NOT EXISTS stocks (
    stock_id SERIAL PRIMARY KEY,
    symbol VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255),
    sector VARCHAR(255),
    current_price NUMERIC(20, 6),
    description TEXT,
    industry VARCHAR(255),
    market_cap BIGINT,
    pe_ratio NUMERIC(10, 2),
    eps NUMERIC(10, 2),
    dividend_yield NUMERIC(10, 4),
    fifty_two_week_high NUMERIC(20, 6),
    fifty_two_week_low NUMERIC(20, 6)
);

-- 7. Price History
CREATE TABLE IF NOT EXISTS price_history (
    price_history_id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(stock_id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    open NUMERIC(20, 6),
    high NUMERIC(20, 6),
    low NUMERIC(20, 6),
    close NUMERIC(20, 6),
    volume BIGINT,
    CONSTRAINT u_stock_date UNIQUE (stock_id, date)
);

CREATE INDEX IF NOT EXISTS idx_price_history_stock_id ON price_history(stock_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);

-- 8. Technical Indicators
CREATE TABLE IF NOT EXISTS technical_indicator (
    indicator_id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(stock_id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    rsi NUMERIC(10, 4),
    macd NUMERIC(20, 6),
    macd_signal NUMERIC(20, 6),
    macd_histogram NUMERIC(20, 6),
    sma_20 NUMERIC(20, 6),
    sma_50 NUMERIC(20, 6),
    ema_20 NUMERIC(20, 6),
    ema_50 NUMERIC(20, 6),
    bollinger_upper NUMERIC(20, 6),
    bollinger_middle NUMERIC(20, 6),
    bollinger_lower NUMERIC(20, 6),
    CONSTRAINT u_indicator_stock_date UNIQUE (stock_id, date)
);

CREATE INDEX IF NOT EXISTS idx_technical_indicator_stock_id ON technical_indicator(stock_id);
CREATE INDEX IF NOT EXISTS idx_technical_indicator_date ON technical_indicator(date);

-- 9. Model Metrics
CREATE TABLE IF NOT EXISTS model_metrics (
    metric_id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(stock_id) ON DELETE CASCADE NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    rmse NUMERIC(10, 4),
    mape NUMERIC(10, 4),
    directional_accuracy NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT u_metric_stock_type UNIQUE (stock_id, model_type)
);

-- 10. Price Predictions
CREATE TABLE IF NOT EXISTS price_predictions (
    prediction_id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(stock_id) ON DELETE CASCADE NOT NULL,
    prediction_date DATE NOT NULL,
    predicted_price NUMERIC(20, 6) NOT NULL,
    actual_price NUMERIC(20, 6),
    confidence NUMERIC(5, 2),
    direction VARCHAR(10),
    change_percent NUMERIC(10, 4),
    model_type VARCHAR(50) DEFAULT 'Hybrid',
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_test_set BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_prediction_stock_date UNIQUE (stock_id, prediction_date)
);

CREATE INDEX IF NOT EXISTS idx_price_predictions_stock_id ON price_predictions(stock_id);

-- 11. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    stock_symbol VARCHAR(20),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- 12. Post Likes
CREATE TABLE IF NOT EXISTS post_likes (
    like_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_post_like_user UNIQUE (post_id, user_id)
);

-- 13. Post Comments
CREATE TABLE IF NOT EXISTS post_comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. User Follows
CREATE TABLE IF NOT EXISTS user_follows (
    follow_id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    following_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_follow_pair UNIQUE (follower_id, following_id)
);

-- 15. User Stats
CREATE TABLE IF NOT EXISTS user_stats (
    stat_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate FLOAT DEFAULT 0.0,
    avg_return FLOAT DEFAULT 0.0,
    best_trade FLOAT DEFAULT 0.0,
    worst_trade FLOAT DEFAULT 0.0,
    portfolio_value FLOAT DEFAULT 0.0,
    portfolio_change FLOAT DEFAULT 0.0,
    total_invested FLOAT DEFAULT 0.0,
    total_profit_loss FLOAT DEFAULT 0.0
);
