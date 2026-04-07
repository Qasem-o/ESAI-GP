import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import {
  TrendingUp,
  TrendingDown,
  User,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  BarChart2,
  Clock,
  Flame,
  Award,
  Target,
  Zap,
  Users,
  Eye
} from "lucide-react";

// Mock posts data
const posts = [
  {
    id: 1,
    author: "Sharidah Abdullah",
    username: "sharidahabdullah",
    badge: "Pro Trader",
    content: "Just analyzed NVDA's latest earnings report. Revenue beat expectations by 15%, and their AI chip demand is through the roof. I'm bullish on this for Q2. What's your take?",
    stock: { symbol: "NVDA", price: 875.30, change: 3.2 },
    timeAgo: "2h ago",
    likes: 247,
    comments: 45,
    shares: 12,
    views: 3420,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 2,
    author: "Ali Samer",
    username: "alisamer",
    badge: "Verified",
    content: "Portfolio update: Up 15% this quarter! My top performers:\n\n🚀 NVDA +22%\n📈 TSLA +18%\n💎 MSFT +12%\n\nKey lesson: Patience pays off in the AI revolution.",
    stock: null,
    timeAgo: "4h ago",
    likes: 892,
    comments: 134,
    shares: 67,
    views: 12450,
    isLiked: true,
    isBookmarked: true
  },
  {
    id: 3,
    author: "Qasem Sami",
    username: "qasemsami",
    badge: "Analyst",
    content: "Market correction incoming? Here's what I'm watching:\n\n⚠️ VIX spiking\n⚠️ Treasury yields rising\n✅ Strong support at 515\n\nStaying cautious but not panicking. What indicators are you watching?",
    stock: { symbol: "SPY", price: 518.42, change: -0.8 },
    timeAgo: "6h ago",
    likes: 456,
    comments: 89,
    shares: 34,
    views: 8930,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 4,
    author: "Abdullah Majed",
    username: "abdullahmajed",
    badge: "Quant",
    content: "Built a new algo that's showing 87% accuracy on short-term moves. Tested on 3 years of data. Sharing the strategy breakdown in my next post. Stay tuned! 📊",
    stock: null,
    timeAgo: "8h ago",
    likes: 1234,
    comments: 267,
    shares: 156,
    views: 18750,
    isLiked: true,
    isBookmarked: false
  }
];

// Market overview data
const marketOverview = [
  { symbol: "S&P 500", value: "5,189.42", change: 1.2 },
  { symbol: "NASDAQ", value: "16,274.94", change: 2.1 },
  { symbol: "DOW", value: "38,834.86", change: 0.8 }
];

// Top movers
const topMovers = [
  { symbol: "NVDA", name: "NVIDIA", price: 875.30, change: 8.5 },
  { symbol: "TSLA", name: "Tesla", price: 248.15, change: 5.8 },
  { symbol: "AMD", name: "AMD", price: 165.42, change: 4.3 },
  { symbol: "META", name: "Meta", price: 485.20, change: -3.2 }
];

// Trending topics
const trendingTopics = [
  { tag: "AI Stocks", posts: "12.5K" },
  { tag: "Earnings Season", posts: "8.3K" },
  { tag: "Fed Meeting", posts: "6.7K" },
  { tag: "Tech Rally", posts: "5.2K" }
];

// Top traders
const topTraders = [
  { name: "Omar Khalid", username: "omarkhalid", badge: "Expert", followers: "125K" },
  { name: "Layla Hassan", username: "laylahassan", badge: "Pro", followers: "89K" },
  { name: "Rami Yasin", username: "ramiyasin", badge: "Verified", followers: "67K" }
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
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
}

interface CommunityProps extends NavigationProps { }

