import urllib.request
import urllib.error
import json

try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/stocks/NVDA/history?limit=5')
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
