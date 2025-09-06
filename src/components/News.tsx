import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  TrendingUp, 
  Search, 
  Clock, 
  ExternalLink,
  Bookmark,
  Share,
  Filter,
  AlertCircle,
  TrendingDown,
  Globe,
  Newspaper
} from "lucide-react";

// Mock news data
const newsArticles = [
  {
    id: 1,
    title: "Tesla Reports Record Q4 Deliveries Despite Supply Chain Challenges",
    summary: "Tesla announced record quarterly deliveries of 484,507 vehicles in Q4 2024, beating analyst expectations of 473,000 despite ongoing supply chain disruptions.",
    source: "Reuters",
    category: "Earnings",
    impact: "positive",
    stocksAffected: ["TSLA"],
    timeAgo: "2 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=400&h=200",
    readTime: "3 min read"
  },
  {
    id: 2,
    title: "Federal Reserve Signals Potential Rate Cuts in 2025",
    summary: "Fed Chairman Jerome Powell indicated in today's speech that the central bank is considering rate cuts if inflation continues its downward trend.",
    source: "Bloomberg",
    category: "Federal Reserve",
    impact: "positive",
    stocksAffected: ["SPY", "QQQ"],
    timeAgo: "4 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&h=200",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "NVIDIA's AI Chip Demand Continues to Surge in Enterprise Sector",
    summary: "Enterprise customers are driving unprecedented demand for NVIDIA's H100 chips, with order backlogs extending into 2025.",
    source: "TechCrunch",
    category: "Technology",
    impact: "positive",
    stocksAffected: ["NVDA"],
    timeAgo: "6 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=400&h=200",
    readTime: "4 min read"
  },
  {
    id: 4,
    title: "Apple Faces Regulatory Pressure in European Markets",
    summary: "The European Commission is investigating Apple's App Store policies, potentially leading to significant changes in revenue sharing models.",
    source: "Financial Times",
    category: "Regulation",
    impact: "negative",
    stocksAffected: ["AAPL"],
    timeAgo: "8 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=400&h=200",
    readTime: "6 min read"
  },
  {
    id: 5,
    title: "Oil Prices Rally on Middle East Supply Concerns",
    summary: "Crude oil futures jumped 3.2% amid growing concerns about supply disruptions in the Middle East following latest geopolitical developments.",
    source: "MarketWatch",
    category: "Commodities",
    impact: "neutral",
    stocksAffected: ["XOM", "CVX"],
    timeAgo: "10 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&h=200",
    readTime: "3 min read"
  },
  {
    id: 6,
    title: "Meta Platforms Announces Major AI Infrastructure Investment",
    summary: "Meta revealed plans to invest $40 billion in AI infrastructure this year, focusing on data centers and advanced computing capabilities.",
    source: "The Wall Street Journal",
    category: "Technology",
    impact: "positive",
    stocksAffected: ["META"],
    timeAgo: "12 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=400&h=200",
    readTime: "7 min read"
  }
];

const categories = [
  "All News",
  "Earnings",
  "Technology", 
  "Federal Reserve",
  "Regulation",
  "Commodities",
  "Market Analysis",
  "IPOs"
];

const sources = [
  "All Sources",
  "Reuters",
  "Bloomberg", 
  "Financial Times",
  "The Wall Street Journal",
  "MarketWatch",
  "TechCrunch"
];

const marketAlerts = [
  {
    type: "breaking",
    message: "S&P 500 hits new all-time high",
    time: "5 min ago"
  },
  {
    type: "earnings",
    message: "AAPL earnings call starts in 30 minutes",
    time: "25 min ago"
  },
  {
    type: "economic",
    message: "CPI data released: 2.1% year-over-year",
    time: "1 hour ago"
  }
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
}

interface NewsProps extends NavigationProps {}

