# EyeStocks AI - Setup Guide

This guide will help you set up the EyeStocks AI project for local development and review.

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** (or a Supabase project)
- **Git**

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your credentials:
     - `DATABASE_URL`: Your PostgreSQL connection string.
     - `SECRET_KEY`: A random string for JWT signing.
     - `SMTP_USER`/`SMTP_PASS`: Brevo or Gmail SMTP credentials for emails.
     - `GOOGLE_CLIENT_ID`: For Google Login.

5. **Run the API server:**
   ```bash
   uvicorn main:app --reload
   ```

## Frontend Setup

1. **Navigate to the root directory:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `VITE_API_URL` if your backend is not running on `http://localhost:8000`.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Database Initialization

If you are setting up a fresh database:

1. **Initialize the schema:**
   - Use the provided `schema.sql` file (found in the root directory) to create the tables in your PostgreSQL database. You can run this file directly in your database management tool (like pgAdmin or DBeaver).

2. **Fetch initial stock data:**
   ```bash
   python preparedata.py
   ```

3. Train initial models:
   ```bash
   python model_training.py
   ```

## Security Note

This project has been sanitized for public review. All hardcoded secrets have been removed and replaced with environment variables. **Never commit your `.env` file to version control.**
