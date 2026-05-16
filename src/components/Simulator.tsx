import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import { simulatorAPI } from "../services/simulatorApi";
import { portfolioAPI } from "../services/portfolioApi";
import { useLanguage } from "../contexts/LanguageContext";

import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Search,
  Zap,
  RefreshCw,
  Plus,
  Minus,
  Loader2,
  Trophy
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
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
}

interface SimulatorProps extends NavigationProps { }

export function Simulator({ onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin }: SimulatorProps) {
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [selectedTab, setSelectedTab] = useState<"trade" | "positions">("trade");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isTradeLoading, setIsTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{type: "success"|"error", text: string} | null>(null);

  // States
  const [summary, setSummary] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [availableStocks, setAvailableStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      if (!silent) setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    try {
      // Fetch stocks separately so it doesn't block simulator data
      try {
        const stocksData = await portfolioAPI.getAvailableStocks();
        setAvailableStocks(stocksData);
        setSelectedStock((prev: any) => {
          if (prev) {
            const updated = stocksData.find((s: any) => s.symbol === prev.symbol);
            if (updated && updated.current_price !== prev.current_price) return updated;
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to fetch stocks", err);
      }

      // Always fetch simulator data
      try {
        const [sumData, holdData] = await Promise.all([
          simulatorAPI.getSummary(),
          simulatorAPI.getHoldings()
        ]);
        setSummary(sumData);
        setHoldings(holdData);
      } catch (err) {
        console.error("Failed to fetch simulator data", err);
      }
      
    } catch (err: any) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const translateMessage = (message: string) => {
    if (!message) return message;
    
    // Insufficient cash
    if (message.includes("Insufficient cash")) {
      const match = message.match(/Available: \$([\d.]+), Required: \$([\d.]+)/);
      if (match) {
        return t.simulator.messages.insufficientCash
          .replace("${available}", match[1])
          .replace("${required}", match[2]);
      }
    }
    
    // Already won
    if (message.includes("already won the simulation")) {
      return t.simulator.messages.alreadyWon;
    }
    
    // No shares
    if (message.includes("You don't hold any shares of")) {
      const symbol = message.split("shares of ")[1];
      return t.simulator.messages.noShares.replace("${symbol}", symbol || "");
    }
    
    // Insufficient shares
    if (message.includes("Insufficient shares")) {
      return t.simulator.messages.insufficientShares;
    }
    
    // Buy success
    if (message.includes("Successfully bought")) {
      const match = message.match(/bought ([\d.]+) shares of ([A-Z.]+) at \$([\d.]+)/);
      if (match) {
        return t.simulator.messages.buySuccess
          .replace("${shares}", match[1])
          .replace("${symbol}", match[2])
          .replace("${price}", match[3]);
      }
    }
    
    // Sell success
    if (message.includes("Successfully sold")) {
      const match = message.match(/sold ([\d.]+) shares of ([A-Z.]+) at \$([\d.]+)/);
      if (match) {
        return t.simulator.messages.sellSuccess
          .replace("${shares}", match[1])
          .replace("${symbol}", match[2])
          .replace("${price}", match[3]);
      }
    }
    
    // Reset success
    if (message.includes("Simulation reset successfully")) {
      return t.simulator.messages.resetSuccess;
    }
    
    return message;
  };

  const handleTrade = async () => {
    if (!selectedStock || !shares || parseFloat(shares) <= 0) return;
    setIsTradeLoading(true);
    setTradeMessage(null);
    try {
      let res;
      if (tradeType === "buy") {
        res = await simulatorAPI.buyStock(selectedStock.symbol, parseFloat(shares), selectedStock.current_price);
      } else {
        res = await simulatorAPI.sellStock(selectedStock.symbol, parseFloat(shares), selectedStock.current_price);
      }
      setTradeMessage({ type: "success", text: translateMessage(res.message) });
      setShares("");
      // Immediately refresh data after trade
      try {
        const [sumData, holdData] = await Promise.all([
          simulatorAPI.getSummary(),
          simulatorAPI.getHoldings()
        ]);
        setSummary(sumData);
        setHoldings(holdData);
      } catch (e) {
        console.error("Refresh after trade failed", e);
      }
    } catch (err: any) {
      setTradeMessage({ type: "error", text: translateMessage(err.message) });
    } finally {
      setIsTradeLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t.simulator.resetPortfolioConfirm)) return;
    setIsTradeLoading(true);
    try {
      const res = await simulatorAPI.resetSimulator();
      setTradeMessage({ type: "success", text: translateMessage(res.message) });
      setShares("");
      // Immediately refresh
      try {
        const [sumData, holdData] = await Promise.all([
          simulatorAPI.getSummary(),
          simulatorAPI.getHoldings()
        ]);
        setSummary(sumData);
        setHoldings(holdData);
      } catch (e) {
        console.error("Refresh after reset failed", e);
      }
    } catch (err: any) {
      setTradeMessage({ type: "error", text: translateMessage(err.message) });
    } finally {
      setIsTradeLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedStock) return "0.00";
    const numShares = parseFloat(shares) || 0;
    return (numShares * selectedStock.current_price).toFixed(2);
  };

  const calculateTotalUsd = () => {
    if (!selectedStock) return "0.00";
    const numShares = parseFloat(shares) || 0;
    const usdPrice = selectedStock.usd_price || selectedStock.current_price;
    return (numShares * usdPrice).toFixed(2);
  };

  const filteredStocks = availableStocks.filter(s => 
    (s.symbol && s.symbol.toLowerCase().includes(search.toLowerCase())) || 
    (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Dynamic progress calculation
  const totalValue = summary?.total_value || 0;
  const startBalance = summary?.starting_balance || 2000;
  const progressPercent = Math.min(100, Math.max(0, ((totalValue - startBalance) / (10000 - startBalance)) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header

        currentPage="simulator"
        onGoToHome={onGoToCommunity}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
      />

      <div className="flex-1 container mx-auto px-4 lg:px-6 py-6">
        {isLoading && !summary ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground animate-pulse">{t.simulator.loadingSimulator}</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">{t.simulator.signInToUse}</h2>
            <Button onClick={onGoToLogin}>{t.auth.loginTitle}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar - Portfolio Summary */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Win Banner */}
              {summary?.is_completed && (
                <Card className="bg-yellow-500/10 border-yellow-500/50">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">{t.simulator.winTargetReached}</h2>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
                      {t.simulator.winTargetReached}! ${startBalance.toLocaleString()} {"->"} ${totalValue.toLocaleString()}!
                    </p>
                    <Button onClick={handleReset} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer">
                      {t.simulator.playAgain}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Virtual Portfolio Card */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {t.simulator.simulatorChallenge}
                    </CardTitle>
                    <Badge variant="secondary">{t.simulator.goal10k}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t.simulator.availableCash}</p>
                    <p className="text-4xl font-bold">${(summary?.cash ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={(summary?.portfolio_change ?? 0) >= 0 ? "default" : "destructive"}>
                        {(summary?.portfolio_change ?? 0) >= 0 ? '+' : ''}{(summary?.portfolio_change ?? 0).toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">{t.profile.portfolioPerformance}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-purple-500/10">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.profile.tradesCount}</p>
                      <p className="text-lg font-bold">{summary?.total_trades || 0}</p>
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.profile.winRate}</p>
                      <p className="text-lg font-bold">{summary?.win_rate || 0}%</p>
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? 'متوسط العائد' : 'Avg Return'}</p>
                      <p className={`text-lg font-bold ${(summary?.avg_return ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(summary?.avg_return ?? 0) >= 0 ? '+' : ''}{(summary?.avg_return ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? 'أفضل صفقة' : 'Best Trade'}</p>
                      <p className="text-lg font-bold text-green-500">
                        +{(summary?.best_trade ?? 0).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.portfolio.totalValue}</span>
                      <span className="font-bold">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.simulator.inStocks}</span>
                      <span className="font-medium">${(totalValue - (summary?.cash || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.simulator.startingBalance}</span>
                      <span className="font-medium">${startBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress towards 10k */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${startBalance.toLocaleString()}</span>
                      <span>$10,000</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs text-muted-foreground ${isRTL ? 'text-left' : 'text-right'}`}>
                      {progressPercent > 0 ? `${progressPercent.toFixed(1)}% ${t.simulator.progressComplete}` : t.simulator.startTradingProgress}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full cursor-pointer" onClick={handleReset} disabled={isTradeLoading}>
                    <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t.simulator.resetChallenge}
                  </Button>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              {holdings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {t.portfolio.assetAllocation}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {holdings.map((h: any, i: number) => {
                      const allocation = totalValue > 0 ? ((h.total_value / totalValue) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{h.stock_symbol}</span>
                            <span className="text-muted-foreground">{allocation.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${allocation}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {/* Cash portion */}
                    {(() => {
                      const cashAlloc = totalValue > 0 ? (((summary?.cash || 0) / totalValue) * 100) : (summary?.cash > 0 ? 100 : 0);
                      return cashAlloc > 0 ? (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{isRTL ? 'السيولة' : 'Cash'}</span>
                            <span className="text-muted-foreground">{cashAlloc.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                              style={{ width: `${cashAlloc}%` }}
                            />
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Center - Trading Interface */}
            <div className="lg:col-span-8 space-y-4">
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} dir={isRTL ? "rtl" : "ltr"}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="trade" className="cursor-pointer">{t.simulator.buyStock} / {t.simulator.sellStock}</TabsTrigger>
                  <TabsTrigger value="positions" className="cursor-pointer">{t.simulator.positions} ({holdings.length})</TabsTrigger>
                </TabsList>

                {/* Trade Tab */}
                <TabsContent value="trade" className="space-y-4 mt-4">
                  {/* Trading Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">{t.simulator.placeOrder}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {tradeMessage && (
                        <div className={`p-3 rounded-lg text-sm ${tradeMessage.type === 'error' ? 'bg-red-50 text-red-500 dark:bg-red-950/50' : 'bg-green-50 text-green-600 dark:bg-green-900/30'}`}>
                          {tradeMessage.text}
                        </div>
                      )}

                      {/* Buy/Sell Toggle */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={tradeType === "buy" ? "default" : "outline"}
                          onClick={() => setTradeType("buy")}
                          className="h-12 cursor-pointer"
                        >
                          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t.simulator.buy}
                        </Button>
                        <Button
                          variant={tradeType === "sell" ? "default" : "outline"}
                          onClick={() => setTradeType("sell")}
                          className="h-12 cursor-pointer"
                        >
                          <Minus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t.simulator.sell}
                        </Button>
                      </div>

                      {/* Conditional Search vs Options */}
                      {!selectedStock ? (
                        <>
                          {/* Stock Search */}
                          <div className="relative">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                            <input
                              type="text"
                              placeholder={t.explore.searchPlaceholder}
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm`}
                            />
                          </div>

                          {/* Stock List */}
                          <div className={`flex flex-col gap-2 max-h-[400px] overflow-y-auto ${isRTL ? 'pl-2' : 'pr-2'} custom-scrollbar`}>
                            {filteredStocks.map((stock: any) => {
                              const isUSD = stock.currency === 'USD' || !stock.currency;
                              const currSymbol = stock.currency_symbol || '$';
                              return (
                                <button
                                  key={stock.symbol}
                                  onClick={() => {
                                    setSelectedStock(stock);
                                    setShares("");
                                    setTradeMessage(null);
                                  }}
                                  className="w-full flex items-center p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/80 hover:border-primary/50 transition-all overflow-hidden cursor-pointer gap-4"
                                  dir="ltr"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-primary">{stock.symbol.charAt(0)}</span>
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-semibold truncate">{stock.symbol}</p>
                                    <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-primary">
                                      {currSymbol}{stock.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    {!isUSD && (
                                      <p className="text-xs text-muted-foreground">
                                        ≈ ${stock.usd_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                      </p>
                                    )}
                                    {!isUSD && (
                                      <div className="mt-0.5"><Badge variant="outline" className="text-[10px] px-1.5 py-0">{stock.currency}</Badge></div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                            {filteredStocks.length === 0 && (
                              <p className="text-center text-muted-foreground py-8">{t.explore.noStocksFound}</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Selected stock info */}
                          {(() => {
                            const isUSD = selectedStock.currency === 'USD' || !selectedStock.currency;
                            const currSymbol = selectedStock.currency_symbol || '$';
                            return (
                              <div className="space-y-3">
                                <Button 
                                  variant="ghost" 
                                  className={`-mx-2 px-2 text-muted-foreground hover:text-foreground`}
                                  onClick={() => setSelectedStock(null)}
                                >
                                  {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                                  {isRTL ? 'العودة للقائمة' : 'Back to list'}
                                </Button>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-primary">{selectedStock.symbol.charAt(0)}</span>
                                  </div>
                                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <p className="font-semibold truncate">{selectedStock.symbol}</p>
                                    <p className="text-xs text-muted-foreground truncate">{selectedStock.name}</p>
                                  </div>
                                  <div className={`${isRTL ? 'text-left' : 'text-right'} shrink-0`}>
                                    <p className="font-semibold" dir="ltr">
                                      {currSymbol}{selectedStock.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      {!isUSD && <span className="text-xs text-muted-foreground ml-1">{selectedStock.currency}</span>}
                                    </p>
                                    {!isUSD && (
                                      <p className="text-xs text-green-600 dark:text-green-400" dir="ltr">
                                        ≈ ${selectedStock.usd_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Shares Input */}
                          <div className={isRTL ? "text-right" : "text-left"}>
                            <label className="text-sm font-medium mb-1 block">{t.simulator.sharesLabel}</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={shares}
                              onChange={(e) => setShares(e.target.value)}
                              placeholder={t.simulator.sharesPlaceholder}
                              className={`w-full px-5 py-3.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}
                            />
                          </div>

                          {/* Order Summary */}
                          {(() => {
                            const isUSD = selectedStock.currency === 'USD' || !selectedStock.currency;
                            const currSymbol = selectedStock.currency_symbol || '$';
                            return (
                              <div className="bg-muted/50 rounded-lg p-4 border space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">{t.portfolio.shares}</span>
                                  <span className="font-medium">{shares || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">{t.simulator.pricePerShare}</span>
                                  <span className="font-medium">
                                    {currSymbol}{selectedStock?.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                    {!isUSD && <span className={`text-xs text-muted-foreground ${isRTL ? 'mr-1' : 'ml-1'}`}>({selectedStock.currency})</span>}
                                  </span>
                                </div>
                                {!isUSD && (
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t.common.total} ({selectedStock.currency})</span>
                                    <span>{currSymbol}{Number(calculateTotal()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-2 border-t">
                                  <span className="font-semibold">{t.simulator.totalUsd}</span>
                                  <span className="font-bold text-lg">
                                    ${Number(calculateTotalUsd()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Submit Button */}
                          <Button
                            className="w-full h-12 text-lg cursor-pointer"
                            disabled={!shares || parseFloat(shares) <= 0 || isTradeLoading || summary?.is_completed}
                            onClick={handleTrade}
                          >
                            {isTradeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (tradeType === "buy" ? t.simulator.placeBuyOrder : t.simulator.placeSellOrder)}
                          </Button>

                          <p className="text-xs text-center text-muted-foreground">
                            {t.simulator.tradeSimulatedDisclaimer}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Positions Tab */}
                <TabsContent value="positions" className="space-y-4 mt-4">
                  {holdings.length === 0 ? (
                    <Card>
                      <CardContent className="py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t.simulator.noPositions}</h3>
                        <p className="text-muted-foreground mb-4">{t.simulator.startTradingProgress}</p>
                        <Button className="cursor-pointer" onClick={() => setSelectedTab("trade")}>{t.simulator.buyStock}</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    holdings.map((position: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Position Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                                  <span className="text-xl font-bold text-primary">{position.stock_symbol.charAt(0)}</span>
                                </div>
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                  <h3 className="font-bold text-lg">{position.stock_symbol}</h3>
                                  <p className="text-sm text-muted-foreground">{position.stock_name}</p>
                                </div>
                              </div>
                            </div>

                            {/* Position Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className={isRTL ? 'text-right' : 'text-left'}>
                                <p className="text-xs text-muted-foreground mb-1">{t.portfolio.shares}</p>
                                <p className="font-semibold">{position.shares}</p>
                              </div>
                              <div className={isRTL ? 'text-right' : 'text-left'}>
                                <p className="text-xs text-muted-foreground mb-1">{t.portfolio.avgCost}</p>
                                <p className="font-semibold">${position.avg_price}</p>
                              </div>
                              <div className={isRTL ? 'text-right' : 'text-left'}>
                                <p className="text-xs text-muted-foreground mb-1">{t.portfolio.currentPrice}</p>
                                <p className="font-semibold">${position.current_price?.toFixed(2)}</p>
                              </div>
                              <div className={isRTL ? 'text-right' : 'text-left'}>
                                <p className="text-xs text-muted-foreground mb-1">{t.portfolio.totalValue}</p>
                                <p className="font-semibold">${position.total_value.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* P&L */}
                            <div className="bg-muted/50 rounded-lg p-4 border">
                              <div className="flex items-center justify-between">
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                  <p className="text-sm text-muted-foreground mb-1">{t.portfolio.gainLoss}</p>
                                  <p className={`text-2xl font-bold ${position.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {position.gain >= 0 ? '+' : ''}${Math.abs(position.gain).toLocaleString()}
                                  </p>
                                </div>
                                <div className={`flex items-center gap-1 ${position.gain_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {position.gain_percentage >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                  <span className="text-2xl font-bold">{Math.abs(position.gain_percentage)}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              <Button 
                                variant="outline" 
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                  setTradeType("buy");
                                  const s = availableStocks.find((st: any) => st.symbol === position.stock_symbol);
                                  if (s) setSelectedStock(s);
                                  setSelectedTab("trade");
                                }}
                              >
                                {t.portfolio.buyMore}
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                  setTradeType("sell");
                                  const s = availableStocks.find((st: any) => st.symbol === position.stock_symbol);
                                  if (s) setSelectedStock(s);
                                  setSelectedTab("trade");
                                }}
                              >
                                {t.portfolio.sell}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
