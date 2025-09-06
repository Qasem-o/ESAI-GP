import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star, 
  AlertTriangle, 
  Target,
  Clock,
  BarChart3,
  Activity,
  Zap,
  ArrowLeft
} from "lucide-react";

const BACKEND_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

const WATCHLIST = [
  { symbol: "2222.SR", name: "Saudi Aramco" },
  { symbol: "AAPL", name: "Apple Inc." }
];

interface PredictionDashboardProps {
  onBackToHome: () => void;
  onGoToPortfolio: () => void;
}

export function PredictionDashboard({ onBackToHome, onGoToPortfolio }: PredictionDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(WATCHLIST[0].symbol);
  const [selectedName, setSelectedName] = useState(WATCHLIST[0].name);
  const [timeframe, setTimeframe] = useState("1d");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [changePct, setChangePct] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ time: string | number; price: number; predicted?: number | null }>>([]);

  const loadChart = async (symbol: string) => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/chart/${encodeURIComponent(symbol)}?limit=180`);
      if (!res.ok) throw new Error("chart error");
      const data = await res.json();
      const series = (data?.data || []) as Array<{ time: string; price: number }>;
      setChartData(series);
      if (series.length >= 2) {
        const last = series[series.length - 1]?.price;
        const prev = series[series.length - 2]?.price;
        if (typeof last === "number" && typeof prev === "number" && prev !== 0) {
          setChangePct(((last - prev) / prev) * 100);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGenerate = async (symbol: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/generate?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error("generate error");
      const data = await res.json();
      setSelectedName(data?.name || selectedName);
      setCurrentPrice(typeof data?.currentPrice === "number" ? data.currentPrice : null);
      setPrediction(typeof data?.prediction === "number" ? data.prediction : null);
      setConfidence(typeof data?.confidence === "number" ? data.confidence : null);
      const chart = (data?.chartData || []) as Array<{ time: string; price: number }>;
      if (chart.length) setChartData(chart);
      if (chart.length >= 2) {
        const last = chart[chart.length - 1]?.price;
        const prev = chart[chart.length - 2]?.price;
        if (typeof last === "number" && typeof prev === "number" && prev !== 0) {
          setChangePct(((last - prev) / prev) * 100);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    loadChart(selectedSymbol);
  }, []);

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto">
        <div className="py-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold">AI Stock Predictions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Real-time market analysis and price predictions powered by advanced AI</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar - Watchlist */
            }
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Watchlist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {WATCHLIST.map((item) => {
                    const isActive = item.symbol === selectedSymbol;
                    return (
                      <div
                        key={item.symbol}
                        className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${isActive ? 'bg-muted' : ''}`}
                        onClick={() => {
                          setSelectedSymbol(item.symbol);
                          setSelectedName(item.name);
                          setPrediction(null);
                          setConfidence(null);
                          loadChart(item.symbol);
                        }}
                      >
                        <div>
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-xs text-muted-foreground">{item.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => loadGenerate(selectedSymbol)} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Prediction
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Top Controls */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4 items-center">
                    <div className="text-sm text-muted-foreground">Symbol</div>
                    <Select value={selectedSymbol} onValueChange={(v) => { const item = WATCHLIST.find(i => i.symbol === v)!; setSelectedSymbol(v); setSelectedName(item.name); setPrediction(null); setConfidence(null); loadChart(v); }}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WATCHLIST.map(w => (
                          <SelectItem key={w.symbol} value={w.symbol}>{w.symbol} — {w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">Timeframe</div>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1 Day</SelectItem>
                          <SelectItem value="1w">1 Week</SelectItem>
                          <SelectItem value="1m">1 Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">{selectedSymbol}</CardTitle>
                      <CardDescription>{selectedName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl sm:text-3xl font-bold">{currentPrice !== null ? `$${currentPrice.toFixed(2)}` : "—"}</p>
                      {changePct !== null && (
                        <div className={`flex items-center gap-1 text-sm ${changePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {changePct >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">AI Prediction ({timeframe})</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{prediction !== null ? `$${prediction.toFixed(2)}` : '—'}</p>
                      {prediction !== null && currentPrice !== null && (
                        <p className="text-sm text-muted-foreground">
                          {prediction - currentPrice >= 0 ? '+' : ''}{(prediction - currentPrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Confidence Score</p>
                      <div className="space-y-2">
                        <Progress value={confidence ?? 0} className="h-2" />
                        <p className="text-sm font-medium">{confidence !== null ? `${confidence}%` : '—'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                      <Badge variant={confidence !== null && confidence > 90 ? "default" : "secondary"}>
                        {confidence !== null && confidence > 90 ? "Low Risk" : "Medium Risk"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">Based on volatility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BarChart3 className="w-5 h-5" />
      Price Chart & Prediction
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-60 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="time" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#000000"   // أسود
            strokeWidth={2} 
            dot={false} 
            name="Historical" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
              {/* Removed fake analysis tabs to avoid showing non-real data */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}