export function News({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile }: NewsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All News");
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All News" || article.category === selectedCategory;
    const matchesSource = selectedSource === "All Sources" || article.source === selectedSource;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const toggleBookmark = (articleId: number) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "negative":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto">
        <div className="py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold mb-2">Market News</h1>
            <p className="text-muted-foreground">Stay updated with the latest financial news and market developments</p>
          </div>

          {/* Market Alerts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Breaking News</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {marketAlerts.map((alert, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search news articles..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-48">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="latest" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="latest" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Bookmarks
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="latest" className="space-y-6">
              <div className="grid gap-6">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 leading-tight">{article.title}</h3>
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.summary}</p>
                            </div>
                            <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={article.imageUrl} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-medium">{article.source}</span>
                              <span>•</span>
                              <span>{article.timeAgo}</span>
                              <span>•</span>
                              <span>{article.readTime}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getImpactColor(article.impact)}>
                                {getImpactIcon(article.impact)}
                                <span className="ml-1 capitalize">{article.impact}</span>
                              </Badge>
                              <Badge variant="secondary">{article.category}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Affects:</span>
                              {article.stocksAffected.map(stock => (
                                <Badge key={stock} variant="outline" className="text-xs">
                                  {stock}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBookmark(article.id)}
                                className={bookmarkedArticles.includes(article.id) ? "text-primary" : ""}
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                                Read More
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="grid gap-6">
                {[...filteredArticles].sort((a, b) => b.id - a.id).map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 leading-tight">{article.title}</h3>
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.summary}</p>
                            </div>
                            <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={article.imageUrl} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-medium">{article.source}</span>
                              <span>•</span>
                              <span>{article.timeAgo}</span>
                              <span>•</span>
                              <span>{article.readTime}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getImpactColor(article.impact)}>
                                {getImpactIcon(article.impact)}
                                <span className="ml-1 capitalize">{article.impact}</span>
                              </Badge>
                              <Badge variant="secondary">{article.category}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Affects:</span>
                              {article.stocksAffected.map(stock => (
                                <Badge key={stock} variant="outline" className="text-xs">
                                  {stock}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBookmark(article.id)}
                                className={bookmarkedArticles.includes(article.id) ? "text-primary" : ""}
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                                Read More
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              {bookmarkedArticles.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No bookmarks yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Save articles by clicking the bookmark icon to read them later
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredArticles.filter(article => bookmarkedArticles.includes(article.id)).map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2 leading-tight">{article.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.summary}</p>
                              </div>
                              <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={article.imageUrl} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="font-medium">{article.source}</span>
                                <span>•</span>
                                <span>{article.timeAgo}</span>
                                <span>•</span>
                                <span>{article.readTime}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getImpactColor(article.impact)}>
                                  {getImpactIcon(article.impact)}
                                  <span className="ml-1 capitalize">{article.impact}</span>
                                </Badge>
                                <Badge variant="secondary">{article.category}</Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Affects:</span>
                                {article.stocksAffected.map(stock => (
                                  <Badge key={stock} variant="outline" className="text-xs">
                                    {stock}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleBookmark(article.id)}
                                  className="text-primary"
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                  Read More
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Analysis</CardTitle>
                      <CardDescription>AI-powered insights from today's news</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-500">Bullish Sentiment</span>
                        </div>
                        <p className="text-sm">
                          Strong earnings reports and Fed dovish signals are driving positive market sentiment. 
                          Technology sector showing particular strength.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-600">Watch for Volatility</span>
                        </div>
                        <p className="text-sm">
                          Regulatory concerns in Europe and geopolitical tensions could introduce market volatility. 
                          Consider defensive positions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sector Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Technology</span>
                        <div className="flex items-center gap-1 text-green-500">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-sm font-medium">+2.1%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Energy</span>
                        <div className="flex items-center gap-1 text-green-500">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-sm font-medium">+1.8%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Consumer Discretionary</span>
                        <div className="flex items-center gap-1 text-red-500">
                          <TrendingDown className="w-3 h-3" />
                          <span className="text-sm font-medium">-0.5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Events This Week</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium">Wednesday</p>
                        <p className="text-muted-foreground">Fed Meeting Minutes</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Thursday</p>
                        <p className="text-muted-foreground">AAPL Earnings Call</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Friday</p>
                        <p className="text-muted-foreground">Employment Data</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}