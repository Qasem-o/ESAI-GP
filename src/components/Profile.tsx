import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Heart,
  Share2,
  BarChart3,
  PieChart,
  Trophy,
  Star,
  Calendar,
  MapPin,
  Link2,
  Edit,
  Settings,
  Users,
  Target,
  Activity,
  DollarSign,
  Eye,
  ThumbsUp,
  User
} from "lucide-react";

// Mock user data
const userData = {
  name: "Abdullah AlNujeam",
  username: "@abdullah_trader",
  avatar: null, // No personal image - will use generic icon
  bio: "Financial markets trader for 5 years | Technical analysis expert | Investing in tech stocks and renewable energy",
  location: "Dammam, Saudi Arabia",
  website: "https://ahmed-trading.com",
  joinDate: "Joined January 2020",
  verified: true,
  followers: 2847,
  following: 156,
  totalPosts: 342,
  totalLikes: 12847
};

const portfolioSummary = {
  totalValue: 285750.50,
  totalGain: 42380.25,
  gainPercentage: 17.4,
  dayChange: 2847.30,
  dayChangePercentage: 1.01,
  positions: 12,
  watchlistCount: 28
};

const userPosts = [
  {
    id: 1,
    content: "My analysis on Aramco stock: I expect a breakout above the resistance level at SAR 28.5 next week based on increasing volume and positive news about oil production. What do you think? #Aramco #TechnicalAnalysis",
    timestamp: "2 hours ago",
    likes: 45,
    comments: 12,
    shares: 8,
    tags: ["Aramco", "Technical Analysis", "Oil"],
    type: "analysis"
  },
  {
    id: 2,
    content: "My portfolio gained +2.8% today 💪 Excellent performance from tech stocks especially NVDA and AAPL. My strategy focuses on companies with strong growth and positive cash flow.",
    timestamp: "4 hours ago",
    likes: 78,
    comments: 23,
    shares: 15,
    tags: ["Portfolio", "Tech", "NVDA", "AAPL"],
    type: "performance"
  },
  {
    id: 3,
    content: "Participated in the 'Future of Emerging Markets Investment' seminar today. Rich discussion about opportunities in Saudi and UAE markets. Bottom line: Diversification is key 📊",
    timestamp: "1 day ago",
    likes: 34,
    comments: 8,
    shares: 12,
    tags: ["Seminar", "Investment", "Emerging Markets"],
    type: "event"
  },
  {
    id: 4,
    content: "Update: Closed Tesla position with 12.5% profit as predicted last week ✅ Next target is finding new entry points in renewable energy stocks",
    timestamp: "3 days ago",
    likes: 92,
    comments: 28,
    shares: 22,
    tags: ["Tesla", "Renewable Energy", "Profit"],
    type: "trade"
  }
];

const userInvestments = [
  {
    symbol: "Aramco",
    localSymbol: "2222",
    shares: 150,
    avgPrice: 26.80,
    currentPrice: 28.45,
    totalValue: 4267.50,
    gain: 247.50,
    gainPercentage: 6.15,
    market: "Tadawul"
  },
  {
    symbol: "AAPL",
    shares: 35,
    avgPrice: 180.20,
    currentPrice: 185.42,
    totalValue: 6489.70,
    gain: 182.70,
    gainPercentage: 2.90,
    market: "NASDAQ"
  },
  {
    symbol: "GOOGL",
    shares: 20,
    avgPrice: 145.80,
    currentPrice: 142.83,
    totalValue: 2856.60,
    gain: -59.40,
    gainPercentage: -2.04,
    market: "NASDAQ"
  },
  {
    symbol: "TSLA",
    shares: 15,
    avgPrice: 240.50,
    currentPrice: 248.15,
    totalValue: 3722.25,
    gain: 114.75,
    gainPercentage: 3.18,
    market: "NASDAQ"
  },
  {
    symbol: "STC",
    localSymbol: "7010",
    shares: 200,
    avgPrice: 45.60,
    currentPrice: 48.20,
    totalValue: 9640.00,
    gain: 520.00,
    gainPercentage: 5.70,
    market: "Tadawul"
  }
];

