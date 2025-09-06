// API service for StockEye AI

const API_BASE_URL = 'http://localhost:8000';

// Types
export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
}

export interface ChartData {
  symbol: string;
  data: {
    time: string;
    price: number;
  }[];
}

export interface StockPrediction {
  symbol: string;
  name: string;
  currentPrice: number;
  prediction: number;
  confidence: number;
  chartData: {
    time: string;
    price: number;
  }[];
}

// API functions
export const fetchStockPrice = async (symbol: string): Promise<StockPrice> => {
  try {
    const response = await fetch(`${API_BASE_URL}/price/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};

export const fetchChartData = async (symbol: string, limit: number = 120): Promise<ChartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chart/${symbol}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chart data for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};

export const fetchStockPrediction = async (symbol: string): Promise<StockPrediction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prediction for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock prediction:', error);
    throw error;
  }
};

// Helper function to fetch multiple stock prices
export const fetchMultipleStockPrices = async (symbols: string[]): Promise<StockPrice[]> => {
  try {
    const promises = symbols.map(symbol => fetchStockPrice(symbol));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching multiple stock prices:', error);
    throw error;
  }
};

// Helper to calculate percentage change (for when we don't have it directly)
export const calculatePercentageChange = (currentPrice: number, previousPrice: number): number => {
  return parseFloat(((currentPrice - previousPrice) / previousPrice * 100).toFixed(2));
};