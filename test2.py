import sys
import os
sys.path.append('c:/Users/Admin/Desktop/ESAI/ESAI1/ESAI-Firstdraft/backend')
sys.path.append('c:/Users/Admin/Desktop/ESAI/ESAI1/ESAI-Firstdraft')
import main
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=main.engine)
db = SessionLocal()
try:
    res = main.get_stock_history("NVDA", 5, db)
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