const achievements = [
  { icon: Trophy, title: "Professional Investor", description: "Achieved +15% returns this year", color: "text-yellow-500" },
  { icon: Target, title: "Prediction Accuracy", description: "90% of your predictions were correct", color: "text-green-500" },
  { icon: Users, title: "Community Influencer", description: "Over 2K followers", color: "text-blue-500" },
  { icon: Star, title: "Technical Analysis Expert", description: "100+ analysis shared", color: "text-purple-500" }
];

const tradingStats = [
  { label: "Total Trades", value: "324", change: "+12" },
  { label: "Success Rate", value: "87.2%", change: "+2.1%" },
  { label: "Average Profit", value: "4.8%", change: "+0.3%" },
  { label: "Best Trade", value: "+28.5%", change: "TSLA" }
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

interface ProfileProps extends NavigationProps {}

export function Profile({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case "performance":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "trade":
        return <Target className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="relative overflow-hidden">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-gray-900 via-black to-gray-800"></div>
            
            {/* Profile Info */}
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center md:items-start -mt-16 md:-mt-12">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                    {userData.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                        <Star className="w-3 h-3 text-primary-foreground fill-current" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{userData.name}</h1>
                        {userData.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{userData.username}</p>
                      <p className="max-w-2xl">{userData.bio}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {userData.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Link2 className="w-4 h-4" />
                          <a href={userData.website} className="text-primary hover:underline">
                            Personal Website
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {userData.joinDate}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                    <div className="text-center">
                      <div className="font-bold text-xl">{userData.followers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl">{userData.following}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl">{userData.totalPosts}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl">{userData.totalLikes.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Likes</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Investment Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${portfolioSummary.totalValue.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-sm ${
                    portfolioSummary.dayChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioSummary.dayChange >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {portfolioSummary.dayChange >= 0 ? '+' : ''}${portfolioSummary.dayChange.toFixed(2)} Today
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Gain</p>
                  <p className={`text-xl font-bold ${
                    portfolioSummary.totalGain >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioSummary.totalGain >= 0 ? '+' : ''}${portfolioSummary.totalGain.toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    portfolioSummary.gainPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioSummary.gainPercentage >= 0 ? '+' : ''}{portfolioSummary.gainPercentage}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="text-xl font-bold">{portfolioSummary.positions}</p>
                  <p className="text-sm text-muted-foreground">Different stocks</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Watchlist</p>
                  <p className="text-xl font-bold">{portfolioSummary.watchlistCount}</p>
                  <p className="text-sm text-muted-foreground">Tracked stocks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Investments
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{userData.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                            {getPostTypeIcon(post.type)}
                          </div>
                          
                          <p className="leading-relaxed">{post.content}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-6">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-red-500">
                                <Heart className="w-4 h-4" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-blue-500">
                                <MessageSquare className="w-4 h-4" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-green-500">
                                <Share2 className="w-4 h-4" />
                                {post.shares}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            <div className="grid gap-4">
              {userInvestments.map((investment) => (
                <Card key={investment.symbol} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="font-medium text-sm">{investment.symbol}</span>
                        </div>
                        <div>
                          <p className="font-medium">{investment.symbol}</p>
                          <p className="text-sm text-muted-foreground">{investment.market}</p>
                          {investment.localSymbol && (
                            <p className="text-xs text-muted-foreground">#{investment.localSymbol}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-8 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Shares</p>
                          <p className="font-medium">{investment.shares}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Price</p>
                          <p className="font-medium">${investment.avgPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Price</p>
                          <p className="font-medium">${investment.currentPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">P&L</p>
                          <p className={`font-medium ${
                            investment.gain >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {investment.gain >= 0 ? '+' : ''}${investment.gain.toFixed(2)}
                          </p>
                          <p className={`text-sm ${
                            investment.gainPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {investment.gainPercentage >= 0 ? '+' : ''}{investment.gainPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tradingStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-500">{stat.change}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-muted/50 to-background rounded-lg p-6 flex items-end justify-center">
                  <div className="flex items-end space-x-2 h-full w-full">
                    {[65, 70, 68, 75, 82, 78, 85, 88, 92, 87, 95, 90].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-primary/80 rounded-t-sm transition-all duration-300 hover:bg-primary"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center`}>
                        <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Progress Level</CardTitle>
                <CardDescription>Your progress towards the next level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Advanced Expert</span>
                    <span>Level 8</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    You need 250 more points to reach the next level
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}