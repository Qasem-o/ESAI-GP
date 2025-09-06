@echo off
echo Starting StockEye AI Backend...
echo.
echo Installing dependencies...

echo.
echo Starting server...
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
