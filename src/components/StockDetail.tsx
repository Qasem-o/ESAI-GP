import { useState, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DefaultAvatar } from "./DefaultAvatar";
import { Footer } from "./Footer";
import { fetchStockPrice, fetchStocks, fetchStockTechnicals, fetchStockPrediction, fetchStockSentiment, fetchStockNews, StockPrice, StockTechnical, StockPrediction, StockSentiment, NewsItem, ChartData, fetchChartData, MonthlyPredictionsResponse, UpdateInfo, fetchMonthlyPredictions, fetchUpdateInfo } from "../services/api";
import { communityAPI, FeedPost } from "../services/communityApi";
import { PostCard } from "./PostCard";
import { portfolioAPI } from "../services/portfolioApi";
import { useAuth } from "../contexts/AuthContext";
import { StockLogo } from "./StockLogo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { LoadingScreen } from "./LoadingScreen";

interface CustomPost {
  id: number;
  author: string;
  username: string;
  badge: string;
  content: string;
  timeAgo: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  position?: string;
}

// ... existing code ...
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  User,
  ArrowLeft,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Plus,
  Bell,
  BarChart2,
  Activity,
  Clock,
  Eye,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Users,
  MoreHorizontal,
  ExternalLink,
  Sparkles,
  Brain,
  TrendingUpDown,
  ChevronUp,
  ChevronDown,
  FileText
} from "lucide-react";

const API_URL = "https://esai-firstdraft.onrender.com";

// Mock stock data
const stockData = {
  symbol: "NVDA",
  name: "NVIDIA Corporation",
  price: 875.30,
  yesterdayPrice: 846.90,
  change: 28.40,
  changePercent: 3.35,
  open: 850.20,
  high: 882.50,
  low: 848.90,
  volume: "38.7M",
  marketCap: "2.16T",
  peRatio: 68.5,
  eps: 12.78,
  week52High: 892.50,
  week52Low: 412.30,
  dividendYield: 0.0004,
  avgVolume: "42.3M",
  sector: "Technology",
  industry: "Semiconductors",
  about: "NVIDIA Corporation is a leading designer of graphics processing units (GPUs) for gaming, professional visualization, data centers, and automotive markets. The company has become a dominant force in AI and machine learning hardware."
};

// AI Prediction Data
const aiPrediction = {
  tomorrowPrice: 892.40,
  confidence: 87,
  direction: "bullish" as const,
  priceChange: 17.10,
  changePercent: 1.95,
  reasoning: [
    "Strong momentum based on recent earnings beat (+15% vs expectations)",
    "Technical indicators showing continued bullish trend with RSI at 72",
    "Institutional buying pressure increased by 23% in the last 5 days",
    "Positive sentiment from analyst upgrades (28 Strong Buy ratings)"
  ],
  recommendation: "BUY",
  targetPrice: 950.00,
  stopLoss: 840.00,
  riskLevel: "Medium" as const
};

// Community posts about this stock
// types for internal post structure if needed
interface CustomPost extends FeedPost {}
const stockPosts = [
  {
    id: 1,
    author: "Sarah Chen",
    username: "sarahtrader",
    badge: "Pro Trader",
    content: "Just analyzed NVDA's latest earnings report. Revenue beat expectations by 15%, and their AI chip demand is through the roof. The data center segment alone grew 217% YoY. I'm extremely bullish on this for Q2. What's your take?",
    timeAgo: "2h ago",
    likes: 456,
    comments: 67,
    shares: 23,
    views: 5420,
    isLiked: true,
    isBookmarked: false,
    position: "Long 150 shares @ $820"
  },
  {
    id: 2,
    author: "Mike Rodriguez",
    username: "miketrading",
    badge: "Verified",
    content: "Technical analysis update:\n\n📈 RSI: 72 (overbought territory)\n📊 MACD: Bullish crossover\n🎯 Support: $850\n🎯 Resistance: $900\n\nShort-term pullback possible, but trend remains bullish. Looking to add on dips.",
    timeAgo: "4h ago",
    likes: 289,
    comments: 45,
    shares: 12,
    views: 3840,
    isLiked: false,
    isBookmarked: true,
    position: "Long 200 shares @ $765"
  },
  {
    id: 3,
    author: "Emma Watson",
    username: "emmainvests",
    badge: "Analyst",
    content: "NVIDIA's moat in AI chips is incredible. The CUDA ecosystem creates massive switching costs. Even with AMD competition, NVDA maintains 80%+ market share in data center GPUs. Long-term hold for me.",
    timeAgo: "6h ago",
    likes: 178,
    comments: 34,
    shares: 8,
    views: 2340,
    isLiked: false,
    isBookmarked: false,
    position: "Long 75 shares @ $692"
  },
  {
    id: 4,
    author: "Alex Kim",
    username: "alexquant",
    badge: "Quant",
    content: "Valuation check: Forward P/E of 45 vs sector avg of 28. Premium justified by growth, but watching for mean reversion. My model suggests fair value around $820-850 range. Current price reflects high growth expectations.",
    timeAgo: "8h ago",
    likes: 234,
    comments: 56,
    shares: 15,
    views: 4120,
    isLiked: true,
    isBookmarked: false,
    position: "Neutral - Watching"
  }
];



