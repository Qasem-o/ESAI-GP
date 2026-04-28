import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StockLogo } from "./StockLogo";
import { fetchStocks, fetchStockPrediction, StockPrice, StockPrediction } from "../services/api";
import { portfolioAPI } from "../services/portfolioApi";
import { toast } from "sonner";
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
  Sparkles,
  Flame,
  Loader2
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

// Helper for numbers

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
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
  onGoToAdmin?: () => void;
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



export function Stocks({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile, onGoToStockDetails, onGoToSignup, onGoToLogin, onGoToAdmin }: StocksProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [sectorStats, setSectorStats] = useState<{ name: string, count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockPrice | null>(null);
  const [aiInsight, setAiInsight] = useState<StockPrediction | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [watchlisted, setWatchlisted] = useState<Record<string, boolean>>({});
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});

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

        try {
          const wl = await portfolioAPI.getWatchlist();
          const wlMap: Record<string, boolean> = {};
          wl.forEach(item => wlMap[item.stock_symbol] = true);
          setWatchlisted(wlMap);
        } catch (wlErr) {
          console.warn("Could not load watchlist", wlErr);
        }
      } catch (err) {
        console.error("Failed to load stocks", err);
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      setInsightLoading(true);
      fetchStockPrediction(selectedStock.symbol)
        .then(data => setAiInsight(data))
        .catch(() => setAiInsight(null))
        .finally(() => setInsightLoading(false));
    }
  }, [selectedStock]);

  const toggleWatchlist = async (e: React.MouseEvent, symbol: string, name: string) => {
    e.stopPropagation();
    setIsToggling(prev => ({ ...prev, [symbol]: true }));
    try {
      if (watchlisted[symbol]) {
        await portfolioAPI.removeFromWatchlist(symbol);
        setWatchlisted(prev => ({ ...prev, [symbol]: false }));
        toast.success(`${symbol} removed from watchlist`);
      } else {
        await portfolioAPI.addToWatchlist(symbol, name);
        setWatchlisted(prev => ({ ...prev, [symbol]: true }));
        toast.success(`${symbol} added to watchlist`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update watchlist");
      if (err.message === 'Session expired' && onGoToLogin) {
        onGoToLogin();
      }
    } finally {
      setIsToggling(prev => ({ ...prev, [symbol]: false }));
    }
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      (stock.symbol && stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stock.name && stock.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSector = selectedSector === "All" || (stock.sector && stock.sector === selectedSector);
    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header */}
      <Header
        currentPage={currentPage}
        onGoToHome={onGoToHome}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
        onGoToAdmin={onGoToAdmin}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            style={{ position: 'sticky', top: '6rem' }}
            className="lg:col-span-3 space-y-6 pr-1"
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

            {/* Trending Stocks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Trending Stocks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stocks
                  .slice()
                  .sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0))
                  .slice(0, 5)
                  .map((item, i) => (
                  <div key={i} onClick={() => setSelectedStock(item)} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <span className="font-semibold">${item.symbol}</span>
                    <Badge variant={(item.change || 0) >= 0 ? "default" : "destructive"} className="text-xs">
                      {(item.change || 0) >= 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Center - Stocks Grid */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold">Explore Stocks</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredStocks.length} stocks • Real-time data
                </p>
              </div>
            </div>

            {/* Stocks Grid */}
            <motion.div
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
              className="grid gap-4 pb-4 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground"
                  >
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                    <p className="text-lg font-medium text-foreground">Loading market data...</p>
                    <p className="text-sm">Fetching real-time stock quotes and community insights.</p>
                  </motion.div>
                ) : filteredStocks.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground"
                  >
                    <Search className="w-10 h-10 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-foreground">No stocks found</p>
                    <p className="text-sm">Try adjusting your search or sector filter.</p>
                  </motion.div>
                ) : (
                  filteredStocks.map((stock) => (
                  <motion.div
                    key={stock.symbol}
                    layout
                    variants={itemVariants}
                  >
                    <Card
                      className={`hover:shadow-lg transition-all cursor-pointer border-2 ${selectedStock?.symbol === stock.symbol ? 'border-primary' : 'border-transparent hover:border-primary/20'} bg-card/50 backdrop-blur-sm`}
                      onClick={() => setSelectedStock(stock)}
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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => toggleWatchlist(e, stock.symbol, stock.name)}
                              disabled={isToggling[stock.symbol]}
                            >
                              <Star className={`w-5 h-5 ${watchlisted[stock.symbol] ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
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

                          <div className="flex gap-2">
                            <Button className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); onGoToSimulator(); }}>
                              <Zap className="w-4 h-4 mr-1" />
                              Trade
                            </Button>
                            <Button variant="outline" className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); onGoToStockDetails(stock.symbol); }}>
                              <BarChart2 className="w-4 h-4 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Sidebar - Selected Stock Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            style={{ position: 'sticky', top: '6rem' }}
            className="lg:col-span-3 space-y-6 pl-1"
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => toggleWatchlist(e, selectedStock.symbol, selectedStock.name)}
                      disabled={isToggling[selectedStock.symbol]}
                    >
                      <Star className={`w-4 h-4 mr-2 ${watchlisted[selectedStock.symbol] ? "fill-yellow-500 text-yellow-500" : ""}`} />
                      {watchlisted[selectedStock.symbol] ? "Remove from Watchlist" : "Add to Watchlist"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
