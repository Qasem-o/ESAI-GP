import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star, 
  Filter,
  BarChart3,
  Activity,
  Eye,
  Plus,
  Minus,
  Loader2
} from "lucide-react";
import { fetchStockPrice, fetchChartData, fetchStockPrediction, fetchMultipleStockPrices, StockPrice, ChartData, StockPrediction } from "../services/api";

// Stock symbols we want to track
const STOCK_SYMBOLS = ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "NVDA", "META"];
const MARKET_INDICES_SYMBOLS = ["^GSPC", "^IXIC", "^DJI"]; // S&P 500, NASDAQ, DOW

// Type definitions for our data
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  marketCap: string;
  sector: string;
  prediction: string;
  confidence: number;
}

interface MarketIndex {
  name: string;
  value: string;
  change: number;
}

interface TopMover {
  symbol: string;
  change: number;
}

// Sector mapping (in a real app, this would come from an API)
const SECTOR_MAP: Record<string, string> = {
  "AAPL": "Technology",
  "GOOGL": "Communication",
  "TSLA": "Consumer Discretionary",
  "MSFT": "Technology",
  "AMZN": "Consumer Discretionary",
  "NVDA": "Technology",
  "META": "Communication",
};

// Market cap formatting (in a real app, this would be calculated from actual data)
const MARKET_CAP_MAP: Record<string, string> = {
  "AAPL": "2.8T",
  "GOOGL": "1.8T",
  "TSLA": "789B",
  "MSFT": "2.9T",
  "AMZN": "1.6T",
  "NVDA": "2.1T",
  "META": "1.2T",
};

// Volume formatting (in a real app, this would be calculated from actual data)
const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

// Market index name mapping
const MARKET_INDEX_NAMES: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^IXIC": "NASDAQ",
  "^DJI": "DOW",
};

interface NavigationProps {
  currentPage: string;
  onGoToHome: () => void;
  onGoToStocks: () => void;
  onGoToPortfolio: () => void;
  onGoToCommunity: () => void;
  onGoToNews: () => void;
  onGoToLearn: () => void;
  onGoToSimulator: () => void;
  onGoToProfile: () => void;
  onGoToDashboard: () => void;
}

interface StocksProps extends NavigationProps {}