interface StockDetailProps {
  symbol?: string;
  onGoBack: () => void;
  onGoToProfile: () => void;
  onGoToSimulator: () => void;
  initialSymbol?: string;
  onGoToHome: () => void;
  onGoToStocks: () => void;
  onGoToCommunity: () => void;

  onGoToSignup: () => void;
  onGoToLogin: () => void;
  onGoToPortfolio: () => void;
  onGoToAdmin?: () => void;
  currentPage?: any;
}

export function StockDetail({ symbol: propSymbol, initialSymbol, currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin, onGoToAdmin, onGoBack }: StockDetailProps) {
  const { symbol: paramSymbol } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { isRTL, language, t } = useLanguage();
  const currentSymbol = paramSymbol || propSymbol || initialSymbol || "NVDA";

  const formatLargeNumber = (num: number | undefined | string) => {
    if (num === "N/A" || num === undefined || num === null) return "N/A";
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return "N/A";
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    return n.toLocaleString();
  };

  const [stockDetails, setStockDetails] = useState<StockPrice | null>(null);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [monthlyPredictions, setMonthlyPredictions] = useState<MonthlyPredictionsResponse | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [technicals, setTechnicals] = useState<StockTechnical[]>([]);
  const [history, setHistory] = useState<ChartData | null>(null);
  const [sentiment, setSentiment] = useState<StockSentiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedStocksState, setRelatedStocksState] = useState<StockPrice[]>([]);

  const [activeTab, setActiveTab] = useState<"overview" | "discussions" | "analytics" | "news">("overview");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeTimeRange, setActiveTimeRange] = useState("1M");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [showMonthlyTable, setShowMonthlyTable] = useState(false);

  // Reset scroll position when component mounts or symbol changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSymbol]);

  // Check watchlist status on load
  useEffect(() => {
    if (isAuthenticated && currentSymbol) {
      portfolioAPI.checkWatchlist(currentSymbol)
        .then(res => setIsWatchlisted(res.is_watchlisted))
        .catch(() => setIsWatchlisted(false));
    }
  }, [currentSymbol, isAuthenticated]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [priceData, techData, predData, sentData, monthlyData, infoData] = await Promise.all([
          fetchStockPrice(currentSymbol).catch(e => { console.error("Price error:", e); return null; }),
          fetchStockTechnicals(currentSymbol).catch(e => { console.error("Tech error:", e); return []; }),
          fetchStockPrediction(currentSymbol).catch(e => { console.error("Pred error:", e); return null; }),
          fetchStockSentiment(currentSymbol).catch(e => { console.error("Sent error:", e); return null; }),
          fetchMonthlyPredictions(currentSymbol).catch(() => null),
          fetchUpdateInfo().catch(() => null),
        ]);

        if (priceData) setStockDetails(priceData);
        if (techData) setTechnicals(techData);
        setPrediction(predData);
        if (sentData) setSentiment(sentData);
        if (monthlyData) setMonthlyPredictions(monthlyData);
        if (infoData) setUpdateInfo(infoData);
        
        // Stop loading as soon as the critical data is here!
        setLoading(false);

        // Fetch news asynchronously
        setIsLoadingNews(true);
        fetchStockNews(currentSymbol, priceData?.name)
          .then(newsData => {
            if (newsData) setNews(newsData);
          })
          .catch(e => console.error("News error:", e))
          .finally(() => setIsLoadingNews(false));

        // Fetch posts for this stock in background
        communityAPI.getStockPosts(currentSymbol)
          .then(postData => setPosts(postData))
          .catch(e => console.error("Failed to load stock posts", e));

        // Fetch related stocks (same sector) in background
        fetchStocks()
          .then(allStocks => {
            const currentSector = priceData?.sector || "";
            const related = allStocks
              .filter(s => s.symbol !== currentSymbol && s.sector === currentSector)
              .slice(0, 3);
            setRelatedStocksState(related);
          })
          .catch(e => console.error(e));

      } catch (err) {
        console.error("Failed to load stock data", err);
        setLoading(false);
      }
    };

    loadData();
  }, [currentSymbol]);

  // Separate effect for Chart Data to handle time range changes
  useEffect(() => {
    const loadChart = async () => {
      let limit = 30;
      switch (activeTimeRange) {
        case '1W': limit = 7; break;
        case '1M': limit = 30; break;
        case '3M': limit = 90; break;
        case '6M': limit = 180; break;
        case '1Y': limit = 365; break;
        case 'ALL': limit = 5000; break;
        case 'Monthly Forecast': limit = 30; break;
        default: limit = 30;
      }

      try {
        const histData = await fetchChartData(currentSymbol, limit);
        setHistory(histData);
      } catch (e) {
        console.error("Failed to load chart data", e);
      }
    };
    loadChart();
  }, [currentSymbol, activeTimeRange]);

  // Fallback to mock if loading or null (while transitioning)
  const displayStockData = stockDetails ? {
    ...stockData,
    symbol: stockDetails.symbol,
    name: stockDetails.name,
    price: stockDetails.price,
    change: stockDetails.dayChange ?? stockData.change,
    changePercent: stockDetails.changePercent ?? stockData.changePercent,
    sector: stockDetails.sector || "Unknown Sector",
    industry: stockDetails.industry || "Unknown Industry",
    about: stockDetails.description || "No description available for this company.",
    marketCap: stockDetails.marketCap || "N/A",
    peRatio: stockDetails.peRatio || "N/A",
    eps: stockDetails.eps || "N/A",
    dividendYield: stockDetails.dividendYield || "N/A",
    week52High: stockDetails.week52High || "N/A",
    week52Low: stockDetails.week52Low || "N/A",
    open: stockDetails.dayOpen || stockData.open,
    high: stockDetails.dayHigh || stockData.high,
    low: stockDetails.dayLow || stockData.low,
    volume: stockDetails.volume || stockData.volume
  } : {
    ...stockData,
    symbol: currentSymbol,
    name: "Loading...",
    price: 0,
    change: 0,
    changePercent: 0
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !isAuthenticated) return;
    setIsPostLoading(true);
    try {
      await communityAPI.createPost(postContent.trim(), currentSymbol);
      setPostContent("");
      setIsInputExpanded(false);
      // Refresh posts
      const postData = await communityAPI.getStockPosts(currentSymbol);
      setPosts(postData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostLoading(false);
    }
  };

  const toggleLike = async (postId: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await communityAPI.toggleLike(postId);
      setPosts(prev => prev.map(p =>
        p.post_id === postId ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async (postId: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await communityAPI.toggleBookmark(postId);
      setPosts(prev => prev.map(p =>
        p.post_id === postId ? { ...p, is_bookmarked: res.bookmarked } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    const loadNews = async () => {
      setIsLoadingNews(true);
      try {
        const newsData = await fetchStockNews(displayStockData.symbol, displayStockData.name);
        // Filter > 90 days and Sort Desc
        const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const filtered = newsData
          .filter(n => n.timestamp >= cutoff)
          .sort((a, b) => b.timestamp - a.timestamp);
        setNews(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingNews(false);
      }
    };
    loadNews();
  }, [displayStockData.symbol]);
  if (loading) {
    return (
      <LoadingScreen
        message={language === "ar" ? `جاري تحليل بيانات ${currentSymbol}...` : `Fetching real-time insights for ${currentSymbol}...`}
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
    );
  }

  const getMarketInfo = (symbol: string) => {
    const now = new Date();
    const saudiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
    const sDay = saudiTime.getDay();
    const sHours = saudiTime.getHours();
    const sMinutes = saudiTime.getMinutes();
    const sTimeVal = sHours * 100 + sMinutes;

    if (symbol.endsWith('.SR')) {
      const isOpen = sDay >= 0 && sDay <= 4 && sTimeVal >= 1000 && sTimeVal <= 1500;
      return { name: 'Saudi Market', open: '10:00', close: '15:00', isOpen };
    }
    if (symbol.endsWith('.KW')) {
      const isOpen = sDay >= 0 && sDay <= 4 && sTimeVal >= 900 && sTimeVal <= 1230;
      return { name: 'Kuwait Market', open: '09:00', close: '12:30', isOpen };
    }
    if (symbol.endsWith('.QA')) {
      const isOpen = sDay >= 0 && sDay <= 4 && sTimeVal >= 930 && sTimeVal <= 1315;
      return { name: 'Qatar Market', open: '09:30', close: '13:15', isOpen };
    }
    const isOpen = sDay >= 1 && sDay <= 5 && sTimeVal >= 1630 && sTimeVal <= 2300;
    return { name: 'US Market', open: '16:30', close: '23:00', isOpen };
  };

  const getCurrency = (symbol: string) => {
    if (symbol.endsWith(".SR")) return "SAR";
    if (symbol.endsWith(".KW")) return "KWD";
    if (symbol.endsWith(".QA")) return "QAR";
    if (symbol.endsWith(".AD") || symbol.endsWith(".DU")) return "AED";
    if (symbol.endsWith(".CA")) return "EGP";
    return "$";
  };

  const getChartDataWithPrediction = () => {
    if (!history?.data || history.data.length === 0) return [];

    const allData = history.data;
    
    // The backend returns 'limit' historical points + ALL future predictions (price == null).
    const futureStartIndex = allData.findIndex((d: any) => d.price == null);
    
    let histData = allData;
    let futureData: any[] = [];
    if (futureStartIndex !== -1) {
      histData = allData.slice(0, futureStartIndex);
      futureData = allData.slice(futureStartIndex);
    }

    // Only show future predictions if "Monthly Forecast" is selected
    const isForecastMode = activeTimeRange === 'Monthly Forecast';
    const slicedFuture = isForecastMode ? futureData : [];
    const combinedData = [...histData, ...slicedFuture];

    // Map the combined data
    return combinedData.map((d: any, idx: number) => {
      const item: any = { time: d.date || d.time, price: d.price };
      // Include backtest overlay or future predictions
      if (d.prediction != null && d.prediction > 0) {
        if (d.price == null && !isForecastMode) {
           // Skip future predictions if not in forecast mode
        } else {
           item.ai_prediction = d.prediction;
        }
      }
      return item;
    });
  };

  // Helpers for the update banner
  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return 'N/A';
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onGoBack} aria-label={isRTL ? "رجوع" : "Back"}>
                <ArrowLeft className="w-5 h-5 transition-transform duration-200" style={{ transform: isRTL ? 'rotate(180deg)' : undefined }} />
              </Button>
              <div className="flex items-center gap-3">
                <StockLogo symbol={displayStockData.symbol} name={displayStockData.name} />
                <div>
                  <h1 className="font-bold text-lg">{displayStockData.name}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{displayStockData.symbol}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  if (!isAuthenticated) return;
                  try {
                    if (isWatchlisted) {
                      await portfolioAPI.removeFromWatchlist(currentSymbol);
                      setIsWatchlisted(false);
                    } else {
                      await portfolioAPI.addToWatchlist(currentSymbol, displayStockData.name);
                      setIsWatchlisted(true);
                    }
                  } catch (err) {
                    console.error('Watchlist toggle failed', err);
                  }
                }}
              >
                <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button onClick={onGoToProfile} variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container mx-auto px-4 lg:px-6 py-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - Stock Info */}
          {/* Sidebar moved to end for layout */}

          {/* Center - Chart & Detail Tabs */}
          <div className="lg:col-span-8 lg:order-1 space-y-6">


            {/* Main Price Chart */}
            <Card className="p-6 border overflow-hidden relative shadow-md">
              {updateInfo?.last_update && (
                <div className="absolute top-3 right-4 text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full border border-border/50">
                  Last update: <span className="font-medium text-foreground/80">{formatDateTime(updateInfo.last_update)}</span>
                </div>
              )}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-muted-foreground text-sm font-medium mb-1">{language === "ar" ? "السعر الحالي" : "Current Price"}</p>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{getCurrency(displayStockData.symbol)} {displayStockData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                  <div className={`flex items-center gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Badge className={`text-base px-2 py-1 ${displayStockData.change >= 0
                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-0"
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0"
                      }`}>
                      {displayStockData.change >= 0 ? '+' : ''}{displayStockData.change.toFixed(2)} ({displayStockData.changePercent.toFixed(2)}%)
                    </Badge>
                    <div className="flex flex-col">
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${getMarketInfo(displayStockData.symbol).isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-muted-foreground text-xs font-medium">
                          {getMarketInfo(displayStockData.symbol).name} 
                          ({getMarketInfo(displayStockData.symbol).isOpen ? (language === "ar" ? "مفتوح" : "Open") : (language === "ar" ? "مغلق" : "Closed")})
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70">
                        {language === "ar" ? "الساعات:" : "Hours:"} {getMarketInfo(displayStockData.symbol).open} - {getMarketInfo(displayStockData.symbol).close} (AST)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  <div className={`flex gap-1 bg-muted/50 p-1 rounded-lg min-w-max ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {['1W', '1M', '3M', '6M', '1Y', 'ALL', 'Monthly Forecast'].map((period) => (
                      <Button
                        key={period}
                        variant={activeTimeRange === period ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTimeRange(period)}
                        className={`h-8 text-xs transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                          period === 'Monthly Forecast'
                            ? activeTimeRange === period
                              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20'
                              : 'text-purple-600 hover:text-purple-700 hover:bg-purple-100/50'
                            : activeTimeRange === period
                              ? 'bg-black text-white hover:bg-black/90 shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        style={activeTimeRange === period ? { 
                          backgroundColor: period === 'Monthly Forecast' ? '#9333ea' : '#000000', 
                          color: 'white' 
                        } : {}}
                      >
                        {period === 'Monthly Forecast' && <Sparkles className={`w-3 h-3 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />}
                        {period === 'Monthly Forecast' ? (language === "ar" ? "توقعات شهرية" : period) : period}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full mt-4" style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getChartDataWithPrediction()}>
                    <defs>
                      <linearGradient id="colorPriceMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis
                      hide={true}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: any, name: string) => {
                        const formattedValue = `${getCurrency(displayStockData.symbol)} ${parseFloat(value).toFixed(2)}`;
                        return [formattedValue, name === 'ai_prediction' ? 'AI Prediction' : 'Price'];
                      }}
                      labelFormatter={(label) => new Date(label).toDateString()}
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#colorPriceMain)"
                      connectNulls={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="ai_prediction"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      connectNulls={true}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} dir={isRTL ? "rtl" : "ltr"}>
              <div className={`relative w-full bg-muted/30 backdrop-blur-sm p-1 rounded-xl flex items-center justify-between border border-white/10 shadow-inner ${isRTL ? 'flex-row-reverse' : ''}`}>
                {["overview", "discussions", "analytics", "news"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`relative flex-1 flex items-center justify-center py-2.5 text-sm font-medium transition-colors duration-300 z-10 cursor-pointer ${activeTab === tab ? "text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-lg shadow-md"
                        style={{ backgroundColor: "#000000" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {tab === "discussions" && <MessageSquare className="w-4 h-4" />}
                      {tab === "news" && <FileText className="w-4 h-4" />}
                      {language === "ar" ? (
                        tab === "overview" ? "نظرة عامة" :
                        tab === "discussions" ? "مناقشات" :
                        tab === "analytics" ? "تحليلات" : "أخبار"
                      ) : (tab.charAt(0).toUpperCase() + tab.slice(1))}
                      {tab === "discussions" && ` (${posts.length})`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* AI Quick Insights Banner */}
                <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        {prediction ? (
                          <>
                            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <h3 className="font-bold text-lg">{language === "ar" ? "تحليلات الذكاء الاصطناعي" : "AI Market Insight"}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {prediction.confidence}% {language === "ar" ? "دقة الاتجاه" : "Directional Accuracy"}
                              </Badge>
                            </div>
                            <p className={`text-sm text-muted-foreground mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {language === "ar" ? "التوقع القادم:" : "Nearest forecast:"} <span className="font-semibold text-purple-600">{getCurrency(displayStockData.symbol)} {prediction.tomorrow_price?.toFixed(2) || "0.00"}</span>
                              {prediction.prediction_date ? ` ${language === "ar" ? "بتاريخ" : "on"} ${new Date(prediction.prediction_date + 'T12:00:00').toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}` : ''}
                              {' '}({prediction.change_percent != null ? (prediction.change_percent >= 0 ? '+' : '') + prediction.change_percent : '0'}% {language === "ar" ? "من اليوم" : "from today"}).
                              {language === "ar" ? "الاتجاه:" : "Direction:"} <span className={`font-bold ${prediction.direction === 'bullish' ? 'text-green-500' :
                                prediction.direction === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                                }`}>{language === "ar" ? (prediction.direction === 'bullish' ? "صعودي" : prediction.direction === 'bearish' ? "هبوطي" : "محايد") : (prediction.direction?.toUpperCase() || "N/A")}</span>.
                            </p>
                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">{language === "ar" ? "التوصية" : "Recommendation"}</span>
                                <span className="font-bold">{language === "ar" ? (prediction.recommendation === "BUY" ? "شراء" : prediction.recommendation === "SELL" ? "بيع" : "احتفاظ") : (prediction.recommendation || "HOLD")}</span>
                              </div>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">{language === "ar" ? "السعر المستهدف" : "Target Price"}</span>
                                <span className="font-bold">{getCurrency(displayStockData.symbol)} {prediction.target_price || "N/A"}</span>
                              </div>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">{language === "ar" ? "وقف الخسارة" : "Stop Loss"}</span>
                                <span className="font-bold text-red-400">{getCurrency(displayStockData.symbol)} {prediction.stop_loss || "N/A"}</span>
                              </div>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">{language === "ar" ? "مستوى المخاطرة" : "Risk Level"}</span>
                                <span className="font-bold text-yellow-500">{language === "ar" ? (prediction.risk_level === "Low" ? "منخفض" : prediction.risk_level === "High" ? "مرتفع" : "متوسط") : (prediction.risk_level || "Medium")}</span>
                              </div>
                            </div>
                            {prediction.analysis && prediction.analysis.length > 0 && (
                              <div className={`bg-background/20 p-3 rounded-lg text-xs space-y-1 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <p className="font-semibold mb-1">{language === "ar" ? "تحليل الذكاء الاصطناعي:" : "AI Analysis:"}</p>
                                <ul className={`list-disc list-inside text-muted-foreground space-y-1 ${isRTL ? 'pr-2' : ''}`}>
                                  {prediction.analysis.map((point, i) => (
                                    <li key={i}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <h3 className="font-bold text-lg text-muted-foreground">{language === "ar" ? "تحليلات الذكاء الاصطناعي غير متوفرة" : "AI Insights Unavailable"}</h3>
                          </div>
                        )}
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button size="sm" variant="outline" className="text-xs" onClick={onGoToSimulator}>
                            <Zap className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {language === "ar" ? "استخدم في المحاكي" : "Use in Simulator"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle className={`text-xl ${isRTL ? 'text-right' : ''}`}>{language === "ar" ? `حول ${displayStockData.name}` : `About ${displayStockData.name}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'text-right' : ''}`}>{displayStockData.about}</p>
                    <div className={`flex gap-4 pt-3 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "القطاع" : "Sector"}</p>
                        <Badge variant="outline">{displayStockData.sector}</Badge>
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الصناعة" : "Industry"}</p>
                        <Badge variant="outline">{displayStockData.industry}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart moved to top */}

                {/* Analyst Ratings */}

                {/* Top Community Posts */}
                <Card>
                  <CardHeader>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CardTitle className="text-xl">{language === "ar" ? "أهم المناقشات" : "Top Discussions"}</CardTitle>
                      <Button variant="link" onClick={() => setActiveTab("discussions")}>
                        {language === "ar" ? "عرض الكل" : "View All"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(posts) && posts.length > 0 ? posts.slice(0, 3).map((post: FeedPost) => (
                      <div key={post.post_id} className={`bg-muted/50 rounded-lg p-4 border ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-start gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={post.author?.profile_picture_url?.startsWith('/')
                                ? `${API_URL}${post.author.profile_picture_url}`
                                : post.author?.profile_picture_url} 
                              alt={post.author?.username} 
                            />
                            <AvatarFallback className="w-full h-full bg-transparent" asChild>
                              <DefaultAvatar />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="font-semibold text-sm">{post.author?.full_name || post.author?.username}</span>
                              <span className="text-xs text-muted-foreground">@{post.author?.username}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Heart className="w-3 h-3" />
                            {post.likes_count}
                          </span>
                          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <MessageSquare className="w-3 h-3" />
                            {post.comments_count}
                          </span>
                          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Clock className="w-3 h-3" />
                            {post.created_at ? new Date(post.created_at).toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        {language === "ar" ? "لا توجد مناقشات بعد" : "No discussions yet"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="space-y-4 mt-4">
                {/* Post Composer */}
                <Card>
                  <CardContent className="pt-6">
                    <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user?.profile_picture_url?.startsWith('/')
                            ? `https://esai-firstdraft.onrender.com${user.profile_picture_url}`
                            : (user?.profile_picture_url || "")}
                          alt={user?.username}
                        />
                        <AvatarFallback className="w-full h-full bg-transparent" asChild>
                          <DefaultAvatar />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className={`transition-all duration-300 ${isInputExpanded ? 'min-h-[120px]' : 'min-h-[40px]'}`}>
                          {!isInputExpanded && !postContent ? (
                            <button
                              onClick={() => setIsInputExpanded(true)}
                              className={`w-full text-muted-foreground bg-white/5 border border-white/10 px-3 py-2.5 rounded-md text-sm hover:bg-white/10 transition-colors cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                              {language === "ar" ? `ما رأيك في ${currentSymbol}؟` : `What are your thoughts on ${currentSymbol}?`}
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <Textarea
                                placeholder={language === "ar" ? `ما رأيك في ${currentSymbol}؟` : `What are your thoughts on ${currentSymbol}?`}
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                autoFocus
                                className={`border-white/10 bg-white/5 focus-visible:ring-1 focus-visible:ring-primary/20 resize-none p-3 min-h-[100px] text-base ${isRTL ? 'text-right' : 'text-left'}`}
                              />
                              <div className={`flex items-center justify-between pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div />
                                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setIsInputExpanded(false);
                                      setPostContent("");
                                    }}
                                  >
                                    {language === "ar" ? "إلغاء" : "Cancel"}
                                  </Button>
                                  <Button
                                    onClick={handleCreatePost}
                                    disabled={!postContent.trim() || isPostLoading}
                                    size="sm"
                                    className="px-6 cursor-pointer"
                                  >
                                    {isPostLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === "ar" ? "نشر" : "Post")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Discussion Posts */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {Array.isArray(posts) && posts.length > 0 ? posts.map((post: FeedPost) => (
                    <motion.div
                      key={post.post_id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <PostCard
                        post={post}
                        onLike={toggleLike}
                        onComment={() => {}} // Handle comment click if needed
                        onBookmark={toggleBookmark}
                      />
                    </motion.div>
                  )) : (
                    <Card className="p-10 text-center border-dashed">
                      <p className="text-muted-foreground">
                        {language === "ar" ? "كن أول من يبدأ النقاش حول هذا السهم!" : "Be the first to start a discussion about this stock!"}
                      </p>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-4 space-y-6">

                {/* Financial Health & Metrics */}
                {/* Financial Health & Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{language === "ar" ? "المؤشرات الفنية (الأحدث)" : "Technical Indicators (Latest)"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {technicals.length > 0 ? (
                        <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">{language === "ar" ? "مؤشر القوة النسبية (14)" : "RSI (14)"}</p>
                            <p className="font-semibold">{technicals[technicals.length - 1].rsi?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">{language === "ar" ? "ماكد (MACD)" : "MACD"}</p>
                            <p className="font-semibold">{technicals[technicals.length - 1].macd?.toFixed(4) || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">{language === "ar" ? "المتوسط المتحرك 20" : "SMA 20"}</p>
                            <p className="font-semibold">{technicals[technicals.length - 1].sma_20?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">{language === "ar" ? "المتوسط المتحرك الأسي 50" : "EMA 50"}</p>
                            <p className="font-semibold">{technicals[technicals.length - 1].ema_50?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className={`col-span-2 space-y-1 ${isRTL ? 'text-right' : ''}`}>
                            <p className="text-xs text-muted-foreground">{language === "ar" ? "نطاقات بولينجر" : "Bollinger Bands"}</p>
                            <p className="text-sm">
                              {language === "ar" ? "الأعلى:" : "Upper:"} {technicals[technicals.length - 1].bollinger_upper?.toFixed(2) || "N/A"} /
                              {language === "ar" ? "الأدنى:" : "Lower:"} {technicals[technicals.length - 1].bollinger_lower?.toFixed(2) || "N/A"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
                          {language === "ar" ? "لا توجد بيانات فنية متاحة." : "No technical data available."}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Key Statistics / Financial Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{language === "ar" ? "إحصائيات رئيسية" : "Key Statistics"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "سعر الفتح" : "Open"}</p>
                          <p className="font-semibold">{getCurrency(displayStockData.symbol)} {typeof displayStockData.open === 'number' ? displayStockData.open.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "أعلى سعر" : "High"}</p>
                          <p className="font-semibold">{getCurrency(displayStockData.symbol)} {typeof displayStockData.high === 'number' ? displayStockData.high.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "أدنى سعر" : "Low"}</p>
                          <p className="font-semibold">{getCurrency(displayStockData.symbol)} {typeof displayStockData.low === 'number' ? displayStockData.low.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "حجم التداول" : "Volume"}</p>
                          <p className="font-semibold">{formatLargeNumber(displayStockData.volume)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "القيمة السوقية" : "Market Cap"}</p>
                          <p className="font-semibold">{formatLargeNumber(displayStockData.marketCap)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "مكرر الأرباح (P/E)" : "P/E Ratio"}</p>
                          <p className="font-semibold">{displayStockData.peRatio ? Number(displayStockData.peRatio).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "ربحية السهم (EPS)" : "EPS"}</p>
                          <p className="font-semibold">{displayStockData.eps ? Number(displayStockData.eps).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "عائد التوزيعات" : "Dividend Yield"}</p>
                          <p className="font-semibold">{displayStockData.dividendYield ? (Number(displayStockData.dividendYield) * 100).toFixed(2) + "%" : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "أعلى سعر 52 أسبوع" : "52W High"}</p>
                          <p className="font-semibold">{displayStockData.week52High ? getCurrency(displayStockData.symbol) + " " + Number(displayStockData.week52High).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{language === "ar" ? "أدنى سعر 52 أسبوع" : "52W Low"}</p>
                          <p className="font-semibold">{displayStockData.week52Low ? getCurrency(displayStockData.symbol) + " " + Number(displayStockData.week52Low).toFixed(2) : "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>


              </TabsContent>

              {/* News Tab */}
              <TabsContent value="news" className="space-y-4 mt-4">
                {isLoadingNews ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : news.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mb-2 opacity-50" />
                    <p>No recent news found (last 90 days).</p>
                  </div>
                ) : (
                  <motion.div
                    className="grid gap-4"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                  >
                    {news.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 10, scale: 0.98 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: "tween", ease: "easeOut" } }
                        }}
                      >
                        <Card
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">{item.source}</span>
                                  <span>•</span>
                                  <span>{item.timeAgo}</span>
                                </div>
                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.summary}
                                </p>
                                <div className="pt-2 flex items-center gap-3">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-primary"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      window.open(item.url, '_blank');
                                    }}
                                  >
                                    Read full story <ExternalLink className="w-3 h-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Stock Info */}
          <div className="lg:col-span-4 lg:order-2 space-y-4 lg:space-y-6">
            {/* AI Prediction Card */}
            <Card className="overflow-hidden relative shadow-lg">
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span>{language === "ar" ? "توقعات الذكاء الاصطناعي" : "AI Prediction"}</span>
                  <Badge variant="outline" className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-xs`}>
                    {prediction ? prediction.confidence : 0}% {language === "ar" ? "دقة الاتجاه" : "Directional Accuracy"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prediction ? (
                  <>
                    {/* AI Price Prediction */}
                    <div className="bg-muted/50 rounded-lg p-4 border text-center">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                        <Brain className="w-4 h-4" />
                        {prediction.prediction_date
                          ? `${language === "ar" ? "توقع يوم" : "Forecast —"} ${new Date(prediction.prediction_date + 'T12:00:00').toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}`
                          : (language === "ar" ? "السعر المتوقع" : "AI Predicted Price")}
                      </p>
                      <p className="font-bold text-3xl">{getCurrency(currentSymbol)} {prediction.tomorrow_price?.toFixed(2) || "0.00"}</p>
                    </div>

                    {/* Prediction Details */}
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "التغير المتوقع" : "Predicted Change"}</p>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className={`text-2xl font-bold ${prediction.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {prediction.change_percent >= 0 ? '+' : ''}{getCurrency(currentSymbol)} {((prediction.tomorrow_price || 0) - (displayStockData.price || 0)).toFixed(2)}
                            </p>
                            <Badge variant={prediction.change_percent >= 0 ? "default" : "destructive"}>
                              {prediction.change_percent >= 0 ? '+' : ''}{prediction.change_percent || 0}%
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${prediction.direction === 'bullish'
                          ? 'bg-green-500/20 text-green-500'
                          : prediction.direction === 'bearish' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                          {prediction.direction === 'bullish' ? (
                            <ChevronUp className="w-8 h-8" />
                          ) : prediction.direction === 'bearish' ? (
                            <ChevronDown className="w-8 h-8" />
                          ) : (
                            <TrendingUp className="w-8 h-8" />
                          )}
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="pt-3 border-t space-y-2">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm text-muted-foreground">{language === "ar" ? "توصية الذكاء الاصطناعي" : "AI Recommendation"}</span>
                          <Badge
                            variant={prediction.recommendation === 'BUY' ? 'default' : prediction.recommendation === 'SELL' ? 'destructive' : 'secondary'}
                            className="font-bold"
                          >
                            {language === "ar" ? (prediction.recommendation === "BUY" ? "شراء" : prediction.recommendation === "SELL" ? "بيع" : "احتفاظ") : prediction.recommendation}
                          </Badge>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-muted-foreground">{language === "ar" ? "السعر المستهدف" : "Target Price"}</span>
                          <span className="font-semibold text-green-500">{getCurrency(currentSymbol)} {prediction.target_price || "N/A"}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-muted-foreground">{language === "ar" ? "وقف الخسارة" : "Stop Loss"}</span>
                          <span className="font-semibold text-red-500">{getCurrency(currentSymbol)} {prediction.stop_loss || "N/A"}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-muted-foreground">{language === "ar" ? "مستوى المخاطرة" : "Risk Level"}</span>
                          <Badge variant="outline" className="text-xs">{language === "ar" ? (prediction.risk_level === "Low" ? "منخفض" : prediction.risk_level === "High" ? "مرتفع" : "متوسط") : (prediction.risk_level || "Medium")}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    {prediction.analysis && prediction.analysis.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          AI Analysis
                        </p>
                        <div className="space-y-2">
                          {prediction.analysis.slice(0, 3).map((reason, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <p>{reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Monthly Forecast Table Toggle */}
                    {monthlyPredictions && monthlyPredictions.predictions.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowMonthlyTable(v => !v)}
                          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-1 border-t pt-3"
                        >
                          <span className="font-semibold flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5" />
                            Monthly Forecast ({monthlyPredictions.prediction_month})
                          </span>
                          {showMonthlyTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <AnimatePresence>
                          {showMonthlyTable && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
                                {monthlyPredictions.predictions.map((mp, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                                    <span className="text-muted-foreground">
                                      {new Date(mp.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">${mp.predicted_price.toFixed(2)}</span>
                                      <span className={`font-medium ${mp.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {mp.change_percent >= 0 ? '+' : ''}{mp.change_percent.toFixed(2)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {monthlyPredictions.trained_at && (
                                <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
                                  Trained: {formatDateTime(monthlyPredictions.trained_at)}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">Prediction unavailable for this stock.</p>
                  </div>
                )}
                <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                  Disclaimer: AI predictions are for informational purposes only. Not financial advice.
                </p>
              </CardContent>
            </Card>

            {/* Key Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Open</p>
                    <p className="font-semibold">${typeof displayStockData.open === 'number' ? displayStockData.open.toFixed(2) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">High</p>
                    <p className="font-semibold">${typeof displayStockData.high === 'number' ? displayStockData.high.toFixed(2) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Low</p>
                    <p className="font-semibold">${typeof displayStockData.low === 'number' ? displayStockData.low.toFixed(2) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Volume</p>
                    <p className="font-semibold">{formatLargeNumber(displayStockData.volume)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mkt Cap</p>
                    <p className="font-semibold">{formatLargeNumber(displayStockData.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">P/E Ratio</p>
                    <p className="font-semibold">{displayStockData.peRatio ? Number(displayStockData.peRatio).toFixed(2) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">52W High</p>
                    <p className="font-semibold">{displayStockData.week52High ? "$" + Number(displayStockData.week52High).toFixed(2) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">52W Low</p>
                    <p className="font-semibold">{displayStockData.week52Low ? "$" + Number(displayStockData.week52Low).toFixed(2) : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button onClick={onGoToSimulator} className="w-full" size="lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Trade Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Portfolio
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Advanced Chart
                </Button>
              </CardContent>
            </Card>

            {/* Related Stocks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Stocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedStocksState.map((stock, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer"
                    onClick={() => {
                      window.location.href = `/stock/${stock.symbol}`;
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <StockLogo symbol={stock.symbol} name={stock.name} />
                      <div>
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${stock.price.toLocaleString()}</p>
                      <Badge variant={(stock.change || 0) >= 0 ? "default" : "destructive"} className="text-xs">
                        {(stock.change || 0) >= 0 ? '+' : ''}{stock.change}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {relatedStocksState.length === 0 && (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    No related stocks found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}