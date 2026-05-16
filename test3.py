import sys
sys.path.append('c:/Users/Admin/Desktop/ESAI/ESAI1/ESAI-Firstdraft/backend')
sys.path.append('c:/Users/Admin/Desktop/ESAI/ESAI1/ESAI-Firstdraft')
from fastapi.testclient import TestClient
from backend.main import app
import traceback

client = TestClient(app)

try:
    response = client.get("/stocks/NVDA/history?limit=5")
    print(response.status_code)
    print(response.json())
except Exception as e:
    traceback.print_exc()
