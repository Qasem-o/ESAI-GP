import yfinance as yf
from datetime import datetime, timedelta

ticker = "AAPL"
end = datetime.today()
start = end - timedelta(days=5)

print(f"Fetching {ticker} from {start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}")
df = yf.download(ticker, start=start.strftime('%Y-%m-%d'), end=end.strftime('%Y-%m-%d'), interval="1d")
print(df)
