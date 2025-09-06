import { useState } from "react";
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
  DollarSign,
  Target,
  Activity,
  BarChart3,
  Plus,
  Minus,
  RefreshCw,
  Trophy,
  Users,
  Calendar,
  PieChart,
  Settings
} from "lucide-react";

// Mock simulator data
const portfolioData = {
  totalValue: 102450.75,
  cash: 25780.50,
  totalGain: 2450.75,
  gainPercentage: 2.45,
  dayChange: 456.20,
  dayChangePercentage: 0.45,
  buyingPower: 25780.50,
  startingBalance: 100000
};

const positions = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 25,
    avgPrice: 180.50,
    currentPrice: 185.42,
    totalValue: 4635.50,
    gain: 123.00,
    gainPercentage: 2.72,
    dayChange: 62.50
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 15,
    avgPrice: 145.20,
    currentPrice: 142.83,
    totalValue: 2142.45,
    gain: -35.55,
    gainPercentage: -1.63,
    dayChange: -28.50
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 10,
    avgPrice: 240.80,
    currentPrice: 248.15,
    totalValue: 2481.50,
    gain: 73.50,
    gainPercentage: 3.05,
    dayChange: 45.80
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 20,
    avgPrice: 375.60,
    currentPrice: 378.92,
    totalValue: 7578.40,
    gain: 66.40,
    gainPercentage: 0.88,
    dayChange: 32.20
  }
];

const orderHistory = [
  {
    id: 1,
    type: "BUY",
    symbol: "AAPL",
    shares: 25,
    price: 180.50,
    total: 4512.50,
    timestamp: "2025-01-28 14:30:00",
    status: "Filled"
  },
  {
    id: 2,
    type: "BUY",
    symbol: "MSFT",
    shares: 20,
    price: 375.60,
    total: 7512.00,
    timestamp: "2025-01-28 11:15:00",
    status: "Filled"
  },
  {
    id: 3,
    type: "SELL",
    symbol: "GOOGL",
    shares: 5,
    price: 144.20,
    total: 721.00,
    timestamp: "2025-01-27 16:45:00",
    status: "Filled"
  },
  {
    id: 4,
    type: "BUY",
    symbol: "TSLA",
    shares: 10,
    price: 240.80,
    total: 2408.00,
    timestamp: "2025-01-27 09:30:00",
    status: "Filled"
  }
];

const leaderboard = [
  { rank: 1, name: "TradingMaster99", return: 15.2, value: 115200 },
  { rank: 2, name: "InvestorPro", return: 12.8, value: 112800 },
  { rank: 3, name: "StockGuru2024", return: 11.5, value: 111500 },
  { rank: 4, name: "You", return: 2.45, value: 102450 },
  { rank: 5, name: "MarketWiz", return: 1.8, value: 101800 }
];

