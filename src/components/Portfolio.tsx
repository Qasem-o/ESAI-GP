import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Header } from "./Header";
import { useAuth } from "../contexts/AuthContext";
import {
  portfolioAPI,
  PortfolioSummary,
  Holding,
  Transaction,
  AvailableStock,
  PerformancePoint,
  WatchlistItem,
} from "../services/portfolioApi";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart,
  Activity,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Star,
  Share2,
  Calendar,
  Clock,
  Loader2,
  LogIn,
  X,
  Search,
  Minus,
  Pencil,
  Trash2,
} from "lucide-react";

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
}

interface PortfolioProps extends NavigationProps { }

// Time ago helper
function timeAgo(dateStr: string): string {
  // Ensure the date is treated as UTC if no timezone is provided
  const isoStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 5) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function Portfolio({
  currentPage,
  onGoToHome,
  onGoToStocks,
  onGoToPortfolio,
  onGoToCommunity,
  onGoToNews,
  onGoToLearn,
  onGoToSimulator,
  onGoToProfile,
  onGoToStockDetails,
  onGoToSignup,
  onGoToLogin,
}: PortfolioProps) {
  const { isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"holdings" | "transactions" | "watchlist">("holdings");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<{ 
    symbol: string; 
    name: string; 
    price: number;
    currency?: string;
    currency_symbol?: string;
    usd_price?: number;
  } | null>(null);
  const [availableStocks, setAvailableStocks] = useState<AvailableStock[]>([]);
  const [tradeShares, setTradeShares] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stockSearch, setStockSearch] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  // Edit state
  const [editHolding, setEditHolding] = useState<Holding | null>(null);
  const [editShares, setEditShares] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Fetch all portfolio data
  const fetchData = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      if (!silent) setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    setError(null);

    // Fetch summary first as it's the most important
    try {
      const summaryData = await portfolioAPI.getSummary();
      setSummary(summaryData);
    } catch (err: any) {
      console.error("Summary fetch error:", err);
    }

    // Fetch the rest in parallel but with individual catch to avoid blocking
    try {
      const [holdingsData, transactionsData, perfData, watchlistData] = await Promise.all([
        portfolioAPI.getHoldings().catch(e => { console.error(e); return []; }),
        portfolioAPI.getTransactions().catch(e => { console.error(e); return []; }),
        portfolioAPI.getPerformance().catch(e => { console.error(e); return []; }),
        portfolioAPI.getWatchlist().catch(e => { console.error(e); return []; }),
      ]);

      setHoldings(holdingsData);
      setTransactions(transactionsData);
      setPerformance(perfData);
      setWatchlist(watchlistData);
    } catch (err: any) {
      console.error("Secondary data fetch error:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData]);

  // Fetch available stocks when buy modal opens
  useEffect(() => {
    if (showBuyModal && availableStocks.length === 0) {
      portfolioAPI.getAvailableStocks().then(setAvailableStocks).catch(console.error);
    }
  }, [showBuyModal]);

  // Buy handler
  const handleBuy = async () => {
    if (!selectedStock || !tradeShares || !buyPrice) return;
    setTradeLoading(true);
    setTradeMessage(null);

    try {
      const result = await portfolioAPI.buyStock(
        selectedStock.symbol, 
        parseFloat(tradeShares), 
        parseFloat(buyPrice),
        purchaseDate || undefined
      );
      setTradeMessage({ type: "success", text: result.message });
      setTimeout(() => {
        setShowBuyModal(false);
        setSelectedStock(null);
        setTradeShares("");
        setBuyPrice("");
        setPurchaseDate("");
        setTradeMessage(null);
        fetchData();
      }, 1500);
    } catch (err: any) {
      setTradeMessage({ type: "error", text: err.message });
    } finally {
      setTradeLoading(false);
    }
  };

  // Sell handler
  const handleSell = async () => {
    if (!selectedStock || !tradeShares) return;
    setTradeLoading(true);
    setTradeMessage(null);

    try {
      const result = await portfolioAPI.sellStock(selectedStock.symbol, parseFloat(tradeShares), selectedStock.price);
      setTradeMessage({ type: "success", text: result.message });
      setTimeout(() => {
        setShowSellModal(false);
        setSelectedStock(null);
        setTradeShares("");
        setTradeMessage(null);
        fetchData();
      }, 1500);
    } catch (err: any) {
      setTradeMessage({ type: "error", text: err.message });
    } finally {
      setTradeLoading(false);
    }
  };



  // Edit handler - sells old position and buys new one
  const handleEdit = async () => {
    if (!editHolding || !editShares || !editPrice) return;
    setTradeLoading(true);
    setTradeMessage(null);
    try {
      // Sell all current shares first
      await portfolioAPI.sellStock(editHolding.stock_symbol, editHolding.shares, editHolding.current_price);
      // Buy with the new values
      await portfolioAPI.buyStock(editHolding.stock_symbol, parseFloat(editShares), parseFloat(editPrice));
      setTradeMessage({ type: "success", text: `Updated ${editHolding.stock_symbol} position successfully` });
      setTimeout(() => {
        setShowEditModal(false);
        setEditHolding(null);
        setEditShares("");
        setEditPrice("");
        setTradeMessage(null);
        fetchData();
      }, 1500);
    } catch (err: any) {
      setTradeMessage({ type: "error", text: err.message });
    } finally {
      setTradeLoading(false);
    }
  };

  // Delete handler - sells all shares
  const handleDelete = async (holding: Holding) => {
    setTradeLoading(true);
    try {
      await portfolioAPI.sellStock(holding.stock_symbol, holding.shares, holding.current_price);
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      if (err.message && !err.message.toLowerCase().includes("authenticated") && !err.message.toLowerCase().includes("expired")) {
        setError(err.message);
      }
    } finally {
      setTradeLoading(false);
    }
  };

  // Open sell modal with pre-selected stock
  const openSellModal = (holding: Holding) => {
    setSelectedStock({
      symbol: holding.stock_symbol,
      name: holding.stock_name || holding.stock_symbol,
      price: holding.current_price,
    });
    setTradeShares("");
    setTradeMessage(null);
    setShowSellModal(true);
  };

  // Open buy more modal with pre-selected stock
  const openBuyMoreModal = (holding: Holding) => {
    setSelectedStock({
      symbol: holding.stock_symbol,
      name: holding.stock_name || holding.stock_symbol,
      price: holding.current_price,
    });
    setTradeShares("");
    setBuyPrice("");
    setPurchaseDate("");
    setTradeMessage(null);
    setShowBuyModal(true);
  };

  // Open edit modal
  const openEditModal = (holding: Holding) => {
    setEditHolding(holding);
    setEditShares(String(holding.shares));
    setEditPrice(String(holding.avg_price));
    setTradeMessage(null);
    setShowEditModal(true);
  };

  const filteredStocks = availableStocks.filter(
    (s) =>
      (s.symbol && s.symbol.toLowerCase().includes(stockSearch.toLowerCase())) ||
      (s.name && s.name.toLowerCase().includes(stockSearch.toLowerCase()))
  );

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          currentPage="portfolio"
          onGoToHome={onGoToCommunity}
          onGoToExplore={onGoToStocks}
          onGoToPortfolio={onGoToPortfolio}
          onGoToSimulator={onGoToSimulator}
          onGoToProfile={onGoToProfile}
          onGoToSignup={onGoToSignup}
          onGoToLogin={onGoToLogin}
        />
        <div className="container mx-auto px-4 lg:px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Sign in to view your Portfolio</h2>
            <p className="text-muted-foreground mb-6">
              Track your holdings, make trades, and monitor performance — all in one place.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onGoToLogin} size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
              <Button onClick={onGoToSignup} variant="outline" size="lg">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          currentPage="portfolio"
          onGoToHome={onGoToCommunity}
          onGoToExplore={onGoToStocks}
          onGoToPortfolio={onGoToPortfolio}
          onGoToSimulator={onGoToSimulator}
          onGoToProfile={onGoToProfile}
          onGoToSignup={onGoToSignup}
          onGoToLogin={onGoToLogin}
        />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage="portfolio"
        onGoToHome={onGoToCommunity}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
      />

      {/* Error Banner */}
      {error && (
        <div className="container mx-auto px-4 lg:px-6 py-2">
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={fetchData}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Portfolio Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Portfolio Value Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-4xl font-bold">
                    ${summary ? summary.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={(summary?.total_gain ?? 0) >= 0 ? "default" : "destructive"}>
                      {(summary?.total_gain ?? 0) >= 0 ? "+" : ""}
                      ${Math.abs(summary?.total_gain ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Badge>
                    <span
                      className={`flex items-center text-sm font-medium ${(summary?.gain_percentage ?? 0) >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                    >
                      {(summary?.gain_percentage ?? 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(summary?.gain_percentage ?? 0)}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Investment</span>
                    <span className="font-medium">
                      ${summary ? summary.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Day Change</span>
                    <span
                      className={`font-medium ${(summary?.day_change ?? 0) >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                    >
                      {(summary?.day_change ?? 0) >= 0 ? "+" : ""}
                      ${Math.abs(summary?.day_change ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Holdings</span>
                    <span className="font-medium">
                      {summary ? summary.holdings_count : 0} stocks
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  7-Day Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {performance.length > 0 ? performance.slice(0, 7).map((day, idx) => {
                    const values = performance.map((p) => p.value);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const range = max - min || 1;
                    // Normalize height between 20% and 100%
                    const height = ((day.value - min) / range) * 80 + 20;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-muted/20 rounded-t-sm h-full relative overflow-hidden">
                          <div
                            className="absolute bottom-0 w-full bg-primary/60 rounded-t-sm transition-all duration-500 hover:bg-primary"
                            style={{ height: `${height}%` }}
                            title={`$${day.value.toLocaleString()}`}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{day.day}</span>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/5 border border-dashed rounded-lg">
                      <div className="text-center px-4">
                        <p className="text-sm text-muted-foreground font-medium">No performance data yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-wider">Keep trading to see history</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {holdings.length > 0 ? (
                  holdings.slice(0, 5).map((holding, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{holding.stock_symbol}</span>
                        <span className="text-muted-foreground">{holding.allocation}%</span>
                      </div>
                      <Progress value={holding.allocation} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No holdings yet. Add your first stock!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button
                  onClick={() => {
                    setSelectedStock(null);
                    setTradeShares("");
                    setBuyPrice("");
                    setTradeMessage(null);
                    setStockSearch("");
                    setPurchaseDate("");
                    setShowBuyModal(true);
                  }}
                  className="w-full justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock to Portfolio
                </Button>
                <Button onClick={onGoToSimulator} variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Practice Trading
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Holdings & Transactions */}
          <div className="lg:col-span-8 space-y-4">
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              </TabsList>

              {/* Holdings Tab */}
              <TabsContent value="holdings" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{holdings.length} Position{holdings.length !== 1 ? "s" : ""}</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={async () => {
                        if (confirm("Are you sure you want to reset your portfolio? This will sell all holdings and delete all transactions.")) {
                          try {
                            setTradeLoading(true);
                            await portfolioAPI.resetPortfolio();
                            await fetchData(true);
                          } catch (err: any) {
                            console.error(err);
                          } finally {
                            setTradeLoading(false);
                          }
                        }
                      }}
                      disabled={tradeLoading || holdings.length === 0}
                    >
                      {tradeLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      Reset Portfolio
                    </Button>
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedStock(null);
                        setTradeShares("");
                        setBuyPrice("");
                        setTradeMessage(null);
                        setStockSearch("");
                        setPurchaseDate("");
                        setShowBuyModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Stock
                    </Button>
                  </div>
                </div>

                {holdings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Holdings Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your portfolio by adding your first stock.
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedStock(null);
                        setTradeShares("");
                        setBuyPrice("");
                        setTradeMessage(null);
                        setStockSearch("");
                        setPurchaseDate("");
                        setShowBuyModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Stock
                    </Button>
                  </Card>
                ) : (
                  holdings.map((holding) => (
                    <Card key={holding.holding_id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Stock Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary">
                                  {holding.stock_symbol.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-lg">${holding.stock_symbol}</h3>
                                  <Badge
                                    variant={holding.day_change >= 0 ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {holding.day_change >= 0 ? "+" : ""}
                                    {holding.day_change}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{holding.stock_name}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Star className="w-5 h-5" />
                            </Button>
                          </div>

                          {/* Position Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Shares</p>
                              <p className="font-semibold">{holding.shares}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Buy Price</p>
                              <p className="font-semibold">
                                {holding.currency_symbol || "$"}{holding.avg_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                {holding.currency && holding.currency !== "USD" && <span className="text-[10px] text-muted-foreground ml-1">{holding.currency}</span>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                              <p className="font-semibold">
                                {holding.currency_symbol || "$"}{holding.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Total Value (USD)</p>
                              <p className="font-bold text-primary">${holding.total_value.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* P&L */}
                          <div className="bg-muted/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Gain/Loss</p>
                                <p
                                  className={`text-2xl font-bold ${holding.gain >= 0 ? "text-green-500" : "text-red-500"
                                    }`}
                                >
                                  {holding.gain >= 0 ? "+" : ""}
                                  ${Math.abs(holding.gain).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`flex items-center gap-1 ${holding.gain_percentage >= 0 ? "text-green-500" : "text-red-500"
                                    }`}
                                >
                                  {holding.gain_percentage >= 0 ? (
                                    <TrendingUp className="w-6 h-6" />
                                  ) : (
                                    <TrendingDown className="w-6 h-6" />
                                  )}
                                  <span className="text-2xl font-bold">
                                    {Math.abs(holding.gain_percentage)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button variant="outline" className="flex-1 cursor-pointer" size="sm" onClick={() => onGoToStockDetails(holding.stock_symbol)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 cursor-pointer"
                              size="sm"
                              onClick={() => openEditModal(holding)}
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 cursor-pointer"
                              size="sm"
                              onClick={() => openBuyMoreModal(holding)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Buy More
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(holding.stock_symbol)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Recent Transactions</h2>
                </div>

                {transactions.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
                    <p className="text-muted-foreground mb-4">Your buy and sell transactions will appear here.</p>
                  </Card>
                ) : (
                  transactions.map((transaction) => (
                    <Card key={transaction.transaction_id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.transaction_type === "buy"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                                }`}
                            >
                              {transaction.transaction_type === "buy" ? (
                                <ArrowUpRight className="w-6 h-6" />
                              ) : (
                                <ArrowDownRight className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold">
                                  {transaction.transaction_type === "buy" ? "Bought" : "Sold"} $
                                  {transaction.stock_symbol}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.shares} shares
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                @ ${transaction.price} • Total: ${transaction.total.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Watchlist Tab */}
              <TabsContent value="watchlist" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">My Watchlist</h2>
                  <p className="text-sm text-muted-foreground">{watchlist.length} stock{watchlist.length !== 1 ? 's' : ''}</p>
                </div>

                {watchlist.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Watchlist Items</h3>
                    <p className="text-muted-foreground mb-4">
                      Click the star icon on any stock page to add it to your watchlist.
                    </p>
                    <Button onClick={onGoToStocks}>
                      <Search className="w-4 h-4 mr-2" />
                      Explore Stocks
                    </Button>
                  </Card>
                ) : (
                  watchlist.map((item) => (
                    <Card key={item.watchlist_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{item.stock_symbol}</h3>
                              <p className="text-sm text-muted-foreground">{item.stock_name}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-lg font-bold">
                                {item.currency_symbol || '$'}{(item.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                              {item.sector && (
                                <Badge variant="outline" className="text-xs">{item.sector}</Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                              onClick={async () => {
                                try {
                                  await portfolioAPI.removeFromWatchlist(item.stock_symbol);
                                  setWatchlist(prev => prev.filter(w => w.watchlist_id !== item.watchlist_id));
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 mt-3 border-t">
                          <Button variant="outline" className="flex-1" size="sm" onClick={() => onGoToStockDetails(item.stock_symbol)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button className="flex-1" size="sm" onClick={() => {
                            setSelectedStock({
                              symbol: item.stock_symbol,
                              name: item.stock_name,
                              price: item.current_price,
                              currency: item.currency,
                              currency_symbol: item.currency_symbol,
                            });
                            setTradeShares("");
                            setBuyPrice("");
                            setPurchaseDate("");
                            setTradeMessage(null);
                            setShowBuyModal(true);
                          }}>
                            <Plus className="w-4 h-4 mr-1" />
                            Buy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* =============== ADD STOCK / BUY MODAL =============== */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border rounded-2xl shadow-2xl mx-4" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Add Stock to Portfolio
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedStock(null);
                  setTradeMessage(null);
                  setPurchaseDate("");
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {!selectedStock ? (
                <>
                  {/* Stock Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Stock List */}
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() =>
                          setSelectedStock({
                            symbol: stock.symbol,
                            name: stock.name,
                            price: stock.current_price,
                            currency: stock.currency,
                            currency_symbol: stock.currency_symbol,
                            usd_price: stock.usd_price
                          })
                        }
                        className="w-full flex items-center p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/80 hover:border-primary/50 transition-all text-left overflow-hidden cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center shrink-0 mr-4">
                          <span className="font-bold text-primary">{stock.symbol.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold truncate">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-bold text-primary">
                            {stock.currency_symbol || "$"}{(stock.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          {stock.currency && stock.currency !== "USD" && (
                             <p className="text-[10px] text-muted-foreground">≈ ${stock.usd_price?.toFixed(2)} USD</p>
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredStocks.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No stocks found</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Selected stock info */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                      <span className="font-bold text-primary">{selectedStock.symbol.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{selectedStock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{selectedStock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {selectedStock.currency_symbol || "$"}{(selectedStock.price || 0).toLocaleString()}
                        {selectedStock.currency && selectedStock.currency !== "USD" && <span className="text-[10px] text-muted-foreground ml-1">{selectedStock.currency}</span>}
                      </p>
                      <button
                        className="text-xs text-primary hover:underline cursor-pointer"
                        onClick={() => setSelectedStock(null)}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Shares input */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Number of Shares</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={tradeShares}
                      onChange={(e) => setTradeShares(e.target.value)}
                      placeholder="Enter number of shares"
                      className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Buy Price input */}
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      Buy Price <span className="text-muted-foreground font-normal">(per share)</span>
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      placeholder="Enter your buy price"
                      className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Purchase Date (optional) */}
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Purchase Date <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Cost preview */}
                  {tradeShares && buyPrice && parseFloat(tradeShares) > 0 && parseFloat(buyPrice) > 0 && (
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total ({selectedStock.currency || "USD"})</span>
                        <span className="font-semibold">
                          {selectedStock.currency_symbol || "$"}{(parseFloat(tradeShares) * parseFloat(buyPrice)).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {selectedStock.currency && selectedStock.currency !== "USD" && (
                        <div className="flex justify-between text-sm pt-1 border-t">
                          <span className="font-semibold">Total (USD)</span>
                          <span className="font-bold text-primary">
                            ${(parseFloat(tradeShares) * parseFloat(buyPrice) * ((selectedStock.usd_price || 0) / (selectedStock.price || 1))).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trade message */}
                  {tradeMessage && (
                    <div
                      className={`p-3 rounded-lg text-sm ${tradeMessage.type === "success"
                          ? "bg-green-500/10 text-green-500 border border-green-500/30"
                          : "bg-red-500/10 text-red-500 border border-red-500/30"
                        }`}
                    >
                      {tradeMessage.text}
                    </div>
                  )}

                  {/* Buy button */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!tradeShares || !buyPrice || parseFloat(tradeShares) <= 0 || parseFloat(buyPrice) <= 0 || tradeLoading}
                    onClick={handleBuy}
                  >
                    {tradeLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add to Portfolio
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =============== SELL STOCK MODAL =============== */}
      {showSellModal && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border rounded-2xl shadow-2xl mx-4" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Minus className="w-5 h-5 text-red-500" />
                Sell {selectedStock.symbol}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowSellModal(false);
                  setSelectedStock(null);
                  setTradeMessage(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <span className="font-bold text-red-500">{selectedStock.symbol.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedStock.symbol}</p>
                  <p className="text-xs text-muted-foreground">{selectedStock.name}</p>
                </div>
                <p className="font-semibold">${(selectedStock.price || 0).toLocaleString()}</p>
              </div>

              {(() => {
                const h = holdings.find((x) => x.stock_symbol === selectedStock.symbol);
                return h ? (
                  <p className="text-sm text-muted-foreground">
                    You currently hold <span className="font-semibold text-foreground">{h.shares}</span> shares
                  </p>
                ) : null;
              })()}

              <div>
                <label className="text-sm font-medium mb-1 block">Shares to Sell</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={tradeShares}
                  onChange={(e) => setTradeShares(e.target.value)}
                  placeholder="Enter number of shares"
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {tradeShares && parseFloat(tradeShares) > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Proceeds</span>
                    <span className="font-semibold text-green-500">
                      +$
                      {(parseFloat(tradeShares) * (selectedStock.price || 0)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}

              {tradeMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${tradeMessage.type === "success"
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : "bg-red-500/10 text-red-500 border border-red-500/30"
                    }`}
                >
                  {tradeMessage.text}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                variant="destructive"
                disabled={!tradeShares || parseFloat(tradeShares) <= 0 || tradeLoading}
                onClick={handleSell}
              >
                {tradeLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Minus className="w-4 h-4 mr-2" />
                )}
                Sell {tradeShares ? parseFloat(tradeShares) : 0} Shares
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =============== EDIT STOCK MODAL =============== */}
      {showEditModal && editHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border rounded-2xl shadow-2xl mx-4" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                Edit {editHolding.stock_symbol}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowEditModal(false);
                  setEditHolding(null);
                  setTradeMessage(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <span className="font-bold text-primary">{editHolding.stock_symbol.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{editHolding.stock_symbol}</p>
                  <p className="text-xs text-muted-foreground">{editHolding.stock_name}</p>
                </div>
                <p className="font-semibold">${(editHolding.current_price || 0).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Number of Shares</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={editShares}
                  onChange={(e) => setEditShares(e.target.value)}
                  placeholder="Enter number of shares"
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Buy Price (per share)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Enter buy price"
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {editShares && editPrice && (
                <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Investment</span>
                    <span className="font-semibold">
                      ${(parseFloat(editShares) * parseFloat(editPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Value</span>
                    <span className="font-semibold">
                      ${(parseFloat(editShares) * (editHolding.current_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {tradeMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${tradeMessage.type === "success"
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : "bg-red-500/10 text-red-500 border border-red-500/30"
                    }`}
                >
                  {tradeMessage.text}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={!editShares || !editPrice || parseFloat(editShares) <= 0 || tradeLoading}
                onClick={handleEdit}
              >
                {tradeLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =============== DELETE CONFIRM MODAL =============== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border rounded-2xl shadow-2xl mx-4 p-6" style={{ maxWidth: '400px', width: '100%' }}>
            <h2 className="text-lg font-bold mb-2">Delete {showDeleteConfirm}?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will remove this stock from your portfolio and sell all shares at the current market price.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={tradeLoading}
                onClick={() => {
                  const h = holdings.find((x) => x.stock_symbol === showDeleteConfirm);
                  if (h) handleDelete(h);
                }}
              >
                {tradeLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}