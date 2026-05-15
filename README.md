# EyeStocks AI (ESAI)

Welcome to the EyeStocks AI (ESAI) project. This is a comprehensive stock analysis and prediction platform.

### 📚 Getting Started
If you are a student or developer looking to set up the environment, database, or extend this project, please follow our **[Comprehensive Student Setup Guide (STUDENT_GUIDE.md)](./STUDENT_GUIDE.md)**.

EyeStocks AI is a comprehensive full-stack platform designed for stock analysis, portfolio tracking, and virtual trading simulation, powered by machine learning insights.

---

## 🚀 Key Features

- **Virtual Trading Simulator:** Start with a virtual budget of $2,000 and test your strategies to reach a $10,000 goal.
- **Portfolio Management:** Real-time tracking of investments, dynamic P&L calculation, and performance analytics.
- **AI-Powered Insights:** Stock price predictions driven by advanced machine learning models (LSTM & XGBoost).
- **Integrated Community:** Share trading ideas, follow top traders, and discuss market trends.
- **Full User System:** Secure JWT authentication, profile management, and social login (Google).
- **Premium Design:** Modern, responsive interface with full Dark Mode support and smooth animations.
- **Admin Dashboard:** Comprehensive tools for managing assets, users, and monitoring AI model health.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS & Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** Context API

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Security:** JWT Authentication & Rate Limiting
- **Email:** Brevo SMTP for password recovery
- **Validation:** Pydantic (v2)

---

## ⚙️ Installation & Setup

For detailed instructions on how to set up the environment, database, and API keys, please refer to:
👉 **[setup.md](./setup.md)**

### Quick Start (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/esai-project.git
   cd ESAI-Firstdraft
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   # From the root directory
   npm install
   npm run dev
   ```

---

## 📁 Project Structure

- `/src`: React frontend components and logic.
- `/backend`: FastAPI application, database models, and routes.
- `/backend/prediction_models`: Machine learning training and inference logic.
- `schema.sql`: Complete database structure for easy migration.

---

## 📜 Disclaimer
This platform is for educational and simulation purposes only. The AI predictions provided are based on historical data and do not constitute financial advice.

---

## 🎓 University Submission
Developed as a final project for **EyeStocks AI**.
- **Year:** 2024-2025
- **Status:** Final Submission Ready
- **Security:** All sensitive credentials have been removed and moved to environment variables.
