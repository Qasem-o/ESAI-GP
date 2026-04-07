import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import { StockLogo } from "./StockLogo";
import { fetchStocks, StockPrice } from "../services/api";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  User,
  BarChart2,
  Zap,
  Target,
  Heart,
  MessageSquare,
  Share2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles
} from "lucide-react";

// Mock sectors for filter (or could fetch from DB distinct sectors)
// Helper for numbers
const formatLargeNumber = (num: number | undefined | string) => {
  if (num === "N/A" || num === undefined || num === null) return "N/A";
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return "N/A";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toLocaleString();
};

// Watchlist (Mock for now)
const watchlist = [
  { symbol: "AAPL", change: 2.4 },
  { symbol: "NVDA", change: 3.2 },
  { symbol: "TSLA", change: 5.8 }
];

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
  onGoToStockDetails: (symbol: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

interface StocksProps extends NavigationProps { }



export function Stocks({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile, onGoToStockDetails }: StocksProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [sectorStats, setSectorStats] = useState<{ name: string, count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockPrice | null>(null);

  // Helper to determine currency
  const getCurrency = (symbol: string) => {
    if (symbol.endsWith(".SR")) return "SAR";
    if (symbol.endsWith(".KW")) return "KWD";
    if (symbol.endsWith(".QA")) return "QAR";
    if (symbol.endsWith(".AD") || symbol.endsWith(".DU")) return "AED";
    if (symbol.endsWith(".CA")) return "EGP";
    return "$";
  };

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const data = await fetchStocks();
        setStocks(data);

        // Calculate dynamic sectors
        const sectorCounts: Record<string, number> = {};
        data.forEach(s => {
          const sec = s.sector || "Other";
          sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
        });

        const dynamicSectors = [
          { name: "All", count: data.length },
          ...Object.keys(sectorCounts).map(name => ({
            name,
            count: sectorCounts[name]
          })).sort((a, b) => b.count - a.count)
        ];

        setSectorStats(dynamicSectors);

        if (data.length > 0) {
          setSelectedStock(data[0]);
        }
      } catch (err) {
        console.error("Failed to load stocks", err);
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, []);

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "All" || (stock.sector && stock.sector === selectedSector);
    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <Header
        currentPage={currentPage}
        onGoToHome={onGoToHome}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sectors Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  Sectors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sectorStats.map((sector) => (
                  <button
                    key={sector.name}
                    onClick={() => setSelectedSector(sector.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedSector === sector.name
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                      }`}
                  >
                    <span className="font-medium">{sector.name}</span>
                    <span className="text-sm">{sector.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Watchlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {watchlist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <span className="font-semibold">${item.symbol}</span>
                    <Badge variant={item.change >= 0 ? "default" : "destructive"} className="text-xs">
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Stock
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Center - Stocks Grid */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Explore Stocks</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredStocks.length} stocks • Real-time data
                </p>
              </div>
              <Tabs defaultValue="grid">
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Stocks Grid */}
            <motion.div
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredStocks.map((stock) => (
                  <motion.div
                    key={stock.symbol}
                    layout
                    variants={itemVariants}
                  >
                    <Card
                      className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-primary/20 bg-card/50 backdrop-blur-sm"
                      onClick={() => onGoToStockDetails(stock.symbol)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Stock Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <StockLogo symbol={stock.symbol} name={stock.name} />
                              <div>
                                <div className="flex items-center gap-2">
                                  {/* Swapped Name and Symbol */}
                                  <h3 className="font-bold text-lg">{stock.name}</h3>
                                  <Badge variant="outline" className="text-xs">{stock.sector}</Badge>
                                </div>
                                {/* Symbol as secondary */}
                                <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Star className="w-5 h-5" />
                            </Button>
                          </div>

                          {/* Price Info */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-3xl font-bold">
                                {getCurrency(stock.symbol)} {stock.price.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className={`flex items-center gap-1 ${(stock.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {(stock.change || 0) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                  <span className="font-bold">{Math.abs(stock.change || 0)}%</span>
                                </div>
                                <span className="text-sm text-muted-foreground">Vol: {formatLargeNumber(stock.volume)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Market Cap</p>
                              <p className="font-semibold">{/*$*/}{formatLargeNumber(stock.marketCap)}</p>
                            </div>
                          </div>

                          {/* Social Stats */}
                          <div className="flex items-center gap-4 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{stock.mentions || 0} mentions</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{stock.sentiment || 0}% bullish</span>
                            </div>
                          </div>

                          {/* Top Post */}
                          {stock.topPost && (
                            <div className="bg-muted/50 rounded-lg p-3 border">
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold">{stock.topPost.author}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{stock.topPost.content}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {stock.topPost.likes}
                                </span>
                                <span className="text-primary hover:underline cursor-pointer">View discussion</span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button className="flex-1" size="sm">
                              <Zap className="w-4 h-4 mr-1" />
                              Trade
                            </Button>
                            <Button variant="outline" className="flex-1" size="sm">
                              <BarChart2 className="w-4 h-4 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Sidebar - Selected Stock Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
          >
            {selectedStock && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stock Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="flex justify-center mb-3">
                      <StockLogo symbol={selectedStock.symbol} name={selectedStock.name} />
                    </div>
                    <h3 className="font-bold text-xl">{selectedStock.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedStock.symbol}</p>
                    <div className="mt-4">
                      <p className="text-3xl font-bold">
                        {getCurrency(selectedStock.symbol)} {selectedStock.price.toLocaleString()}
                      </p>
                      <Badge
                        variant={(selectedStock.change || 0) >= 0 ? "default" : "destructive"}
                        className="mt-2"
                      >
                        {(selectedStock.change || 0) >= 0 ? '+' : ''}{selectedStock.change || 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volume</span>
                      <span className="font-medium">{formatLargeNumber(selectedStock.volume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Market Cap</span>
                      <span className="font-medium">{formatLargeNumber(selectedStock.marketCap)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sector</span>
                      <span className="font-medium">{selectedStock.sector || 'N/A'}</span>
                    </div>
                    {/* Social stats hidden if not available */}

                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <Button className="w-full" onClick={onGoToSimulator}>
                      <Zap className="w-4 h-4 mr-2" />
                      Trade in Simulator
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm">Strong upward momentum detected in the last 7 days</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm">High social media engagement and positive sentiment</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm">Earnings report expected in 2 weeks</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Full Analysis
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div >
    </div >
  );
}
