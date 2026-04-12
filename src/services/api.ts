import { API_BASE_URL } from './apiConfig';

// Types
export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change?: number; // Added change
  sector?: string;
  description?: string;
  industry?: string;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  dayOpen?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: string | number;
  mentions?: number;
  sentiment?: number;
  topPost?: {
    author: string;
    content: string;
    likes: number;
  };
}

export interface ChartData {
  symbol: string;
  data: {
    time: string;
    price: number;
  }[];
}

export interface StockTechnical {
  date: string;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  macd_histogram?: number;
  sma_20?: number;
  sma_50?: number;
  ema_20?: number;
  ema_50?: number;
  bollinger_upper?: number;
  bollinger_middle?: number;
  bollinger_lower?: number;
}

export interface StockPrediction {
  tomorrow_price: number;
  confidence: number;
  direction: "bullish" | "bearish" | "neutral";
  change_percent: number;
  recommendation?: string;
  target_price?: number;
  stop_loss?: number;
  risk_level?: string;
  analysis?: string[];
}

export interface StockSentiment {
  bullish_percent: number;
  bearish_percent: number;
  neutral_percent: number;
  total_discussions: number;
}



export interface StockMetric {
  model_type: string;
  rmse: number;
  mape: number;
  directional_accuracy: number;
}

// API functions

// Fetch all stocks
export const fetchStocks = async (): Promise<StockPrice[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks`);
    }
    const data = await response.json();
    // Map backend StockBase to frontend StockPrice
    return data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.current_price || 0,
      sector: item.sector,
      description: item.description,
      change: item.change_percent || 0,
      mentions: item.mentions || 0,
      sentiment: item.sentiment || 0,
      volume: item.volume || "N/A",
      marketCap: item.market_cap || "N/A"
    }));
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

export const fetchStockPrice = async (symbol: string): Promise<StockPrice> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
    const item = await response.json();
    return {
      symbol: item.symbol,
      name: item.name,
      price: item.current_price || 0,
      sector: item.sector,
      description: item.description,
      industry: item.industry,
      marketCap: item.market_cap,
      peRatio: item.pe_ratio,
      eps: item.eps,
      dividendYield: item.dividend_yield,
      week52High: item.fifty_two_week_high,
      week52Low: item.fifty_two_week_low,
      dayOpen: item.day_open,
      dayHigh: item.day_high,
      dayLow: item.day_low,
      change: 0,
      volume: item.volume
    };
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};

export const fetchChartData = async (symbol: string, limit: number = 120): Promise<ChartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/history?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chart data for ${symbol}`);
    }
    const data = await response.json();
    // Map backend PricePoint to frontend format
    // PricePoint: { date: string, close: number }
    return {
      symbol,
      data: data.map((item: any) => ({
        time: item.date,
        price: item.close
      }))
    };
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};


export const fetchStockTechnicals = async (symbol: string): Promise<StockTechnical[]> => {
  const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/technicals`);
  if (!response.ok) throw new Error("Failed to fetch technicals");
  return response.json();
};

export const fetchStockPrediction = async (symbol: string): Promise<StockPrediction> => {
  const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/prediction`);
  if (!response.ok) throw new Error("Failed to fetch prediction");
  return response.json();
};

export const fetchStockMetrics = async (symbol: string): Promise<StockMetric[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock prediction:', error);
    throw error;
  }
};

export const fetchStockSentiment = async (symbol: string): Promise<StockSentiment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/sentiment`);
    if (!response.ok) {
      // Return fallback if endpoint fails or not ready
      return { bullish_percent: 50, bearish_percent: 50, neutral_percent: 0, total_discussions: 0 };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock sentiment:', error);
    return { bullish_percent: 50, bearish_percent: 50, neutral_percent: 0, total_discussions: 0 };
  }
};



// Helper function to fetch multiple stock prices (Deprecated by fetchStocks but kept for compatibility)
export const fetchMultipleStockPrices = async (symbols: string[]): Promise<StockPrice[]> => {
  // If symbols is empty or we just want all, use fetchStocks
  // Otherwise filter from fetchStocks? Or separate calls.
  // Efficient way: fetch all and filter
  const allStocks = await fetchStocks();
  if (symbols.length > 0) {
    return allStocks.filter(s => symbols.includes(s.symbol));
  }
  return allStocks;
};

// Helper to calculate percentage change (for when we don't have it directly)
export const calculatePercentageChange = (currentPrice: number, previousPrice: number): number => {
  return parseFloat(((currentPrice - previousPrice) / previousPrice * 100).toFixed(2));
};

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  sentiment: "positive" | "negative" | "neutral";
  url: string;
  timestamp: number;
}

export const fetchStockNews = async (symbol: string): Promise<NewsItem[]> => {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(symbol + " stock")}&hl=en-US&gl=US&ceid=US:en`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const items = xmlDoc.querySelectorAll("item");

    const newsItems: NewsItem[] = Array.from(items).map((item, index) => {
      const title = item.querySelector("title")?.textContent || "No Title";
      const link = item.querySelector("link")?.textContent || "#";
      const pubDateStr = item.querySelector("pubDate")?.textContent || "";
      const source = item.querySelector("source")?.textContent || "Google News";

      // Simple HTML strip for description using a temporary DOM element would be ideal, 
      // but for safety in this environment (fetching description text content directly mostly works for RSS)
      // However, Google News RSS descriptions are often HTML links.
      // Let's rely on the browser's DOM parser to extract text from the HTML description if possible,
      // or just take the raw text if it's CDATA/simple text. 
      // Actually, the <description> often contains an <a> tag.

      const descriptionHTML = item.querySelector("description")?.textContent || "";
      let summary = "";

      // Strip HTML tags for summary
      if (descriptionHTML) {
        // Create a temp element to strip HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = descriptionHTML;
        summary = tempDiv.textContent || "";
      }

      // Time Ago
      let timeAgo = "Recently";
      if (pubDateStr) {
        const date = new Date(pubDateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 1) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          timeAgo = `${diffMins}m ago`;
        } else if (diffHrs < 24) {
          timeAgo = `${diffHrs}h ago`;
        } else {
          timeAgo = `${Math.floor(diffHrs / 24)}d ago`;
        }
      }

      // Mock Sentiment (RSS doesn't provide this)
      const sentiments: ("positive" | "negative" | "neutral")[] = ["positive", "negative", "neutral"];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

      return {
        id: index,
        title,
        summary,
        source,
        timeAgo,
        sentiment,
        url: link,
        timestamp: pubDateStr ? new Date(pubDateStr).getTime() : Date.now()
      };
    });

    return newsItems.slice(0, 15);
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return [];
  }
};