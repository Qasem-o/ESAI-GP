import { useState, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchStockNews,
  NewsItem,
  fetchStockPrice,
  fetchChartData,
  fetchStockTechnicals,
  fetchStockPrediction,
  fetchStockSentiment,
  fetchStocks,
  StockPrice,
  StockTechnical,
  StockPrediction,
  StockSentiment,
  ChartData
} from "../services/api";
import { portfolioAPI } from "../services/portfolioApi";
import { useAuth } from "../contexts/AuthContext";
import { StockLogo } from "./StockLogo";

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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
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
  TrendingUpIcon,
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
  onGoToNews: () => void;
  onGoToLearn: () => void;
  onGoToSignup: () => void;
  onGoToLogin: () => void;
  onGoToPortfolio: () => void;
  currentPage: any;
}

export function StockDetail({ symbol: propSymbol, onGoBack, onGoToProfile, onGoToSimulator }: StockDetailProps) {
  const { symbol: paramSymbol } = useParams();
  const { isAuthenticated } = useAuth();
  const currentSymbol = paramSymbol || propSymbol || "NVDA";

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
  const [technicals, setTechnicals] = useState<StockTechnical[]>([]);
  const [history, setHistory] = useState<ChartData | null>(null);
  const [sentiment, setSentiment] = useState<StockSentiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedStocksState, setRelatedStocksState] = useState<StockPrice[]>([]);

  const [activeTab, setActiveTab] = useState<"overview" | "discussions" | "analytics" | "news">("overview");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<CustomPost[]>(stockPosts);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeTimeRange, setActiveTimeRange] = useState("1W");
  const [isInputExpanded, setIsInputExpanded] = useState(false);

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
        const [priceData, techData, predData, sentData] = await Promise.all([
          fetchStockPrice(currentSymbol),
          fetchStockTechnicals(currentSymbol),
          fetchStockPrediction(currentSymbol),
          fetchStockSentiment(currentSymbol)
        ]);

        setStockDetails(priceData);
        setTechnicals(techData);
        setPrediction(predData);
        setSentiment(sentData);

        // Fetch related stocks (same sector)
        try {
          const allStocks = await fetchStocks();
          const currentSector = priceData.sector || "";
          const related = allStocks
            .filter(s => s.symbol !== currentSymbol && s.sector === currentSector)
            .slice(0, 3);
          setRelatedStocksState(related);
        } catch (e) {
          console.error(e);
        }
      } catch (err) {
        console.error("Failed to load stock data", err);
      } finally {
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
        case '1D': limit = 2; break;
        case '1W': limit = 7; break;
        case '1M': limit = 30; break;
        case '3M': limit = 90; break;
        case 'YTD':
          const start = new Date(new Date().getFullYear(), 0, 1);
          const now = new Date();
          const diff = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          limit = diff;
          break;
        case '1Y': limit = 365; break;
        case 'ALL': limit = 5000; break;
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
    change: prediction?.tomorrow_price ? prediction.tomorrow_price - stockDetails.price : stockData.change,
    changePercent: prediction?.change_percent || stockData.changePercent,
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
  } : stockData;

  const toggleLike = (postId: number) => {
    setPosts(posts.map((post: CustomPost) => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleBookmark = (postId: number) => {
    setPosts(posts.map((post: CustomPost) => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  const handlePost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        author: "You",
        username: "yourhandle",
        badge: "Trader",
        content: postContent,
        timeAgo: "just now",
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false,
        position: "Your position"
      };
      setPosts([newPost, ...posts]);
      setPostContent("");
    }
  };



  useEffect(() => {
    const loadNews = async () => {
      setIsLoadingNews(true);
      try {
        const newsData = await fetchStockNews(displayStockData.symbol);
        // Filter > 61 days and Sort Desc
        const cutoff = Date.now() - (61 * 24 * 60 * 60 * 1000);
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
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onGoBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <StockLogo symbol={displayStockData.symbol} name={displayStockData.name} />
                <div>
                  <h1 className="font-bold text-lg">${displayStockData.symbol}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{displayStockData.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
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
        className="container mx-auto px-4 lg:px-6 py-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - Stock Info */}
          {/* Sidebar moved to end for layout */}

          {/* Center - Chart & Detail Tabs */}
          <div className="lg:col-span-8 lg:order-1 space-y-6">
            {/* Main Price Chart */}
            <Card className="p-6 border overflow-hidden relative shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">Current Price</p>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">${displayStockData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={`text-base px-2 py-1 ${displayStockData.change >= 0
                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-0"
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0"
                      }`}>
                      {displayStockData.change >= 0 ? '+' : ''}{displayStockData.change.toFixed(2)} ({displayStockData.changePercent.toFixed(2)}%)
                    </Badge>
                    <span className="text-muted-foreground text-sm">Today</span>
                  </div>
                </div>
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  {['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((period) => (
                    <Button
                      key={period}
                      variant={activeTimeRange === period ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTimeRange(period)}
                      style={activeTimeRange === period ? { backgroundColor: '#000000', color: 'white' } : {}}
                      className={`h-8 text-xs transition-all duration-200 ${activeTimeRange === period
                        ? 'bg-black text-white hover:bg-black/90 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="w-full mt-4" style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history?.data || []}>
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
                      formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
                      labelFormatter={(label) => new Date(label).toDateString()}
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#colorPriceMain)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <div className="relative w-full bg-muted/30 backdrop-blur-sm p-1 rounded-xl flex items-center justify-between border border-white/10 shadow-inner">
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
                    <span className="relative z-10 flex items-center gap-2">
                      {tab === "discussions" && <MessageSquare className="w-4 h-4" />}
                      {tab === "news" && <FileText className="w-4 h-4" />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">AI Market Insight</h3>
                              <Badge variant="secondary" className="text-xs">
                                {prediction.confidence}% Confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Our AI predicts <span className="font-semibold text-purple-600">${prediction.tomorrow_price.toFixed(2)}</span> for tomorrow
                              ({prediction.change_percent >= 0 ? '+' : ''}{prediction.change_percent}% from today).
                              Direction: <span className={`font-bold ${prediction.direction === 'bullish' ? 'text-green-500' :
                                prediction.direction === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                                }`}>{prediction.direction.toUpperCase()}</span>.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">Recommendation</span>
                                <span className="font-bold">{prediction.recommendation || "HOLD"}</span>
                              </div>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">Target Price</span>
                                <span className="font-bold">${prediction.target_price || "N/A"}</span>
                              </div>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">Stop Loss</span>
                                <span className="font-bold text-red-400">${prediction.stop_loss || "N/A"}</span>
                              </div>
                              <div className="bg-background/40 p-2 rounded">
                                <span className="text-muted-foreground block">Risk Level</span>
                                <span className="font-bold text-yellow-500">{prediction.risk_level || "Medium"}</span>
                              </div>
                            </div>
                            {prediction.analysis && prediction.analysis.length > 0 && (
                              <div className="bg-background/20 p-3 rounded-lg text-xs space-y-1 mb-3">
                                <p className="font-semibold mb-1">AI Analysis:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                  {prediction.analysis.map((point, i) => (
                                    <li key={i}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">Loading AI Insights...</h3>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Use in Simulator
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">About {displayStockData.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{displayStockData.about}</p>
                    <div className="flex gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Sector</p>
                        <Badge variant="outline">{displayStockData.sector}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Industry</p>
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Top Discussions</CardTitle>
                      <Button variant="link" onClick={() => setActiveTab("discussions")}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {posts.slice(0, 3).map((post: CustomPost) => (
                      <div key={post.id} className="bg-muted/50 rounded-lg p-4 border">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{post.author}</span>
                              <Badge variant="secondary" className="text-xs">{post.badge}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.timeAgo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="space-y-4 mt-4">
                {/* Post Composer */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`transition-all duration-300 ${isInputExpanded ? 'min-h-[140px]' : 'min-h-[40px]'}`}
                        >
                          {!isInputExpanded && !postContent ? (
                            <button
                              onClick={() => setIsInputExpanded(true)}
                              className="w-full text-left text-muted-foreground bg-muted/30 px-3 py-2.5 rounded-md text-sm hover:bg-muted/50 transition-colors"
                            >
                              Share your thoughts on {displayStockData.symbol}...
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <Textarea
                                placeholder={`Share your thoughts on ${displayStockData.symbol}...`}
                                value={postContent}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPostContent(e.target.value)}
                                autoFocus
                                className="border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20 resize-none p-3 min-h-[100px]"
                              />
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                    <BarChart2 className="w-5 h-5" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setIsInputExpanded(false);
                                      setPostContent("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      handlePost();
                                      setIsInputExpanded(false);
                                    }}
                                    disabled={!postContent.trim()}
                                    size="sm"
                                  >
                                    Post
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
                  {posts.map((post: CustomPost) => (
                    <motion.div
                      key={post.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <Card className="hover:shadow-md transition-shadow border-white/5 bg-white/5 backdrop-blur-sm">
                        <CardContent className="pt-6">
                          {/* Post Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-7 h-7 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{post.author}</span>
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                    {post.badge}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                  <span>@{post.username}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.timeAgo}
                                  </span>
                                </div>
                                {post.position && (
                                  <Badge variant="outline" className="text-xs mt-2">
                                    {post.position}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Post Content */}
                          <div className="mb-4">
                            <p className="whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {/* Post Stats */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 pb-3 border-b">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views.toLocaleString()} views
                            </span>
                            <span>{post.comments} comments</span>
                          </div>

                          {/* Post Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => toggleLike(post.id)}
                                className={`flex items-center gap-1 text-sm font-medium transition-colors p-2 rounded-md hover:bg-muted cursor-pointer ${post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                                  }`}
                              >
                                <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-red-500' : ''}`} />
                                {post.likes}
                              </motion.button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary cursor-pointer">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary cursor-pointer">
                                <Share2 className="w-4 h-4 mr-1" />
                                {post.shares}
                              </Button>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => toggleBookmark(post.id)}
                              className={`p-2 rounded-md hover:bg-muted transition-colors cursor-pointer ${post.isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
                                }`}
                            >
                              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-primary' : ''}`} />
                            </motion.button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-4 space-y-6">

                {/* Financial Health & Metrics */}
                {/* Financial Health & Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Indicators (Latest)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {technicals.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">RSI (14)</p>
                            <p className="font-semibold">{technicals[0].rsi?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">MACD</p>
                            <p className="font-semibold">{technicals[0].macd?.toFixed(4) || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">SMA 20</p>
                            <p className="font-semibold">{technicals[0].sma_20?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">EMA 50</p>
                            <p className="font-semibold">{technicals[0].ema_50?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <p className="text-xs text-muted-foreground">Bollinger Bands</p>
                            <p className="text-sm">
                              Upper: {technicals[0].bollinger_upper?.toFixed(2) || "N/A"} /
                              Lower: {technicals[0].bollinger_lower?.toFixed(2) || "N/A"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No technical data available.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Key Statistics / Financial Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Open</p>
                          <p className="font-semibold">${typeof displayStockData.open === 'number' ? displayStockData.open.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">High</p>
                          <p className="font-semibold">${typeof displayStockData.high === 'number' ? displayStockData.high.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Low</p>
                          <p className="font-semibold">${typeof displayStockData.low === 'number' ? displayStockData.low.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Volume</p>
                          <p className="font-semibold">{formatLargeNumber(displayStockData.volume)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Market Cap</p>
                          <p className="font-semibold">{formatLargeNumber(displayStockData.marketCap)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">P/E Ratio</p>
                          <p className="font-semibold">{displayStockData.peRatio ? Number(displayStockData.peRatio).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">EPS</p>
                          <p className="font-semibold">{displayStockData.eps ? Number(displayStockData.eps).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Dividend Yield</p>
                          <p className="font-semibold">{displayStockData.dividendYield ? (Number(displayStockData.dividendYield) * 100).toFixed(2) + "%" : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">52W High</p>
                          <p className="font-semibold">{displayStockData.week52High ? "$" + Number(displayStockData.week52High).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">52W Low</p>
                          <p className="font-semibold">{displayStockData.week52Low ? "$" + Number(displayStockData.week52Low).toFixed(2) : "N/A"}</p>
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
                    <p>No recent news found (last 61 days).</p>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span>AI Prediction</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {prediction ? prediction.confidence : 0}% Confidence
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
                        AI Predicted Price (Tomorrow)
                      </p>
                      <p className="font-bold text-3xl">${prediction.tomorrow_price.toFixed(2)}</p>
                    </div>

                    {/* Prediction Details */}
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Predicted Change</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-2xl font-bold ${prediction.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {prediction.change_percent >= 0 ? '+' : ''}${(prediction.tomorrow_price - displayStockData.price).toFixed(2)}
                            </p>
                            <Badge variant={prediction.change_percent >= 0 ? "default" : "destructive"}>
                              {prediction.change_percent >= 0 ? '+' : ''}{prediction.change_percent}%
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
                            <TrendingUpDown className="w-8 h-8" />
                          )}
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">AI Recommendation</span>
                          <Badge
                            variant={prediction.recommendation === 'BUY' ? 'default' : prediction.recommendation === 'SELL' ? 'destructive' : 'secondary'}
                            className="font-bold"
                          >
                            {prediction.recommendation}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Target Price</span>
                          <span className="font-semibold text-green-500">${prediction.target_price || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Stop Loss</span>
                          <span className="font-semibold text-red-500">${prediction.stop_loss || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Risk Level</span>
                          <Badge variant="outline" className="text-xs">{prediction.risk_level || "Medium"}</Badge>
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
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p>Loading Prediction...</p>
                  </div>
                )}
                <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                  ⚠️ AI predictions are for informational purposes only. Not financial advice.
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
    </div>
  );
}