export function Stocks({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile, onGoToDashboard }: StocksProps) {
  // State for stock data
  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<TopMover[]>([]);
  const [topLosers, setTopLosers] = useState<TopMover[]>([]);
  const [chartData, setChartData] = useState<{day: number, price: number}[]>([]);
  
  // UI state
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedView, setSelectedView] = useState("list");
  
  // Loading and error states
  const [loading, setLoading] = useState({
    stocks: true,
    indices: true,
    chart: false
  });
  const [error, setError] = useState({
    stocks: "",
    indices: "",
    chart: ""
  });

  const sectors = ["all", "Technology", "Communication", "Consumer Discretionary", "Financial"];

  // Fetch market indices data
  useEffect(() => {
    const fetchIndices = async () => {
      try {
        setLoading(prev => ({ ...prev, indices: true }));
        const indicesData = await fetchMultipleStockPrices(MARKET_INDICES_SYMBOLS);
        
        // Transform the data to match our MarketIndex interface
        const formattedIndices: MarketIndex[] = indicesData.map(index => ({
          name: MARKET_INDEX_NAMES[index.symbol],
          value: index.price.toLocaleString(),
          // In a real app, we would calculate the change from previous close
          // For now, we'll use a random value between -2 and 2
          change: parseFloat((Math.random() * 4 - 2).toFixed(2))
        }));
        
        setMarketIndices(formattedIndices);
        setError(prev => ({ ...prev, indices: "" }));
      } catch (err) {
        console.error("Failed to fetch market indices:", err);
        setError(prev => ({ ...prev, indices: "Failed to load market data" }));
      } finally {
        setLoading(prev => ({ ...prev, indices: false }));
      }
    };
    
    fetchIndices();
  }, []);

  // Fetch stocks data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(prev => ({ ...prev, stocks: true }));
        const stocksData = await fetchMultipleStockPrices(STOCK_SYMBOLS);
        
        // Transform the data to match our StockData interface
        const formattedStocks: StockData[] = stocksData.map(stock => {
          // In a real app, we would calculate the change from previous close
          // For now, we'll use a random value between -6 and 6
          const change = parseFloat((Math.random() * 12 - 6).toFixed(2));
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change,
            volume: formatVolume(Math.floor(Math.random() * 50000000) + 1000000), // Random volume
            marketCap: MARKET_CAP_MAP[stock.symbol] || "N/A",
            sector: SECTOR_MAP[stock.symbol] || "Other",
            prediction: change > 0 ? "Buy" : "Hold",
            confidence: Math.floor(Math.random() * 20) + 80 // Random confidence between 80-99
          };
        });
        
        setStocksData(formattedStocks);
        
        // Set the selected stock to the first one
        if (formattedStocks.length > 0 && !selectedStock) {
          setSelectedStock(formattedStocks[0]);
        }
        
        // Calculate top gainers and losers
        const sortedByChange = [...formattedStocks].sort((a, b) => b.change - a.change);
        setTopGainers(sortedByChange.slice(0, 3).map(stock => ({ symbol: stock.symbol, change: stock.change })));
        setTopLosers(sortedByChange.slice(-3).reverse().map(stock => ({ symbol: stock.symbol, change: stock.change })));
        
        setError(prev => ({ ...prev, stocks: "" }));
      } catch (err) {
        console.error("Failed to fetch stocks data:", err);
        setError(prev => ({ ...prev, stocks: "Failed to load stocks data" }));
      } finally {
        setLoading(prev => ({ ...prev, stocks: false }));
      }
    };
    
    fetchStocks();
  }, []);

  // Generate chart data when selected stock changes
  useEffect(() => {
    if (selectedStock) {
      const fetchStockChart = async () => {
        try {
          setLoading(prev => ({ ...prev, chart: true }));
          // In a real app, we would fetch the chart data from the API
          // For now, we'll generate mock data
          const data = [];
          const basePrice = selectedStock.price;
          for (let i = 0; i < 30; i++) {
            const variance = (Math.random() - 0.5) * (basePrice * 0.1);
            data.push({
              day: i,
              price: basePrice + variance
            });
          }
          setChartData(data);
          setError(prev => ({ ...prev, chart: "" }));
        } catch (err) {
          console.error("Failed to fetch chart data:", err);
          setError(prev => ({ ...prev, chart: "Failed to load chart data" }));
        } finally {
          setLoading(prev => ({ ...prev, chart: false }));
        }
      };
      
      // Fetch chart data using the API service
      // In a production app, this would use the actual API
      fetchChartData(selectedStock.symbol)
        .then(data => {
          setChartData(data);
          setError(prev => ({ ...prev, chart: "" }));
        })
        .catch(err => {
          console.error("Error fetching chart data:", err);
          setError(prev => ({ ...prev, chart: "Failed to load chart data" }));
        })
        .finally(() => {
          setLoading(prev => ({ ...prev, chart: false }));
        });
      
      // Uncomment the line below to use mock data instead of API
      // fetchStockChart();
    }
  }, [selectedStock]);

  const filteredStocks = stocksData.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "all" || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto px-4 sm:px-6">
        <div className="py-4 sm:py-6">
          {/* Market Snapshot */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">Market Snapshot</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {loading.indices ? (
                // Loading state for market indices
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-8 w-32 bg-muted rounded"></div>
                          <div className="h-4 w-16 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : error.indices ? (
                // Error state for market indices
                <Card className="col-span-3">
                  <CardContent className="flex items-center justify-center p-6">
                    <p className="text-red-500">{error.indices}</p>
                  </CardContent>
                </Card>
              ) : (
                // Data display for market indices
                marketIndices.map((index) => (
                  <Card key={index.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{index.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{index.value}</p>
                        <div className={`flex items-center gap-1 text-sm ${
                          index.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {index.change >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {index.change >= 0 ? '+' : ''}{index.change}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Top Gainers & Losers + AI Pick */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500">
                    <TrendingUp className="w-5 h-5" />
                    Top Gainers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading.stocks ? (
                    // Loading state for top gainers
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between animate-pulse">
                          <div className="h-4 w-16 bg-muted rounded"></div>
                          <div className="h-4 w-12 bg-muted rounded"></div>
                        </div>
                      ))}
                    </>
                  ) : error.stocks ? (
                    <p className="text-red-500 text-sm">{error.stocks}</p>
                  ) : (
                    // Data display for top gainers
                    topGainers.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between">
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-green-500">+{stock.change}%</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-500">
                    <TrendingDown className="w-5 h-5" />
                    Top Losers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading.stocks ? (
                    // Loading state for top losers
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between animate-pulse">
                          <div className="h-4 w-16 bg-muted rounded"></div>
                          <div className="h-4 w-12 bg-muted rounded"></div>
                        </div>
                      ))}
                    </>
                  ) : error.stocks ? (
                    <p className="text-red-500 text-sm">{error.stocks}</p>
                  ) : (
                    // Data display for top losers
                    topLosers.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between">
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-red-500">{stock.change}%</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    AI Stock Pick
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">Today's Recommendation</Badge>
                </CardHeader>
                <CardContent>
                  {loading.stocks ? (
                    // Loading state for AI Stock Pick
                    <div className="space-y-3 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-16 bg-muted rounded"></div>
                        <div className="h-6 w-12 bg-muted rounded"></div>
                      </div>
                      <div className="h-12 w-full bg-muted rounded"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-20 bg-muted rounded"></div>
                        <div className="h-4 w-12 bg-muted rounded"></div>
                      </div>
                    </div>
                  ) : error.stocks ? (
                    <p className="text-red-500 text-sm">{error.stocks}</p>
                  ) : stocksData.length > 0 ? (
                    // Data display for AI Stock Pick
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-lg">{stocksData[0].symbol}</span>
                        <Badge className={stocksData[0].prediction === "Buy" ? "bg-green-500" : "bg-secondary"}>
                          {stocksData[0].prediction}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stocksData[0].change >= 0 
                          ? `Expected rise of +${Math.abs(stocksData[0].change).toFixed(1)}% over next week based on earnings momentum and technical indicators.`
                          : `Expected decline of ${stocksData[0].change.toFixed(1)}% over next week based on market conditions and technical indicators.`
                        }
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Confidence</span>
                        <span className="font-medium text-primary">{stocksData[0].confidence}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No stock data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stock Search & Filter */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search stocks (e.g., AAPL, Apple)"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.slice(1).map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border">
                <Button 
                  variant={selectedView === "list" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setSelectedView("list")}
                  className="rounded-r-none"
                >
                  List
                </Button>
                <Button 
                  variant={selectedView === "detail" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setSelectedView("detail")}
                  className="rounded-l-none"
                >
                  Detail
                </Button>
              </div>
            </div>
          </div>

          {selectedView === "list" ? (
            /* Stock List View */
            <div className="grid gap-3 sm:gap-4">
              {loading.stocks ? (
                // Loading state for stock list
                Array(5).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-16 bg-muted rounded"></div>
                            <div className="h-3 w-24 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-8">
                          {Array(5).fill(0).map((_, j) => (
                            <div key={j} className="space-y-2">
                              <div className="h-3 w-12 bg-muted rounded mx-auto"></div>
                              <div className="h-4 w-16 bg-muted rounded mx-auto"></div>
                            </div>
                          ))}
                        </div>
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : error.stocks ? (
                <Card>
                  <CardContent className="p-6 flex items-center justify-center">
                    <p className="text-red-500">{error.stocks}</p>
                  </CardContent>
                </Card>
              ) : filteredStocks.length === 0 ? (
                <Card>
                  <CardContent className="p-6 flex items-center justify-center">
                    <p className="text-muted-foreground">No stocks found matching your criteria</p>
                  </CardContent>
                </Card>
              ) : (
                filteredStocks.map((stock) => (
                  <Card key={stock.symbol} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    console.log('Navigating to dashboard for stock:', stock.symbol);
                    onGoToDashboard();
                  }}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="font-medium">{stock.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{stock.symbol}</p>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                            <div className="md:hidden flex items-center mt-1">
                              <p className="font-medium mr-2">${stock.price > 1000 ? stock.price.toLocaleString() : stock.price}</p>
                              <p className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stock.change >= 0 ? '+' : ''}{stock.change}%
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="font-medium">${stock.price > 1000 ? stock.price.toLocaleString() : stock.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Change</p>
                            <p className={`font-medium ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.change}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Volume</p>
                            <p className="font-medium">{stock.volume}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">AI Prediction</p>
                            <Badge variant={stock.prediction === "Buy" ? "default" : "secondary"}>
                              {stock.prediction}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className="font-medium">{stock.confidence}%</p>
                          </div>
                        </div>

                        <Button variant="ghost" size="icon" onClick={(e) => { 
                          e.stopPropagation(); 
                          console.log('Navigating to dashboard via eye button for stock:', stock.symbol);
                          onGoToDashboard(); 
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* Stock Detail View */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  {loading.stocks ? (
                    // Loading state for stock details header
                    <div className="flex items-center justify-between animate-pulse">
                      <div>
                        <div className="h-6 w-24 bg-muted rounded mb-2"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="h-5 w-16 bg-muted rounded"></div>
                    </div>
                  ) : error.stocks ? (
                    <div className="text-red-500">{error.stocks}</div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedStock.symbol}</CardTitle>
                        <CardDescription>{selectedStock.name}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {loading.stocks ? (
                    // Loading state for stock details
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-8 w-32 bg-muted rounded"></div>
                          <div className="h-4 w-16 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : error.stocks ? (
                    <div className="text-red-500">{error.stocks}</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-3xl font-bold">${selectedStock.price > 1000 ? selectedStock.price.toLocaleString() : selectedStock.price}</p>
                        <div className={`flex items-center gap-1 text-sm ${
                          selectedStock.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {selectedStock.change >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">AI Prediction</p>
                        <Badge 
                          variant={selectedStock.prediction === "Buy" ? "default" : "secondary"}
                          className="text-lg px-3 py-1"
                        >
                          {selectedStock.prediction}
                        </Badge>
                        <p className="text-sm text-muted-foreground">Next 7 days</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Confidence Score</p>
                        <div className="space-y-2">
                          <Progress value={selectedStock.confidence} className="h-2" />
                          <p className="text-sm font-medium">{selectedStock.confidence}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="text-xl font-bold">{selectedStock.marketCap}</p>
                        <p className="text-sm text-muted-foreground">{selectedStock.sector}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Price Chart (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80 bg-gradient-to-br from-muted/50 to-background rounded-lg p-3 sm:p-6 flex items-end justify-center">
                    <div className="flex items-end space-x-1 h-full w-full">
                      {chartData.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary/80 rounded-t-sm transition-all duration-300 hover:bg-primary"
                            style={{ 
                              height: `${Math.max(10, (point.price / selectedStock.price) * 60)}%` 
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>30 days ago</span>
                    <span className="text-primary font-medium">
                      ${selectedStock.price > 1000 ? selectedStock.price.toLocaleString() : selectedStock.price}
                    </span>
                    <span>Today</span>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="news">Related News</TabsTrigger>
                  <TabsTrigger value="comments">Community</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="space-y-3 sm:space-y-4">
                  {loading.chart ? (
                    // Loading state for analysis tab
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-pulse">
                      {[1, 2].map((i) => (
                        <Card key={i}>
                          <CardHeader>
                            <div className="h-5 w-32 bg-muted rounded"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex justify-between items-center">
                                  <div className="h-4 w-24 bg-muted rounded"></div>
                                  <div className="h-4 w-16 bg-muted rounded"></div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : error.chart ? (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-red-500">{error.chart}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Technical Indicators</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">RSI (14)</span>
                            <span className="font-medium">67.2</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">MACD</span>
                            <span className="font-medium text-green-500">+2.4</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Moving Average (50)</span>
                            <span className="font-medium">${(selectedStock.price * 0.95).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Volume</span>
                            <span className="font-medium">{selectedStock.volume}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Market Cap</span>
                            <span className="font-medium">{selectedStock.marketCap}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">P/E Ratio</span>
                            <span className="font-medium">24.5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">52W High</span>
                            <span className="font-medium">${(selectedStock.price * 1.2).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">52W Low</span>
                            <span className="font-medium">${(selectedStock.price * 0.7).toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="news" className="space-y-3 sm:space-y-4">
                  {loading.chart ? (
                    // Loading state for news tab
                    <Card>
                      <CardHeader>
                        <div className="h-5 w-32 bg-muted rounded"></div>
                      </CardHeader>
                      <CardContent className="space-y-4 animate-pulse">
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 bg-muted/50 rounded-lg">
                              <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
                              <div className="h-3 w-1/3 bg-muted rounded"></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : error.chart ? (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-red-500">{error.chart}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Related News</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium">Q4 Earnings Report Shows Strong Growth</p>
                            <p className="text-xs text-muted-foreground">2 hours ago • MarketWatch</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium">Analyst Upgrades Price Target</p>
                            <p className="text-xs text-muted-foreground">5 hours ago • Bloomberg</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium">New Product Launch Announcement</p>
                            <p className="text-xs text-muted-foreground">1 day ago • Reuters</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="comments" className="space-y-3 sm:space-y-4">
                  {loading.chart ? (
                    // Loading state for community tab
                    <Card>
                      <CardHeader>
                        <div className="h-5 w-40 bg-muted rounded"></div>
                      </CardHeader>
                      <CardContent className="space-y-4 animate-pulse">
                        <div className="space-y-3">
                          {[1, 2].map((i) => (
                            <div key={i} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="h-4 w-32 bg-muted rounded"></div>
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-12 bg-muted rounded"></div>
                                  <div className="h-4 w-12 bg-muted rounded"></div>
                                </div>
                              </div>
                              <div className="h-12 w-full bg-muted rounded"></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : error.chart ? (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-red-500">{error.chart}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Community Discussion</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">TradingPro_2024</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Plus className="w-3 h-3" />
                                  12
                                </Button>
                                <span className="text-xs text-muted-foreground">2h ago</span>
                              </div>
                            </div>
                            <p className="text-sm">Strong technical setup here. Looking for a breakout above $190 resistance level.</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">InvestorJane</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Plus className="w-3 h-3" />
                                  8
                                </Button>
                                <span className="text-xs text-muted-foreground">4h ago</span>
                              </div>
                            </div>
                            <p className="text-sm">Earnings beat expectations, but guidance was cautious. Mixed signals here.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}