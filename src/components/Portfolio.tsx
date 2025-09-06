import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  DollarSign,
  Target,
  PieChart,
  Activity,
  Calendar,
  MoreHorizontal,
  Eye,
  Trash2
} from "lucide-react";

// Mock portfolio data
const portfolioSummary = {
  totalValue: 124750.85,
  totalCost: 118500.00,
  totalGain: 6250.85,
  gainPercentage: 5.27,
  dayChange: 1247.32,
  dayChangePercentage: 1.01
};

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    avgPrice: 175.20,
    currentPrice: 185.42,
    totalValue: 9271.00,
    gain: 511.00,
    gainPercentage: 5.83,
    allocation: 7.4
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 25,
    avgPrice: 145.80,
    currentPrice: 142.83,
    totalValue: 3570.75,
    gain: -74.25,
    gainPercentage: -2.04,
    allocation: 2.9
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 30,
    avgPrice: 235.60,
    currentPrice: 248.15,
    totalValue: 7444.50,
    gain: 376.50,
    gainPercentage: 5.33,
    allocation: 6.0
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 40,
    avgPrice: 365.25,
    currentPrice: 378.92,
    totalValue: 15156.80,
    gain: 546.80,
    gainPercentage: 3.74,
    allocation: 12.1
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    shares: 20,
    avgPrice: 820.40,
    currentPrice: 875.30,
    totalValue: 17506.00,
    gain: 1098.00,
    gainPercentage: 6.69,
    allocation: 14.0
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    shares: 60,
    avgPrice: 152.10,
    currentPrice: 156.78,
    totalValue: 9406.80,
    gain: 280.80,
    gainPercentage: 3.08,
    allocation: 7.5
  }
];

const recentTransactions = [
  {
    id: 1,
    type: "buy",
    symbol: "AAPL",
    shares: 10,
    price: 182.45,
    total: 1824.50,
    date: "2025-01-25",
    time: "14:30"
  },
  {
    id: 2,
    type: "sell",
    symbol: "GOOGL",
    shares: 5,
    price: 143.20,
    total: 716.00,
    date: "2025-01-24",
    time: "11:15"
  },
  {
    id: 3,
    type: "buy",
    symbol: "NVDA",
    shares: 2,
    price: 865.20,
    total: 1730.40,
    date: "2025-01-23",
    time: "09:45"
  },
  {
    id: 4,
    type: "buy",
    symbol: "MSFT",
    shares: 15,
    price: 375.80,
    total: 5637.00,
    date: "2025-01-22",
    time: "16:20"
  }
];

const assetAllocation = [
  { category: "Technology", percentage: 65.2, value: 81335.55, color: "bg-blue-500" },
  { category: "Consumer Discretionary", percentage: 13.5, value: 16951.30, color: "bg-green-500" },
  { category: "Communication", percentage: 12.8, value: 15968.11, color: "bg-purple-500" },
  { category: "Cash", percentage: 8.5, value: 10495.89, color: "bg-gray-500" }
];

interface PortfolioProps {
  onBackToHome: () => void;
  onGoToDashboard: () => void;
}

export function Portfolio({ onBackToHome, onGoToDashboard }: PortfolioProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const generatePerformanceData = () => {
    const data = [];
    const baseValue = 118500;
    for (let i = 0; i < 30; i++) {
      const variance = (Math.sin(i * 0.3) + Math.random() - 0.5) * 3000;
      data.push({
        day: i,
        value: baseValue + variance + (i * 200) // Overall upward trend
      });
    }
    return data;
  };

  const performanceData = generatePerformanceData();

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto">
        <div className="py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">Portfolio</h1>
            <p className="text-muted-foreground">Track your investments and portfolio performance</p>
          </div>

          {/* Portfolio Summary */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">${portfolioSummary.totalValue.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-sm ${
                      portfolioSummary.dayChange >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {portfolioSummary.dayChange >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      ${Math.abs(portfolioSummary.dayChange).toFixed(2)}
                    </div>
                    <span className="text-sm text-muted-foreground">today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Gain/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold ${
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">${portfolioSummary.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Investment basis</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold ${
                    portfolioSummary.dayChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {portfolioSummary.dayChangePercentage >= 0 ? '+' : ''}{portfolioSummary.dayChangePercentage}%
                  </p>
                  <p className="text-sm text-muted-foreground">Since market open</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Portfolio Performance (30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gradient-to-br from-muted/50 to-background rounded-lg p-6 flex items-end justify-center">
                        <div className="flex items-end space-x-1 h-full">
                          {[20, 25, 30, 35, 45, 40, 50, 48, 55, 60, 58, 65, 70, 68, 75, 72, 80, 78, 85, 82, 88, 86, 90, 87, 92, 89, 94, 91, 96, 93].map((height, i) => (
                            <div 
                              key={i} 
                              className="bg-primary/60 w-2 rounded-t-sm transition-all duration-300 hover:bg-primary"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                        <span>30 days ago</span>
                        <span className="text-primary font-medium">
                          ${portfolioSummary.totalValue.toLocaleString()}
                        </span>
                        <span>Today</span>
                      </div>
                      

                    </CardContent>
                  </Card>
                </div>

                {/* Asset Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Asset Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assetAllocation.map((asset, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{asset.category}</span>
                          <span className="text-sm text-muted-foreground">{asset.percentage}%</span>
                        </div>
                        <Progress value={asset.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">${asset.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Top Holdings */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Holdings</CardTitle>
                  <CardDescription>Your largest positions by value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {holdings.slice(0, 5).map((holding) => (
                      <div key={holding.symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{holding.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">{holding.shares} shares</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${holding.totalValue.toLocaleString()}</p>
                          <p className={`text-sm ${
                            holding.gain >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="holdings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Holdings</CardTitle>
                  <CardDescription>Complete breakdown of your investment positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {holdings.map((holding) => (
                      <div key={holding.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="font-medium">{holding.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">{holding.name}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Shares</p>
                            <p className="font-medium">{holding.shares}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Price</p>
                            <p className="font-medium">${holding.avgPrice}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Price</p>
                            <p className="font-medium">${holding.currentPrice}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="font-medium">${holding.totalValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Gain/Loss</p>
                            <p className={`font-medium ${
                              holding.gain >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)}
                              <span className="text-xs ml-1">
                                ({holding.gainPercentage >= 0 ? '+' : ''}{holding.gainPercentage}%)
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest buy and sell orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">
                              {transaction.type.toUpperCase()} {transaction.symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.shares} shares at ${transaction.price}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">${transaction.total.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date} at {transaction.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Beta</span>
                      <span className="font-medium">1.24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sharpe Ratio</span>
                      <span className="font-medium">1.86</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Volatility (30d)</span>
                      <span className="font-medium">18.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Drawdown</span>
                      <span className="font-medium text-red-500">-8.2%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Diversification Score</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Overall Score</span>
                        <span className="font-medium">7.2/10</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Recommendations:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Consider adding international exposure</li>
                        <li>• Reduce technology sector concentration</li>
                        <li>• Add defensive stocks for stability</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}