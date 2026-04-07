# Database Schema for StockEye AI

This document outlines the database schema for the StockEye AI application.

## Entities and Attributes

### 1. User
- `user_id` (Primary Key, INT, AUTO_INCREMENT)
- `username` (VARCHAR(50), UNIQUE, NOT NULL, INDEXED)
- `email` (VARCHAR(255), UNIQUE, NOT NULL, INDEXED)
- `password_hash` (VARCHAR(255), NULL) - Nullable for OAuth-only users
- `profile_picture_url` (VARCHAR(255), NULL)
- `bio` (TEXT, NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `is_verified` (BOOLEAN, DEFAULT FALSE)
- `failed_login_attempts` (INT, DEFAULT 0)
- `locked_until` (TIMESTAMP, NULL)
- `last_login` (TIMESTAMP, NULL)

### 2. Stock
- `stock_id` (Primary Key, INT, AUTO_INCREMENT)
- `symbol` (VARCHAR(10), UNIQUE, NOT NULL)
- `name` (VARCHAR(100), NOT NULL)
- `sector` (VARCHAR(50))
- `current_price` (DECIMAL(10, 2))
- `description` (TEXT)

### 3. Portfolio
- `portfolio_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id)
- `stock_id` (Foreign Key to Stock.stock_id)
- `quantity` (INT, NOT NULL)
- `average_purchase_price` (DECIMAL(10, 2), NOT NULL)

### 4. Post
- `post_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id)
- `stock_id` (Foreign Key to Stock.stock_id, NULL)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### 5. Like
- `like_id` (Primary Key, INT, AUTO_INCREMENT)
- `post_id` (Foreign Key to Post.post_id)
- `user_id` (Foreign Key to User.user_id)

### 6. Follower
- `follower_relationship_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id - the user being followed)
- `follower_user_id` (Foreign Key to User.user_id - the user who is following)

### 7. Watchlist
- `watchlist_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id)
- `stock_id` (Foreign Key to Stock.stock_id)

### 8. Simulation
- `simulation_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id)
- `name` (VARCHAR(100), NOT NULL)
- `start_date` (DATE)
- `end_date` (DATE)
- `initial_capital` (DECIMAL(15, 2))
- `final_balance` (DECIMAL(15, 2))

### 9. SimulationTrade
- `trade_id` (Primary Key, INT, AUTO_INCREMENT)
- `simulation_id` (Foreign Key to Simulation.simulation_id)
- `stock_id` (Foreign Key to Stock.stock_id)
- `trade_type` (ENUM('buy', 'sell'))
- `quantity` (INT)
- `price` (DECIMAL(10, 2))
- `timestamp` (TIMESTAMP)

### 10. AnalystRating
- `rating_id` (Primary Key, INT, AUTO_INCREMENT)
- `stock_id` (Foreign Key to Stock.stock_id)
- `analyst_name` (VARCHAR(100))
- `rating` (ENUM('Buy', 'Hold', 'Sell'))
- `price_target` (DECIMAL(10, 2))
- `date` (DATE)

### 11. PriceHistory
- `price_history_id` (Primary Key, INT, AUTO_INCREMENT)
- `stock_id` (Foreign Key to Stock.stock_id)
- `date` (DATE)
- `open` (DECIMAL(10, 2))
- `high` (DECIMAL(10, 2))
- `low` (DECIMAL(10, 2))
- `close` (DECIMAL(10, 2))
- `volume` (BIGINT)

---

### 12. OAuthProvider
- `oauth_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id, ON DELETE CASCADE)
- `provider` (ENUM('google', 'facebook', 'github'), NOT NULL)
- `provider_user_id` (VARCHAR(255), NOT NULL)
- `access_token` (TEXT, NULL)
- `refresh_token` (TEXT, NULL)
- `token_expires_at` (TIMESTAMP, NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- UNIQUE constraint on (provider, provider_user_id)

### 13. EmailVerification
- `verification_id` (Primary Key, INT, AUTO_INCREMENT)
- `user_id` (Foreign Key to User.user_id, ON DELETE CASCADE)
- `email` (VARCHAR(255), NOT NULL, INDEXED)
- `verification_code` (VARCHAR(6), NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `expires_at` (TIMESTAMP, NOT NULL)
- `is_used` (BOOLEAN, DEFAULT FALSE)
- `attempts` (INT, DEFAULT 0)
- INDEX on (email, verification_code, is_used)

---
