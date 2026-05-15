# 🚀 EyeStocks AI - Comprehensive Student Setup Guide

Welcome to the **EyeStocks AI** project! This guide is designed to help students and developers recreate the environment, set up the database, and extend the project effectively.

---

## 🏗 Project Architecture Overview
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons.
- **Backend**: Python (FastAPI) + SQLAlchemy ORM.
- **Database**: PostgreSQL (compatible with Supabase).
- **AI/ML**: LSTM models for stock prediction using `yfinance` and `pandas`.
- **Email**: Integrated via Brevo SMTP for notifications and OTP.

---

## 📋 Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Local or Cloud instance)
- [Git](https://git-scm.com/)

---

## 🛠 Step 1: Clone and Prepare
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ESAI-Firstdraft
   ```

---

## 🐍 Step 2: Backend Environment Setup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   # Activate it:
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```
3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Update the following keys in `.env`:
     - `DATABASE_URL`: `postgresql://user:password@localhost:5432/esaidb`
     - `SECRET_KEY`: Generate a secure random string.
     - `SMTP_MODE`: Set to `SMTP` or `API`.
     - `BREVO_API_KEY`: If using API mode.

---

## 🗄 Step 3: Database & Data Initialization
1. **Schema Setup:**
   - Locate `schema.sql` in the root directory.
   - Run the SQL commands in your PostgreSQL console or tool (like pgAdmin) to create the necessary tables.
2. **Fetch Initial Data:**
   - Run the data preparation script to populate the database with current stock data:
     ```bash
     python ../preparedata.py
     ```
3. **Train AI Models:**
   - Train the initial LSTM models for the prediction engine:
     ```bash
     python ../model_training.py
     ```

---

## 💻 Step 4: Frontend Environment Setup
1. **Navigate to the root directory:**
   ```bash
   cd ..
   ```
2. **Install Node dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   - Create a `.env` file in the root if it doesn't exist.
   - Set `VITE_API_URL=http://localhost:8000` (or your backend URL).

---

## 🚀 Step 5: Running the Project
1. **Start the Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
2. **Start the Frontend:**
   - Open a new terminal in the root directory:
   ```bash
   npm run dev
   ```
3. **Access the App:** Open `http://localhost:5173` in your browser.

---

## 🎓 Tips for Future Students
- **Extending Models**: To add new stocks, update the ticker list in `preparedata.py`.
- **UI Changes**: The project uses **Tailwind CSS**. Modify components in `src/components/` for UI updates.
- **API Endpoints**: Check `backend/main.py` and the various `_routes.py` files to understand the API structure.
- **Documentation**: Use the auto-generated Swagger UI at `http://localhost:8000/docs` to test API endpoints.

---

## ⚠️ Troubleshooting
- **Database Connection**: Ensure PostgreSQL service is running and the credentials in `.env` are correct.
- **Module Not Found**: Ensure you are inside the virtual environment (`venv`) when running backend scripts.
- **CORS Issues**: If the frontend can't talk to the backend, check the `ALLOW_ORIGINS` list in `backend/main.py`.

---
*Created for the ESAI Project Team.*
