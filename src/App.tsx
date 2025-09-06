import React, { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { TrendingUp, Brain, Target, BarChart3, Zap, Shield, Menu, User } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { PredictionDashboard } from "./components/PredictionDashboard";
import { Portfolio } from "./components/Portfolio";
import { Stocks } from "./components/Stocks";
import { Community } from "./components/Community";
import { News } from "./components/News";
import { Learn } from "./components/Learn";
import { Simulator } from "./components/Simulator";
import { Profile } from "./components/Profile";
import { Header } from "./components/Header";
import { LoadingScreen } from "./components/LoadingScreen";
import { Signup } from "./components/Signup";
import { Login } from "./components/Login";

type Page = "home" | "dashboard" | "portfolio" | "stocks" | "community" | "news" | "learn" | "simulator" | "profile" | "signup" | "login";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isLoading, setIsLoading] = useState(true);

  const goToDashboard = () => setCurrentPage("dashboard");
  const goToPortfolio = () => setCurrentPage("portfolio");
  const goToStocks = () => setCurrentPage("stocks");
  const goToCommunity = () => setCurrentPage("community");
  const goToNews = () => setCurrentPage("news");
  const goToLearn = () => setCurrentPage("learn");
  const goToSimulator = () => setCurrentPage("simulator");
  const goToProfile = () => setCurrentPage("profile");
  const goToHome = () => setCurrentPage("home");
  const goToSignup = () => setCurrentPage("signup");
  const goToLogin = () => setCurrentPage("login");

  const navigationProps = {
    currentPage,
    onGoToHome: goToHome,
    onGoToStocks: goToStocks,
    onGoToPortfolio: goToPortfolio,
    onGoToCommunity: goToCommunity,
    onGoToNews: goToNews,
    onGoToLearn: goToLearn,
    onGoToSimulator: goToSimulator,
    onGoToProfile: goToProfile,
    onGoToDashboard: goToDashboard
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading screen first
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (currentPage === "dashboard") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <PredictionDashboard onBackToHome={goToHome} onGoToPortfolio={goToPortfolio} />
      </>
    );
  }

  if (currentPage === "portfolio") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <Portfolio onBackToHome={goToHome} onGoToDashboard={goToDashboard} />
      </>
    );
  }

  if (currentPage === "stocks") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <Stocks {...navigationProps} />
      </>
    );
  }

  if (currentPage === "community") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <Community {...navigationProps} />
      </>
    );
  }

  if (currentPage === "news") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <News {...navigationProps} />
      </>
    );
  }

  if (currentPage === "learn") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <Learn {...navigationProps} />
      </>
    );
  }

  if (currentPage === "simulator") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <Simulator {...navigationProps} />
      </>
    );
  }

  if (currentPage === "profile") {
    return (
      <>
        <Header 
          currentPage={currentPage}
          onGoToHome={goToHome}
          onGoToStocks={goToStocks}
          onGoToPortfolio={goToPortfolio}
          onGoToCommunity={goToCommunity}
          onGoToNews={goToNews}
          onGoToLearn={goToLearn}
          onGoToSimulator={goToSimulator}
          onGoToProfile={goToProfile}
          onGoToDashboard={goToDashboard}
          onGoToSignup={goToSignup}
        />
        <Profile {...navigationProps} />
      </>
    );
  }

  if (currentPage === "signup") {
    return <Signup onGoToHome={goToHome} onGoToLogin={goToLogin} onGoToDashboard={goToDashboard} />;
  }

  if (currentPage === "login") {
    return <Login onGoToHome={goToHome} onGoToSignup={goToSignup} onGoToDashboard={goToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <Header 
        currentPage={currentPage}
        onGoToHome={goToHome}
        onGoToStocks={goToStocks}
        onGoToPortfolio={goToPortfolio}
        onGoToCommunity={goToCommunity}
        onGoToNews={goToNews}
        onGoToLearn={goToLearn}
        onGoToSimulator={goToSimulator}
        onGoToProfile={goToProfile}
        onGoToDashboard={goToDashboard}
        onGoToSignup={goToSignup}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Predictions
              </Badge>
              <h1 className="text-4xl md:text-6xl tracking-tight">
                Predict Stock Prices with 
                <span className="text-primary"> AI Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                Harness the power of advanced machine learning to forecast market movements and make informed investment decisions.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="px-8" onClick={goToSignup}>
                Get Started Free
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8" onClick={goToLogin}>
                Sign In
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>94% Accuracy Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time Analysis</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">AAPL Stock Prediction</h3>
                  <Badge variant="secondary">Live</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">$185.42</span>
                    <span className="text-green-500 text-sm">+2.4%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Predicted next hour: $187.21</p>
                </div>
                
                {/* Mock Chart */}
                <div className="h-32 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg flex items-end justify-center p-4">
                  <div className="flex items-end space-x-1 h-full">
                    {[20, 25, 30, 35, 45, 40, 50, 48, 55, 60, 58, 65].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-primary/60 w-2 rounded-t-sm transition-all duration-300 hover:bg-primary"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium text-green-500">92%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl">Why Choose StockEye AI?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI algorithms analyze thousands of data points to deliver accurate market predictions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Advanced AI Models</CardTitle>
                <CardDescription>
                  Powered by cutting-edge neural networks trained on decades of market data
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle>High Accuracy</CardTitle>
                <CardDescription>
                  Achieve up to 94% prediction accuracy with our proprietary algorithms
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle>Real-time Analysis</CardTitle>
                <CardDescription>
                  Get instant predictions based on live market data and news sentiment
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Receive predictions in milliseconds, perfect for day trading and quick decisions
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-500" />
                </div>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>
                  Built-in risk assessment tools to help you make safer investment choices
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle>Multi-Market Support</CardTitle>
                <CardDescription>
                  Predict prices across stocks, crypto, forex, and commodities markets
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl">Ready to Transform Your Trading?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of traders who are already using StockEye AI to make smarter investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8" onClick={goToSignup}>
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="px-8" onClick={goToLogin}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                <img 
                  src="/src/assets/logo.png" 
                  alt="StockEye AI Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                  }}
                />
              </div>
                <span className="font-semibold">EyeStock AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering traders with AI-driven market predictions.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Features</a>
                <a href="#" className="block hover:text-foreground transition-colors">Pricing</a>
                <a href="#" className="block hover:text-foreground transition-colors">API</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">About</a>
                <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
                <a href="#" className="block hover:text-foreground transition-colors">Careers</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Help Center</a>
                <a href="#" className="block hover:text-foreground transition-colors">Contact</a>
                <a href="#" className="block hover:text-foreground transition-colors">Status</a>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 StockEye AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}