const challenges = [
  {
    id: 1,
    title: "Beat the Market",
    description: "Outperform the S&P 500 over 30 days",
    progress: 60,
    reward: "$50 Trading Credit",
    timeLeft: "15 days",
    participants: 1247
  },
  {
    id: 2,
    title: "Risk Manager",
    description: "Keep maximum drawdown under 5%",
    progress: 80,
    reward: "Premium Features",
    timeLeft: "8 days",
    participants: 892
  },
  {
    id: 3,
    title: "Dividend Hunter",
    description: "Build a portfolio with 4%+ dividend yield",
    progress: 25,
    reward: "Educational Course",
    timeLeft: "22 days",
    participants: 654
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

interface SimulatorProps extends NavigationProps {}

export function Simulator({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile }: SimulatorProps) {
  const [orderType, setOrderType] = useState("market");
  const [orderSide, setOrderSide] = useState("buy");
  const [selectedStock, setSelectedStock] = useState("");
  const [shares, setShares] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);

  const generatePerformanceData = () => {
    const data = [];
    const baseValue = portfolioData.startingBalance;
    for (let i = 0; i < 30; i++) {
      const variance = (Math.sin(i * 0.2) + Math.random() - 0.5) * 2000;
      data.push({
        day: i,
        value: baseValue + variance + (i * 80) // Slight upward trend
      });
    }
    return data;
  };

  const performanceData = generatePerformanceData();

  const handlePlaceOrder = () => {
    if (selectedStock && shares) {
      // In a real app, this would place the order
      console.log("Placing order:", { orderType, orderSide, selectedStock, shares, limitPrice });
      setShowOrderForm(false);
      setSelectedStock("");
      setShares("");
      setLimitPrice("");
    }
  };

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold">Trading Simulator</h1>
              <p className="text-muted-foreground">Practice trading with virtual money - no risk, real learning</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset Portfolio
              </Button>
              <Button onClick={() => setShowOrderForm(!showOrderForm)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Place Order
              </Button>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-sm ${
                    portfolioData.dayChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioData.dayChange >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    ${Math.abs(portfolioData.dayChange).toFixed(2)} today
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold ${
                    portfolioData.totalGain >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioData.totalGain >= 0 ? '+' : ''}${portfolioData.totalGain.toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    portfolioData.gainPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioData.gainPercentage >= 0 ? '+' : ''}{portfolioData.gainPercentage}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">${portfolioData.cash.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Available to trade</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Leaderboard Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">#4</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>Top 10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Form */}
          {showOrderForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
                <CardDescription>Practice trading with virtual money</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Order Type</label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Side</label>
                    <Select value={orderSide} onValueChange={setOrderSide}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Symbol</label>
                    <Input
                      placeholder="e.g., AAPL"
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Shares</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                  </div>
                  
                  {orderType === "limit" && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Limit Price</label>
                      <Input
                        type="number"
                        placeholder="$0.00"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-end gap-2">
                    <Button onClick={handlePlaceOrder} className="flex-1">
                      Place Order
                    </Button>
                    <Button variant="outline" onClick={() => setShowOrderForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Positions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {positions.map((position) => (
                          <div key={position.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{position.symbol}</span>
                              </div>
                              <div>
                                <p className="font-medium">{position.symbol}</p>
                                <p className="text-sm text-muted-foreground">{position.shares} shares</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-8 text-right">
                              <div>
                                <p className="text-sm text-muted-foreground">Avg Price</p>
                                <p className="font-medium">${position.avgPrice}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Current</p>
                                <p className="font-medium">${position.currentPrice}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">P&L</p>
                                <p className={`font-medium ${
                                  position.gain >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {position.gain >= 0 ? '+' : ''}${position.gain.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {positions.map((position) => {
                        const allocation = (position.totalValue / (portfolioData.totalValue - portfolioData.cash)) * 100;
                        return (
                          <div key={position.symbol} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{position.symbol}</span>
                              <span>{allocation.toFixed(1)}%</span>
                            </div>
                            <Progress value={allocation} className="h-2" />
                          </div>
                        );
                      })}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Cash</span>
                          <span>{((portfolioData.cash / portfolioData.totalValue) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(portfolioData.cash / portfolioData.totalValue) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-muted/50 to-background rounded-lg p-6 flex items-end justify-center">
                    <div className="flex items-end space-x-1 h-full w-full">
                      {performanceData.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary/80 rounded-t-sm transition-all duration-300 hover:bg-primary"
                            style={{ 
                              height: `${Math.max(10, ((point.value - 98000) / 8000) * 100)}%` 
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>30 days ago</span>
                    <span className="text-primary font-medium">
                      ${portfolioData.totalValue.toLocaleString()}
                    </span>
                    <span>Today</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Your recent trading activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            order.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">
                              {order.type} {order.shares} {order.symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @ ${order.price} • {order.timestamp}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">${order.total.toLocaleString()}</p>
                          <Badge variant="secondary" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Leaderboard</CardTitle>
                  <CardDescription>Top performing traders this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((trader) => (
                      <div 
                        key={trader.rank} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          trader.name === "You" ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            trader.rank <= 3 ? 'bg-yellow-500 text-white' : 'bg-muted'
                          }`}>
                            {trader.rank}
                          </div>
                          <div>
                            <p className="font-medium">{trader.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Portfolio: ${trader.value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-medium ${
                            trader.return >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {trader.return >= 0 ? '+' : ''}{trader.return}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <Badge variant="outline">{challenge.timeLeft} left</Badge>
                      </div>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{challenge.participants} participants</span>
                        </div>
                        <Badge variant="secondary">{challenge.reward}</Badge>
                      </div>
                      
                      <Button className="w-full" size="sm">
                        {challenge.progress > 0 ? 'Continue' : 'Join Challenge'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}