export function Community({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin }: CommunityProps) {
  const [postContent, setPostContent] = useState("");
  const [postsState, setPostsState] = useState(posts);
  const [activeFilter, setActiveFilter] = useState<"all" | "trending" | "following">("all");
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const handlePost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: postsState.length + 1,
        author: "You",
        username: "yourhandle",
        badge: "Trader",
        content: postContent,
        stock: null,
        timeAgo: "just now",
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false
      };
      setPostsState([newPost, ...postsState]);
      setPostContent("");
    }
  };

  const toggleLike = (postId: number) => {
    setPostsState(postsState.map(post => {
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
    setPostsState(postsState.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage === "home" ? "home" : currentPage}
        onGoToHome={onGoToHome}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Market Overview */}
          <div className="lg:col-span-3 space-y-6">
            {/* Market Indices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketOverview.map((index, i) => (
                  <div key={i} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{index.symbol}</p>
                      <p className="text-xs text-muted-foreground">{index.value}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {index.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-semibold">{Math.abs(index.change)}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Movers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Top Movers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topMovers.map((stock, i) => (
                  <div key={i} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-sm">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">${stock.price}</p>
                    </div>
                    <Badge variant={stock.change >= 0 ? "default" : "destructive"} className="text-xs">
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="hidden xl:block">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-blue-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                    <span className="text-sm font-medium">#{topic.tag}</span>
                    <span className="text-xs text-muted-foreground">{topic.posts}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-6 space-y-4">
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
                          Share your trading idea or market analysis...
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Share your trading idea or market analysis..."
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            autoFocus
                            className="border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20 resize-none p-3 min-h-[100px] text-base"
                          />
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                <ImageIcon className="w-5 h-5" />
                              </Button>
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
                                className="px-6"
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

            {/* Filter Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all" onClick={() => setActiveFilter("all")}>
                  All Posts
                </TabsTrigger>
                <TabsTrigger value="trending" onClick={() => setActiveFilter("trending")}>
                  <Flame className="w-4 h-4 mr-1" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="following" onClick={() => setActiveFilter("following")}>
                  <Users className="w-4 h-4 mr-1" />
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-4">
                {postsState.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
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
                              <Badge variant="secondary" className="text-xs">
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
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="whitespace-pre-wrap mb-3">{post.content}</p>

                        {/* Stock Card if attached */}
                        {post.stock && (
                          <div className="bg-muted/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-lg">${post.stock.symbol}</p>
                                <p className="text-2xl font-bold">${post.stock.price.toLocaleString()}</p>
                              </div>
                              <div className={`flex items-center gap-1 ${post.stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {post.stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                <span className="font-bold text-lg">{Math.abs(post.stock.change)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={post.isLiked ? "text-red-500" : ""}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-red-500' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(post.id)}
                          className={post.isBookmarked ? "text-primary" : ""}
                        >
                          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-primary' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="trending" className="mt-4 space-y-4">
                {[...postsState].sort((a, b) => b.likes - a.likes).slice(0, 3).map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow border-orange-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-orange-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{post.author}</span>
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200">
                                Trending
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
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mb-4">
                        <p className="whitespace-pre-wrap mb-3">{post.content}</p>
                        {post.stock && (
                          <div className="bg-muted/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-lg">${post.stock.symbol}</p>
                                <p className="text-2xl font-bold">${post.stock.price.toLocaleString()}</p>
                              </div>
                              <div className={`flex items-center gap-1 ${post.stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {post.stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                <span className="font-bold text-lg">{Math.abs(post.stock.change)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={post.isLiked ? "text-red-500" : ""}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-red-500' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="following" className="mt-4 space-y-4">
                {[postsState[0], postsState[2]].map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{post.author}</span>
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                                Following
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
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mb-4">
                        <p className="whitespace-pre-wrap mb-3">{post.content}</p>
                        {post.stock && (
                          <div className="bg-muted/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-lg">${post.stock.symbol}</p>
                                <p className="text-2xl font-bold">${post.stock.price.toLocaleString()}</p>
                              </div>
                              <div className={`flex items-center gap-1 ${post.stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {post.stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                <span className="font-bold text-lg">{Math.abs(post.stock.change)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={post.isLiked ? "text-red-500" : ""}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-red-500' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Top Traders */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={onGoToSimulator} variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Practice Trading
                </Button>
                <Button onClick={onGoToStocks} variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Explore Stocks
                </Button>
                <Button onClick={onGoToPortfolio} variant="outline" className="w-full justify-start">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  View Portfolio
                </Button>
              </CardContent>
            </Card>

            {/* Top Traders to Follow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Top Traders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTraders.map((trader, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{trader.name}</p>
                        <p className="text-xs text-muted-foreground">{trader.followers} followers</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-xs text-muted-foreground space-y-2 px-2">
              <div className="flex flex-wrap gap-2">
                <a href="#" className="hover:underline">About</a>
                <span>•</span>
                <a href="#" className="hover:underline">Terms</a>
                <span>•</span>
                <a href="#" className="hover:underline">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:underline">Help</a>
              </div>
              <p>© 2025 EyeStocks AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
