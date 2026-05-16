import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface Translations {
  // Navigation
  nav: {
    home: string;
    explore: string;
    portfolio: string;
    simulator: string;
    profile: string;
    login: string;
    signup: string;
    logout: string;
    adminPanel: string;
    community: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    submit: string;
    confirm: string;
    search: string;
    refresh: string;
    all: string;
    noData: string;
    viewAll: string;
    loadingApp: string;
    fetchingDetails: string;
    date: string;
    type: string;
    price: string;
    total: string;
    change: string;
    optional: string;
    saveChanges: string;
    justNow: string;
    secondsAgo: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  // Auth
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    fullName: string;
    forgotPassword: string;
    rememberMe: string;
    orContinueWith: string;
    continueWithGoogle: string;
    alreadyHaveAccount: string;
    noAccount: string;
    termsAgree: string;
    verifyEmail: string;
    resetPassword: string;
    sendResetLink: string;
    backToLogin: string;
    verificationSent: string;
  };
  // Header
  header: {
    betaBadge: string;
    accountOptions: string;
    goToProfile: string;
  };
  // Home / Community
  community: {
    title: string;
    shareIdea: string;
    attachStock: string;
    post: string;
    allPosts: string;
    trending: string;
    following: string;
    noPosts: string;
    noTrendingPosts: string;
    noFollowingPosts: string;
    signInToPost: string;
    signInRequired: string;
    signInToFollow: string;
    quickActions: string;
    practiceTrading: string;
    exploreStocks: string;
    viewPortfolio: string;
    communityStats: string;
    totalPosts: string;
    activeTraders: string;
    topTraders: string;
    follow: string;
    following_btn: string;
    viewDiscussion: string;
    justNow: string;
    virtualValue: string;
    mentions: string;
    bullish: string;
  };
  // Explore Stocks
  explore: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    sectors: string;
    trendingStocks: string;
    stockDetails: string;
    volume: string;
    marketCap: string;
    sector: string;
    price: string;
    change: string;
    trade: string;
    analyze: string;
    addToWatchlist: string;
    removeFromWatchlist: string;
    inWatchlist: string;
    tradeInSimulator: string;
    viewFullAnalysis: string;
    loadingMarket: string;
    fetchingData: string;
    noStocksFound: string;
    adjustSearch: string;
    realTimeData: string;
  };
  // Portfolio
  portfolio: {
    title: string;
    totalValue: string;
    totalGain: string;
    totalReturn: string;
    totalInvestment: string;
    dayChange: string;
    holdings: string;
    positionsCount: string;
    watchlist: string;
    transactions: string;
    recentTransactions: string;
    noHoldings: string;
    noWatchlist: string;
    noTransactions: string;
    noTransactionsDesc: string;
    startInvesting: string;
    addStocks: string;
    symbol: string;
    shares: string;
    avgCost: string;
    currentPrice: string;
    totalValueUsd: string;
    gainLoss: string;
    totalGainLoss: string;
    action: string;
    sell: string;
    buy: string;
    buyMore: string;
    addToPortfolio: string;
    addStockToPortfolio: string;
    resetPortfolio: string;
    resetPortfolioConfirm: string;
    resetConfirm?: string;
    addStock?: string;
    noHoldingsYet?: string;
    noHoldingsDesc?: string;
    addFirstStock?: string;
    noTransactionsYet?: string;
    bought?: string;
    sold?: string;
    sharesCount?: string;
    enterShares?: string;
    buyPrice?: string;
    perShare?: string;
    enterBuyPrice?: string;
    currentValue?: string;
    deletePosition?: string;
    deleteConfirm?: string;
    justNow?: string;
    secondsAgo?: string;
    minutesAgo?: string;
    hoursAgo?: string;
    daysAgo?: string;
    performance7d: string;
    noPerfData: string;
    keepTrading: string;
    assetAllocation: string;
    practiceTrading: string;
    view: string;
    edit: string;
    delete: string;
    signInToView: string;
    signInDesc: string;
    trackHoldings: string;
    loadingPortfolio: string;
    sharesToSell: string;
    sharesToBuy: string;
    estimatedProceeds: string;
    purchaseDate: string;
    costPerShare: string;
    saveChanges: string;
    deleteTitle: string;
    deleteDescription: string;
    totalUsd: string;
    searchStocks: string;
    noStocksFound: string;
  };
  // Simulator
  simulator: {
    title: string;
    subtitle: string;
    balance: string;
    portfolioValue: string;
    totalPnl: string;
    positions: string;
    history: string;
    buyStock: string;
    sellStock: string;
    quantity: string;
    orderType: string;
    market: string;
    limit: string;
    placeOrder: string;
    noPositions: string;
    noHistory: string;
    resetPortfolio: string;
    resetPortfolioConfirm: string;
    resetChallenge: string;
    goal: string;
    reached: string;
    notReached: string;
    startingBalance: string;
    targetBalance: string;
    simulatorChallenge: string;
    goal10k: string;
    availableCash: string;
    inStocks: string;
    progressComplete: string;
    startTradingProgress: string;
    sharesLabel: string;
    sharesPlaceholder: string;
    totalUsd: string;
    tradeSimulatedDisclaimer: string;
    winTargetReached: string;
    playAgain: string;
    signInToUse: string;
    buy: string;
    sell: string;
    orderTypeLabel: string;
    pricePerShare: string;
    placeBuyOrder: string;
    placeSellOrder: string;
    change: string;
    loadingSimulator: string;
    simulationPerformance: string;
    messages: {
      insufficientCash: string;
      alreadyWon: string;
      noShares: string;
      insufficientShares: string;
      buySuccess: string;
      sellSuccess: string;
      resetSuccess: string;
    };
  };
  // Profile
  profile: {
    title: string;
    editProfile: string;
    followers: string;
    following: string;
    posts: string;
    joinedDate: string;
    bio: string;
    noBio: string;
    changePicture: string;
    saveChanges: string;
    portfolioPerformance: string;
    totalReturn: string;
    winRate: string;
    tradesCount: string;
    trades: string;
    joined: string;
    loadingProfile: string;
  };
  // Loading Screen
  loading: {
    title: string;
    subtitle: string;
    quote: string;
    philosophy: string;
    preparing: string;
  };
  // Stock Detail
  stockDetail: {
    overview: string;
    aiPrediction: string;
    priceHistory: string;
    indicators: string;
    community: string;
    prediction: string;
    confidence: string;
    direction: string;
    bullish: string;
    bearish: string;
    neutral: string;
    disclaimer: string;
    lastUpdated: string;
    high52w: string;
    low52w: string;
    peRatio: string;
    dividendYield: string;
  };
  // Footer
  footer: {
    about: string;
    terms: string;
    privacy: string;
    help: string;
    disclaimer: string;
    rights: string;
  };
  // Disclaimer
  disclaimer: {
    title: string;
    body: string;
    accept: string;
  };
  about: {
    badge: string;
    hero: {
      title: string;
      subtitle: string;
      highlight: string;
    };
    story: {
      label: string;
      title: string;
      desc: string;
    };
    features: {
      title: string;
      items: Array<{ title: string; desc: string; bullets: string[] }>;
    };
      team: {
        title: string;
        roleLeader: string;
        roleMember: string;
        supervisorLabel: string;
        supervisorBy: string;
        supervisorName: string;
        members: {
          sharidah: string;
          ali: string;
          qasem: string;
          abdullah: string;
        };
      };
  };
  terms: {
    badge: string;
    title: string;
    desc: string;
    lastUpdated: string;
    onThisPage: string;
    showMore: string;
    sections: Array<{ id: string; title: string; content: string }>;
  };
  privacy: {
    badge: string;
    title: string;
    desc: string;
    lastUpdated: string;
    onThisPage: string;
    sections: Array<{ id: string; title: string; content: string }>;
  };
  help: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    browseByCategory: string;
    popularArticles: string;
    stillNeedHelp: string;
    cantFind: string;
    contactSupport: string;
    articlesCount: string;
    categories: {
      gettingStarted: { title: string; desc: string };
      features: { title: string; desc: string };
      simulator: { title: string; desc: string };
      account: { title: string; desc: string };
      billing: { title: string; desc: string };
    };
    popularArticlesList: string[];
    highlights: Array<{ title: string; desc: string }>;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      explore: "Explore",
      portfolio: "Portfolio",
      simulator: "Simulator",
      profile: "Profile",
      login: "Log in",
      signup: "Sign up",
      logout: "Log out",
      adminPanel: "Admin Panel",
      community: "Community",
    },
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      back: "Back",
      submit: "Submit",
      confirm: "Confirm",
      search: "Search",
      refresh: "Refresh",
      all: "All",
      noData: "No data available",
      viewAll: "View All",
      loadingApp: "Loading EyeStocks AI...",
      fetchingDetails: "Fetching details...",
      date: "Date",
      type: "Type",
      price: "Price",
      total: "Total",
      change: "Change",
      optional: "optional",
      saveChanges: "Save Changes",
      justNow: "just now",
      secondsAgo: "s ago",
      minutesAgo: "m ago",
      hoursAgo: "h ago",
      daysAgo: "d ago",
    },
    auth: {
      loginTitle: "Welcome back",
      loginSubtitle: "Sign in to your EyeStocks AI account",
      signupTitle: "Create account",
      signupSubtitle: "Join EyeStocks AI today",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      username: "Username",
      fullName: "Full Name",
      forgotPassword: "Forgot password?",
      rememberMe: "Remember me",
      orContinueWith: "Or continue with",
      continueWithGoogle: "Continue with Google",
      alreadyHaveAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      termsAgree: "I agree to the Terms of Service and Privacy Policy",
      verifyEmail: "Verify your email",
      resetPassword: "Reset Password",
      sendResetLink: "Send reset link",
      backToLogin: "Back to login",
      verificationSent: "Verification email sent",
    },
    header: {
      betaBadge: "BETA",
      accountOptions: "Account options",
      goToProfile: "Go to Profile",
    },
    community: {
      title: "Community",
      shareIdea: "Share your trading idea or market analysis...",
      attachStock: "Attach stock symbol (optional, e.g. AAPL)",
      post: "Post",
      allPosts: "All Posts",
      trending: "Trending",
      following: "Following",
      noPosts: "No Posts Yet",
      noTrendingPosts: "No Trending Posts",
      noFollowingPosts: "No Posts from Following",
      signInToPost: "Sign In to Post",
      signInRequired: "Sign In Required",
      signInToFollow: "Sign in to see posts from people you follow.",
      quickActions: "Quick Actions",
      practiceTrading: "Practice Trading",
      exploreStocks: "Explore Stocks",
      viewPortfolio: "View Portfolio",
      communityStats: "Community",
      totalPosts: "Total Posts",
      activeTraders: "Active Traders",
      topTraders: "Top Traders",
      follow: "Follow",
      following_btn: "Following",
      viewDiscussion: "View discussion",
      justNow: "just now",
      virtualValue: "Virtual Value",
      mentions: "mentions",
      bullish: "bullish",
    },
    explore: {
      title: "Explore Stocks",
      subtitle: "Real-time data",
      searchPlaceholder: "Search stocks...",
      sectors: "Sectors",
      trendingStocks: "Trending Stocks",
      stockDetails: "Stock Details",
      volume: "Volume",
      marketCap: "Market Cap",
      sector: "Sector",
      price: "Price",
      change: "Change",
      trade: "Trade",
      analyze: "Analyze",
      addToWatchlist: "Add to Watchlist",
      removeFromWatchlist: "Remove from Watchlist",
      inWatchlist: "In Watchlist",
      tradeInSimulator: "Trade in Simulator",
      viewFullAnalysis: "View Full Analysis Page",
      loadingMarket: "Loading market data...",
      fetchingData: "Fetching real-time stock quotes and community insights.",
      noStocksFound: "No stocks found",
      adjustSearch: "Try adjusting your search or sector filter.",
      realTimeData: "Real-time data",
    },
    portfolio: {
      title: "Portfolio",
      totalValue: "Total Value",
      totalGain: "Total Gain",
      totalReturn: "Total Return",
      totalInvestment: "Total Investment",
      dayChange: "Day Change",
      holdings: "Holdings",
      positionsCount: "Positions",
      watchlist: "Watchlist",
      transactions: "Transactions",
      recentTransactions: "Recent Transactions",
      noHoldings: "No holdings yet",
      noWatchlist: "No Watchlist Items",
      noTransactions: "No Transactions Yet",
      noTransactionsDesc: "Your buy and sell transactions will appear here.",
      startInvesting: "Start building your portfolio by adding your first stock.",
      addStocks: "Add stocks to your watchlist",
      symbol: "Symbol",
      shares: "Shares",
      avgCost: "Avg. Cost",
      currentPrice: "Current Price",
      totalValueUsd: "Total Value (USD)",
      gainLoss: "Gain/Loss",
      totalGainLoss: "Total Gain/Loss",
      action: "Action",
      sell: "Sell",
      buy: "Buy",
      buyMore: "Buy More",
      addToPortfolio: "Add to Portfolio",
      addStockToPortfolio: "Add Stock to Portfolio",
      resetPortfolio: "Reset Portfolio",
      resetPortfolioConfirm: "Are you sure you want to reset your portfolio? This will sell all holdings and delete all transactions.",
      resetConfirm: "Are you sure you want to reset your portfolio? This will sell all holdings and delete all transactions.",
      addStock: "Add Stock",
      noHoldingsYet: "No Holdings Yet",
      noHoldingsDesc: "Start building your portfolio by adding your first stock.",
      addFirstStock: "Add Your First Stock",
      noTransactionsYet: "No Transactions Yet",
      bought: "Bought",
      sold: "Sold",
      sharesCount: "Number of Shares",
      enterShares: "Enter number of shares",
      buyPrice: "Buy Price",
      perShare: "per share",
      enterBuyPrice: "Enter your buy price",
      currentValue: "Current Value",
      deletePosition: "Delete Position",
      deleteConfirm: "Are you sure you want to remove this stock from your portfolio? This action cannot be undone.",
      justNow: "just now",
      secondsAgo: "s ago",
      minutesAgo: "m ago",
      hoursAgo: "h ago",
      daysAgo: "d ago",
      performance7d: "7-Day Performance",
      noPerfData: "No performance data yet",
      keepTrading: "Keep trading to see history",
      assetAllocation: "Asset Allocation",
      practiceTrading: "Practice Trading",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      signInToView: "Sign in to view your Portfolio",
      signInDesc: "Track your holdings, make trades, and monitor performance — all in one place.",
      trackHoldings: "Track your holdings, make trades, and monitor performance — all in one place.",
      loadingPortfolio: "Loading portfolio...",
      sharesToSell: "Shares to Sell",
      sharesToBuy: "Number of Shares",
      estimatedProceeds: "Estimated Proceeds",
      purchaseDate: "Purchase Date",
      costPerShare: "Buy Price (per share)",
      saveChanges: "Save Changes",
      deleteTitle: "Delete",
      deleteDescription: "This will remove this stock from your portfolio and sell all shares at the current market price.",
      totalUsd: "Total (USD)",
      searchStocks: "Search stocks...",
      noStocksFound: "No stocks found",
    },
    simulator: {
      title: "Trading Simulator",
      subtitle: "Practice trading with virtual money",
      balance: "Cash Balance",
      portfolioValue: "Portfolio Value",
      totalPnl: "Total P&L",
      positions: "Positions",
      history: "History",
      buyStock: "Buy Stock",
      sellStock: "Sell Stock",
      quantity: "Quantity",
      orderType: "Order Type",
      market: "Market",
      limit: "Limit",
      placeOrder: "Place Order",
      noPositions: "No open positions",
      noHistory: "No trade history",
      resetPortfolio: "Reset Portfolio",
      resetPortfolioConfirm: "Are you sure you want to reset your portfolio?",
      resetChallenge: "Reset Challenge",
      goal: "Goal",
      reached: "Goal Reached!",
      notReached: "Keep going",
      startingBalance: "Starting Balance",
      targetBalance: "Target Balance",
      simulatorChallenge: "Simulator Challenge",
      goal10k: "Goal: $10k",
      availableCash: "Available Cash",
      inStocks: "In Stocks",
      progressComplete: "complete",
      startTradingProgress: "Start trading to make progress!",
      sharesLabel: "Number of Shares",
      sharesPlaceholder: "Enter number of shares",
      totalUsd: "Total (USD)",
      tradeSimulatedDisclaimer: "This is a simulated trade. All values tracked in USD. Win the challenge if you reach $10,000!",
      winTargetReached: "Target Reached!",
      playAgain: "Play Again",
      signInToUse: "Please log in to use the Trading Simulator",
      buy: "Buy",
      sell: "Sell",
      orderTypeLabel: "Order Type",
      pricePerShare: "Price per share",
      placeBuyOrder: "Place Buy Order",
      placeSellOrder: "Place Sell Order",
      change: "Change",
      loadingSimulator: "Loading simulator...",
      simulationPerformance: "Simulation Performance",
      messages: {
        insufficientCash: "Insufficient cash. Available: ${available}, Required: ${required}",
        alreadyWon: "You have already won the simulation. Reset to play again.",
        noShares: "You don't hold any shares of ${symbol}",
        insufficientShares: "Insufficient shares.",
        buySuccess: "Successfully bought ${shares} shares of ${symbol} at ${price} (USD)",
        sellSuccess: "Successfully sold ${shares} shares of ${symbol} at ${price} (USD)",
        resetSuccess: "Simulation reset successfully, back to $2,000",
      },
    },
    profile: {
      title: "Profile",
      editProfile: "Edit Profile",
      followers: "Followers",
      following: "Following",
      posts: "Posts",
      joinedDate: "Joined",
      bio: "Bio",
      noBio: "No bio yet",
      changePicture: "Change Picture",
      saveChanges: "Save Changes",
      portfolioPerformance: "Portfolio Performance",
      totalReturn: "Total Return",
      winRate: "Win Rate",
      tradesCount: "Trades",
      trades: "Trades",
      joined: "Joined",
      loadingProfile: "Loading profile...",
    },
    loading: {
      title: "EyeStocks AI",
      subtitle: "Intelligent Market Predictions",
      quote: '"Smart investments today, secure wealth tomorrow"',
      philosophy: "- EyeStocks AI Investment Philosophy",
      preparing: "Preparing your AI-powered trading experience",
    },
    stockDetail: {
      overview: "Overview",
      aiPrediction: "AI Prediction",
      priceHistory: "Price History",
      indicators: "Indicators",
      community: "Community",
      prediction: "Prediction",
      confidence: "Confidence",
      direction: "Direction",
      bullish: "Bullish",
      bearish: "Bearish",
      neutral: "Neutral",
      disclaimer: "AI predictions are for informational purposes only and do not constitute financial advice.",
      lastUpdated: "Last Updated",
      high52w: "52W High",
      low52w: "52W Low",
      peRatio: "P/E Ratio",
      dividendYield: "Dividend Yield",
    },
    footer: {
      about: "About",
      terms: "Terms",
      privacy: "Privacy",
      help: "Help",
      disclaimer: "For educational purposes only. Not financial advice.",
      rights: "All rights reserved.",
    },
    disclaimer: {
      title: "Investment Disclaimer",
      body: "EyeStocks AI is an educational platform designed for learning and simulation purposes only. The AI predictions, market data, and any content on this platform do not constitute financial advice. Past performance is not indicative of future results. Always consult a qualified financial advisor before making any investment decisions.",
      accept: "I Understand",
    },
    about: {
      hero: {
        welcome: "Welcome to EyeStocks AI",
        title: "We believe successful investing should not be limited to",
        subtitle: "Wall Street experts.",
        desc: "Our mission is to make advanced market intelligence accessible to everyone through modern AI technologies and intuitive financial tools. By combining machine learning, predictive analytics, and real-time financial insights, we help investors reduce emotional decision-making and trade with greater confidence.",
      },
      story: {
        label: "Our Mission",
        missionDesc: "Make advanced market intelligence accessible to everyone through modern AI technologies and intuitive financial tools.",
        storyLabel: "Our Story",
        paragraph1: "EyeStocks AI started as an ambitious graduation project at King Faisal University under the College of Computer Sciences & Information Technology.",
        paragraph2: "We identified a major challenge in the financial world: while many AI forecasting models are technically powerful, they are often too complex and impractical for everyday investors.",
        goalTitle: "Our goal became clear:",
        goalText: "Build an intelligent platform that learns from historical market behavior, analyzes current trends, and forecasts future stock movements in a simple and accessible way.",
        footer: "Today, EyeStocks AI continues evolving into a complete intelligent investing ecosystem designed for modern traders and investors.",
      },
      features: {
        badge: "What We Offer",
        title: "Powerful Tools for Smarter Investing",
        items: [
          {
            title: "Intelligent Forecasting",
            desc: "Our Hybrid AI Engine combines LSTM Neural Networks and XGBoost models to generate highly accurate stock movement predictions while minimizing market noise.",
            bullets: ["Advanced AI prediction models", "Trend forecasting with high accuracy", "Real-time market analysis", "Smart buy/sell insights"]
          },
          {
            title: "Risk-Free Trading Simulator",
            desc: "Practice before risking real capital. Our integrated virtual trading environment allows users to test strategies using simulated portfolios under real market conditions.",
            bullets: ["Virtual portfolio management", "Realistic market simulations", "Strategy testing environment", "Beginner-friendly experience"]
          },
          {
            title: "Confidence & Risk Metrics",
            desc: "We believe transparency matters. Instead of only showing a predicted price, EyeStocks AI provides confidence indicators and risk metrics to support smarter trading decisions.",
            bullets: ["AI confidence scoring", "Risk awareness indicators", "Market volatility analysis", "Decision-support insights"]
          },
          {
            title: "Interactive Community",
            desc: "Investing becomes better when knowledge is shared. Our social hub allows investors and traders to discuss market trends, exchange insights, and learn collaboratively.",
            bullets: ["Community discussions", "Shared market insights", "Investor engagement", "Collaborative learning"]
          }
        ]
      },
      team: {
        badge: "Meet the Team",
        title: "The Minds Behind EyeStocks AI",
        roleLeader: "Team Leader",
        roleMember: "Team Member",
        supervisorLabel: "Academic Supervision",
        supervisorBy: "Supervised by:",
        supervisorName: "Prof. Alaa Sagheer",
        members: {
          sharidah: "Sharidah AlGhannam",
          ali: "Ali Alibrahim",
          qasem: "Qasem Alolaywi",
          abdullah: "Abdullah AlKhodir"
        }
      }
    },
    terms: {
      badge: "Legal",
      title: "Terms of Service",
      desc: "These terms govern your access to and use of EyeStocks AI. By using our platform, you agree to these terms and our commitment to transparency.",
      lastUpdated: "Last Updated: May 2026",
      onThisPage: "On this page",
      showMore: "Show more",
      sections: [
        { id: "intro", title: "1. Introduction", content: "Welcome to EyeStocks AI. These Terms of Service (\"Terms\") govern your access to and use of our website, AI-driven stock prediction tools, virtual trading simulator, and community features. By creating an account or using our services, you agree to be bound by these Terms. If you do not agree, please do not use the platform." },
        { id: "user", title: "2. User Responsibilities", content: "To maintain a secure environment, you agree to: Provide accurate and complete information during registration. Maintain the confidentiality of your account credentials. Be solely responsible for all activities that occur under your account. Notify us immediately of any unauthorized use of your account." },
        { id: "use", title: "3. Acceptable Use", content: "You agree not to use EyeStocks AI to: Attempt to bypass, crawl, or \"scrape\" our AI prediction models or data pipelines. Post offensive, defamatory, or unlawful content within the community social feed. Manipulate the virtual trading simulator through technical exploits. Impersonate financial advisors or provide professional financial advice to other users." },
        { id: "intellectual", title: "4. Intellectual Property", content: "All content on this platform—including the Hybrid AI models (LSTM & XGBoost), proprietary algorithms, user interface design, logos, and documentation—is the intellectual property of the EyeStocks AI development team and protected by copyright and academic integrity laws. You are granted a limited, non-exclusive license to use the platform for personal, non-commercial educational purposes." },
        { id: "disclaimer", title: "5. Disclaimers (IMPORTANT)", content: "Educational Use Only: EyeStocks AI is a graduation project developed for academic purposes. It is not a licensed financial advisory service. No Financial Advice: The AI predictions and community insights are for informational and simulation purposes only. They do not constitute investment advice. Simulation vs. Reality: The virtual trading simulator uses real-market data, but all \"trades\" are executed with virtual currency. No real money is ever at risk. Accuracy: While we strive for high precision (64%+ directional accuracy), stock markets are inherently volatile. We do not guarantee the accuracy of any prediction. Limitation of Liability: The developers and King Faisal University (KFU) are not liable for any financial losses incurred in real-world trading based on information from this platform." },
        { id: "contact", title: "6. Contact Information", content: "For questions regarding these Terms, please contact us at: Email: support@eyestocks-ai.com" }
      ]
    },
    privacy: {
      badge: "Privacy",
      title: "Privacy Policy",
      desc: "Your privacy is important to us. This policy explains how EyeStocks AI collects, uses, and protects your personal information.",
      lastUpdated: "Last Updated: May 2026",
      onThisPage: "On this page",
      sections: [
        { id: "intro", title: "1. Introduction", content: "At EyeStocks AI, your privacy is a priority. This Privacy Policy explains how we collect, use, and protect your information when you interact with our platform." },
        { id: "collect", title: "2. Information We Collect", content: "We collect information to provide a personalized and functional experience: Personal Information (Name, email address, and profile details during sign-up), Usage Data (Details of your virtual trades, watchlist preferences, and interactions within the community feed), and Technical Data (IP address, browser type, and device information collected via our cloud hosting service providers)." },
        { id: "usage", title: "3. How We Use Information", content: "We use the data collected for the following purposes: To manage your virtual portfolio and sync your trading history. To improve our AI prediction models by analyzing aggregate user trends. To maintain the security and integrity of the community social feed. To provide technical support and platform updates." },
        { id: "cookies", title: "4. Cookies & Tracking", content: "EyeStocks AI uses essential cookies and local storage to: Keep you logged in across sessions (using JWT tokens), remember your UI preferences (e.g., dark mode), and analyze platform traffic through basic analytics tools. You can disable cookies in your browser settings, but some features of the platform may stop functioning." },
        { id: "sharing", title: "5. Data Sharing", content: "We do not sell your personal data to third parties. We only share information with service providers necessary for our operations: Database Management (Your data is securely stored via our database service provider), Hosting Providers (Technical logs are managed by our cloud hosting service providers), and Legal Requirements (We may disclose information if required by law or to protect our academic and legal rights)." },
        { id: "security", title: "6. Data Security", content: "We implement industry-standard security measures, including Encryption (All data transmission is secured via HTTPS/SSL), Safe Authentication (We use stateless JSON Web Tokens for secure user sessions), and Database Security (Row Level Security is applied to ensure you can only access your own portfolio data)." },
        { id: "rights", title: "7. Your Rights", content: "You have the right to: Access the personal data we hold about you. Request the correction of inaccurate data. Request the deletion of your account and all associated trading data. Opt-out of any non-essential communications." },
        { id: "contact", title: "8. Contact Information", content: "For privacy-related inquiries or to exercise your data rights, please reach out: Email: privacy@eyestocks-ai.com" }
      ]
    },
    help: {
      title: "Help Center",
      subtitle: "Find answers, guides, and support to help you make the most of EyeStocks AI.",
      searchPlaceholder: "Search for articles, topics or keywords...",
      browseByCategory: "Browse by Category",
      popularArticles: "Popular Articles",
      stillNeedHelp: "Still need help?",
      cantFind: "Can't find what you're looking for?",
      contactSupport: "Contact Support",
      articlesCount: "articles",
      categories: {
        gettingStarted: { title: "Getting Started", desc: "Learn the basics and set up your account quickly." },
        features: { title: "Features & Tools", desc: "Understand powerful tools and how they work." },
        simulator: { title: "Simulator", desc: "Learn how to practice trading with the simulator." },
        account: { title: "Account & Security", desc: "Manage your account and keep it secure." },
        billing: { title: "Billing & Subscription", desc: "Manage your plan, payments and subscriptions." }
      },
      popularArticlesList: [
        "How EyeStocks AI makes stock predictions",
        "How to use the trading simulator",
        "Understanding Confidence Score",
        "How to manage your watchlist",
        "Account security best practices"
      ],
      highlights: [
        { title: "24/7 Support", desc: "We're here whenever you need us." },
        { title: "Secure & Trusted", desc: "Your security is our top priority." },
        { title: "Learning Resources", desc: "Guides and tutorials to help you grow." },
        { title: "Community Driven", desc: "Join discussions and learn from others." }
      ]
    }
  },
  ar: {
    nav: {
      home: "الرئيسية",
      explore: "استكشاف",
      portfolio: "محفظتي",
      simulator: "المحاكي",
      profile: "الملف الشخصي",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      adminPanel: "لوحة الإدارة",
      community: "المجتمع",
    },
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ ما",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      close: "إغلاق",
      back: "رجوع",
      submit: "إرسال",
      confirm: "تأكيد",
      search: "بحث",
      refresh: "تحديث",
      all: "الكل",
      noData: "لا توجد بيانات متاحة",
      viewAll: "عرض الكل",
      loadingApp: "جاري تحميل EyeStocks AI...",
      fetchingDetails: "جاري جلب التفاصيل...",
      date: "التاريخ",
      type: "النوع",
      price: "السعر",
      total: "الإجمالي",
      change: "تغيير",
      justNow: "الآن",
      secondsAgo: "ثانية",
      minutesAgo: "دقيقة",
      hoursAgo: "ساعة",
      daysAgo: "أيام",
      optional: "اختياري",
      saveChanges: "حفظ التغييرات",
    },
    auth: {
      loginTitle: "مرحباً بعودتك",
      loginSubtitle: "سجّل دخولك إلى حسابك في EyeStocks AI",
      signupTitle: "إنشاء حساب جديد",
      signupSubtitle: "انضم إلى EyeStocks AI اليوم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      username: "اسم المستخدم",
      fullName: "الاسم الكامل",
      forgotPassword: "نسيت كلمة المرور؟",
      rememberMe: "تذكرني",
      orContinueWith: "أو تابع باستخدام",
      continueWithGoogle: "المتابعة عبر Google",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب؟",
      termsAgree: "أوافق على شروط الخدمة وسياسة الخصوصية",
      verifyEmail: "تحقق من بريدك الإلكتروني",
      resetPassword: "إعادة تعيين كلمة المرور",
      sendResetLink: "إرسال رابط الاستعادة",
      backToLogin: "العودة لتسجيل الدخول",
      verificationSent: "تم إرسال رسالة التحقق",
    },
    header: {
      betaBadge: "تجريبي",
      accountOptions: "خيارات الحساب",
      goToProfile: "الملف الشخصي",
    },
    community: {
      title: "المجتمع",
      shareIdea: "شارك فكرتك أو تحليلك للسوق...",
      attachStock: "أضف رمز سهم (اختياري، مثل: 2222.SR)",
      post: "نشر",
      allPosts: "جميع المنشورات",
      trending: "الأكثر تداولاً",
      following: "المتابَعون",
      noPosts: "لا توجد منشورات بعد",
      noTrendingPosts: "لا توجد منشورات رائجة",
      noFollowingPosts: "لا توجد منشورات ممن تتابعهم",
      signInToPost: "سجّل دخولك للنشر",
      signInRequired: "يلزم تسجيل الدخول",
      signInToFollow: "سجّل دخولك لعرض منشورات الأشخاص الذين تتابعهم.",
      quickActions: "إجراءات سريعة",
      practiceTrading: "تدرّب على التداول",
      exploreStocks: "استكشف الأسهم",
      viewPortfolio: "عرض المحفظة",
      communityStats: "إحصاءات المجتمع",
      totalPosts: "إجمالي المنشورات",
      activeTraders: "المتداولون النشطون",
      topTraders: "أفضل المتداولين",
      follow: "متابعة",
      following_btn: "متابَع",
      viewDiscussion: "عرض النقاش",
      justNow: "الآن",
      virtualValue: "القيمة الافتراضية",
      mentions: "إشارة",
      bullish: "صاعد",
    },
    explore: {
      title: "استكشاف الأسهم",
      subtitle: "بيانات فورية",
      searchPlaceholder: "ابحث عن الأسهم...",
      sectors: "القطاعات",
      trendingStocks: "الأسهم الرائجة",
      stockDetails: "تفاصيل السهم",
      volume: "حجم التداول",
      marketCap: "القيمة السوقية",
      sector: "القطاع",
      price: "السعر",
      change: "التغيير",
      trade: "تداول",
      analyze: "تحليل",
      addToWatchlist: "إضافة للمفضلة",
      removeFromWatchlist: "إزالة من المفضلة",
      inWatchlist: "في المفضلة",
      tradeInSimulator: "تداول في المحاكي",
      viewFullAnalysis: "عرض صفحة التحليل الكاملة",
      loadingMarket: "جاري تحميل بيانات السوق...",
      fetchingData: "يتم جلب أسعار الأسهم الفورية وإحصاءات المجتمع.",
      noStocksFound: "لم يتم العثور على أسهم",
      adjustSearch: "حاول تعديل البحث أو تصفية القطاع.",
      realTimeData: "بيانات فورية",
    },
    portfolio: {
      title: "المحفظة الاستثمارية",
      totalValue: "إجمالي القيمة",
      totalGain: "إجمالي الربح",
      totalReturn: "العائد الكلي",
      totalInvestment: "إجمالي الاستثمار",
      dayChange: "تغيير اليوم",
      holdings: "الأصول المملوكة",
      positionsCount: "صفقة",
      watchlist: "المفضلة",
      transactions: "المعاملات",
      recentTransactions: "المعاملات الأخيرة",
      noHoldings: "لا توجد أصول بعد",
      noWatchlist: "لا توجد عناصر في قائمة المراقبة",
      noTransactions: "لا توجد معاملات بعد",
      noTransactionsDesc: "ستظهر عمليات البيع والشراء الخاصة بك هنا.",
      startInvesting: "ابدأ في بناء محفظتك بإضافة أول سهم لك.",
      addStocks: "أضف أسهماً إلى قائمة المفضلة",
      symbol: "الرمز",
      shares: "الأسهم",
      avgCost: "متوسط التكلفة",
      currentPrice: "السعر الحالي",
      totalValueUsd: "إجمالي القيمة (دولار)",
      gainLoss: "الربح/الخسارة",
      totalGainLoss: "إجمالي الربح/الخسارة",
      action: "إجراء",
      sell: "بيع",
      buy: "شراء",
      buyMore: "شراء المزيد",
      addToPortfolio: "إضافة للمحفظة",
      addStockToPortfolio: "إضافة سهم للمحفظة",
      resetPortfolio: "إعادة تعيين المحفظة",
      resetPortfolioConfirm: "هل أنت متأكد من إعادة تعيين محفظتك؟ سيؤدي ذلك إلى بيع جميع الأصول وحذف جميع المعاملات.",
      resetConfirm: "هل أنت متأكد من رغبتك في إعادة تعيين محفظتك؟ سيؤدي هذا إلى بيع جميع الأصول وحذف جميع المعاملات.",
      addStock: "إضافة سهم",
      noHoldingsYet: "لا توجد أصول مملوكة بعد",
      noHoldingsDesc: "ابدأ في بناء محفظتك عن طريق إضافة أول سهم لك.",
      addFirstStock: "أضف سهمك الأول",
      noTransactionsYet: "لا توجد معاملات بعد",
      bought: "تم شراء",
      sold: "تم بيع",
      sharesCount: "عدد الأسهم",
      enterShares: "أدخل عدد الأسهم",
      buyPrice: "سعر الشراء",
      perShare: "للسهم الواحد",
      enterBuyPrice: "أدخل سعر الشراء الخاص بك",
      currentValue: "القيمة الحالية",
      deletePosition: "حذف الصفقة",
      deleteConfirm: "هل أنت متأكد أنك تريد إزالة هذا السهم من محفظتك؟ لا يمكن التراجع عن هذا الإجراء.",
      justNow: "الآن",
      secondsAgo: "ثانية",
      minutesAgo: "دقيقة",
      hoursAgo: "ساعة",
      daysAgo: "يوم",
      performance7d: "أداء 7 أيام",
      noPerfData: "لا توجد بيانات أداء بعد",
      keepTrading: "واصل التداول لعرض السجل",
      assetAllocation: "توزيع الأصول",
      practiceTrading: "تدرب على التداول",
      view: "عرض",
      edit: "تعديل",
      delete: "حذف",
      signInToView: "سجل الدخول لعرض محفظتك",
      signInDesc: "تتبع أصولك، نفذ صفقاتك، وراقب أداءك — كل ذلك في مكان واحد.",
      trackHoldings: "تتبع أصولك، قم بإجراء الصفقات، وراقب الأداء - كل ذلك في مكان واحد.",
      loadingPortfolio: "جاري تحميل المحفظة...",
      sharesToSell: "عدد الأسهم للبيع",
      sharesToBuy: "عدد الأسهم",
      estimatedProceeds: "العوائد التقديرية",
      purchaseDate: "تاريخ الشراء",
      costPerShare: "سعر الشراء (للسهم الواحد)",
      saveChanges: "حفظ التغييرات",
      deleteTitle: "حذف",
      deleteDescription: "سيؤدي هذا إلى إزالة هذا السهم من محفظتك وبيع جميع الأسهم بسعر السوق الحالي.",
      totalUsd: "الإجمالي (دولار)",
      searchStocks: "البحث عن الأسهم...",
      noStocksFound: "لم يتم العثور على أسهم",
    },
    simulator: {
      title: "محاكي التداول",
      subtitle: "تدرّب على التداول بأموال افتراضية",
      balance: "الرصيد النقدي",
      portfolioValue: "قيمة المحفظة",
      totalPnl: "إجمالي الربح والخسارة",
      positions: "الصفقات المفتوحة",
      history: "السجل",
      buyStock: "شراء سهم",
      sellStock: "بيع سهم",
      quantity: "الكمية",
      orderType: "نوع الأمر",
      market: "سعر السوق",
      limit: "سعر محدد",
      placeOrder: "تنفيذ الأمر",
      noPositions: "لا توجد صفقات مفتوحة",
      noHistory: "لا يوجد سجل تداول",
      resetPortfolio: "إعادة تعيين المحفظة",
      resetPortfolioConfirm: "هل أنت متأكد من إعادة تعيين المحفظة؟",
      resetChallenge: "إعادة تعيين التحدي",
      goal: "الهدف",
      reached: "تم تحقيق الهدف!",
      notReached: "واصل المحاولة",
      startingBalance: "الرصيد الابتدائي",
      targetBalance: "الرصيد المستهدف",
      simulatorChallenge: "تحدي المحاكي",
      goal10k: "الهدف: 10 آلاف $",
      availableCash: "النقد المتاح",
      inStocks: "في الأسهم",
      progressComplete: "مكتمل",
      startTradingProgress: "ابدأ التداول لتحقيق تقدم!",
      sharesLabel: "عدد الأسهم",
      sharesPlaceholder: "أدخل عدد الأسهم",
      totalUsd: "الإجمالي (دولار)",
      tradeSimulatedDisclaimer: "هذا تداول افتراضي. جميع القيم يتم تتبعها بالدولار. فُز بالتحدي عند وصولك لـ 10,000$!",
      winTargetReached: "تم تحقيق الهدف!",
      playAgain: "العب مرة أخرى",
      signInToUse: "يرجى تسجيل الدخول لاستخدام محاكي التداول",
      buy: "شراء",
      sell: "بيع",
      orderTypeLabel: "نوع الأمر",
      pricePerShare: "سعر السهم",
      placeBuyOrder: "تنفيذ أمر شراء",
      placeSellOrder: "تنفيذ أمر بيع",
      change: "تغيير",
      loadingSimulator: "جاري تحميل المحاكي...",
      simulationPerformance: "أداء المحاكاة",
      messages: {
        insufficientCash: "رصيد غير كافٍ. المتاح: ${available}، المطلوب: ${required}",
        alreadyWon: "لقد فزت بالفعل في التحدي. قم بإعادة الضبط للعب مرة أخرى.",
        noShares: "أنت لا تملك أي أسهم في ${symbol}",
        insufficientShares: "عدد الأسهم غير كافٍ.",
        buySuccess: "تم شراء ${shares} سهم من ${symbol} بنجاح بسعر ${price} (دولار)",
        sellSuccess: "تم بيع ${shares} سهم من ${symbol} بنجاح بسعر ${price} (دولار)",
        resetSuccess: "تم إعادة ضبط المحاكي بنجاح، رصيدك الآن 2,000 دولار",
      },
    },
    profile: {
      title: "الملف الشخصي",
      editProfile: "تعديل الملف الشخصي",
      followers: "متابع",
      following: "متابَع",
      posts: "منشور",
      joinedDate: "تاريخ الانضمام",
      bio: "نبذة شخصية",
      noBio: "لا توجد نبذة بعد",
      changePicture: "تغيير الصورة",
      saveChanges: "حفظ التغييرات",
      portfolioPerformance: "أداء المحفظة",
      totalReturn: "العائد الكلي",
      winRate: "نسبة النجاح",
      tradesCount: "الصفقات",
      trades: "صفقة",
      joined: "انضم في",
      loadingProfile: "جاري تحميل الملف الشخصي...",
    },
    loading: {
      title: "EyeStocks AI",
      subtitle: "توقعات السوق الذكية",
      quote: '"استثمارات ذكية اليوم، ثروة آمنة غداً"',
      philosophy: "- فلسفة EyeStocks AI في الاستثمار",
      preparing: "جاري تحضير تجربة التداول المدعومة بالذكاء الاصطناعي",
    },
    stockDetail: {
      overview: "نظرة عامة",
      aiPrediction: "توقعات الذكاء الاصطناعي",
      priceHistory: "تاريخ السعر",
      indicators: "المؤشرات",
      community: "المجتمع",
      prediction: "التوقع",
      confidence: "درجة الثقة",
      direction: "الاتجاه",
      bullish: "صاعد",
      bearish: "هابط",
      neutral: "محايد",
      disclaimer: "توقعات الذكاء الاصطناعي لأغراض معلوماتية فقط ولا تمثل نصيحة مالية.",
      lastUpdated: "آخر تحديث",
      high52w: "أعلى سعر (52 أسبوع)",
      low52w: "أدنى سعر (52 أسبوع)",
      peRatio: "مضاعف الأرباح",
      dividendYield: "عائد الأرباح",
    },
    footer: {
      about: "من نحن",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      help: "المساعدة",
      disclaimer: "للأغراض التعليمية فقط. ليست نصيحة مالية.",
      rights: "جميع الحقوق محفوظة.",
    },
    disclaimer: {
      title: "إخلاء المسؤولية",
      body: "EyeStocks AI منصة تعليمية مصممة لأغراض التعلم والمحاكاة فقط. لا تُعدّ توقعات الذكاء الاصطناعي وبيانات السوق والمحتوى الموجود على هذه المنصة نصيحةً مالية. الأداء السابق لا يضمن النتائج المستقبلية. استشر مستشاراً مالياً مؤهلاً دائماً قبل اتخاذ أي قرارات استثمارية.",
      accept: "فهمت وأوافق",
    },
    about: {
      hero: {
        welcome: "مرحباً بكم في <span dir='ltr' class='isolate-term'>EyeStocks AI</span>",
        title: "نؤمن بأن الاستثمار الناجح لا ينبغي أن يقتصر على",
        subtitle: "خبراء وول ستريت.",
        desc: "مهمتنا هي جعل ذكاء السوق المتقدم متاحاً للجميع من خلال تقنيات الذكاء الاصطناعي الحديثة والأدوات المالية البديهية. من خلال الجمع بين التعلم الآلي والتحليلات التنبؤية والرؤى المالية في الوقت الفعلي، نساعد المستثمرين على تقليل اتخاذ القرارات العاطفية والتداول بثقة أكبر.",
      },
      story: {
        label: "مهمتنا",
        missionDesc: "جعل ذكاء السوق المتقدم متاحاً للجميع من خلال تقنيات الذكاء الاصطناعي الحديثة والأدوات المالية البديهية.",
        storyLabel: "قصتنا",
        paragraph1: "بدأت <span dir='ltr' class='isolate-term'>EyeStocks AI</span> كمشروع تخرج طموح في <span class='font-bold text-slate-900 underline decoration-teal-500/30 underline-offset-4'>جامعة الملك فيصل</span> تحت <span class='font-bold text-slate-900'>كلية علوم الحاسب وتقنية المعلومات</span>.",
        paragraph2: "لقد حددنا تحدياً كبيراً في العالم المالي: فبينما العديد من نماذج التنبؤ بالذكاء الاصطناعي قوية تقنياً، إلا أنها غالباً ما تكون معقدة للغاية وغير عملية للمستثمرين العاديين.",
        goalTitle: "أصبح هدفنا واضحاً:",
        goalText: "بناء منصة ذكية تتعلم من سلوك السوق التاريخي، وتحلل الاتجاهات الحالية، وتتنبأ بتحركات الأسهم المستقبلية بطريقة بسيطة وسهلة الوصول.",
        footer: "اليوم، تستمر <span dir='ltr' class='isolate-term'>EyeStocks AI</span> في التطور لتصبح نظاماً استثمارياً ذكياً متكاملاً مصمماً للمتداولين والمستثمرين المعاصرين.",
      },
      features: {
        badge: "ما نقدمه",
        title: "أدوات قوية لاستثمار أذكى",
        items: [
          {
            title: "تنبؤ ذكي",
            desc: "محرك الذكاء الاصطناعي الهجين لدينا يجمع بين شبكات <span dir='ltr' class='isolate-term'>LSTM</span> العصبية ونماذج <span dir='ltr' class='isolate-term'>XGBoost</span> لإنشاء توقعات دقيقة للغاية لحركة الأسهم مع تقليل ضوضاء السوق.",
            bullets: ["نماذج توقع متقدمة بالذكاء الاصطناعي", "توقع الاتجاهات بدقة عالية", "تحليل السوق في الوقت الفعلي", "رؤى ذكية للشراء والبيع"]
          },
          {
            title: "محاكي تداول بدون مخاطر",
            desc: "تدرب قبل المخاطرة برأس مال حقيقي. تتيح بيئة التداول الافتراضية المتكاملة للمستخدمين اختبار الاستراتيجيات باستخدام محافظ محاكاة تحت ظروف السوق الحقيقية.",
            bullets: ["إدارة المحفظة الافتراضية", "محاكاة واقعية للسوق", "بيئة لاختبار الاستراتيجيات", "تجربة سهلة للمبتدئين"]
          },
          {
            title: "مقاييس الثقة والمخاطر",
            desc: "نحن نؤمن بأهمية الشفافية. بدلاً من عرض السعر المتوقع فقط، توفر <span dir='ltr' class='isolate-term'>EyeStocks AI</span> مؤشرات الثقة ومقاييس المخاطر لدعم قرارات التداول الأكثر ذكاءً.",
            bullets: ["تسجيل درجة ثقة الذكاء الاصطناعي", "مؤشرات الوعي بالمخاطر", "تحليل تقلبات السوق", "رؤى لدعم القرار"]
          },
          {
            title: "مجتمع تفاعلي",
            desc: "يصبح الاستثمار أفضل عندما يتم تبادل المعرفة. يسمح مركزنا الاجتماعي للمستثمرين والمتداولين بمناقشة اتجاهات السوق وتبادل الرؤى والتعلم بشكل تعاوني.",
            bullets: ["نقاشات مجتمعية", "مشاركة رؤى السوق", "تفاعل بين المستثمرين", "تعلم تعاوني"]
          }
        ]
      },
      team: {
        badge: "فريق العمل",
        title: "العقول الكامنة خلف <span dir='ltr' class='isolate-term'>EyeStocks AI</span>",
        roleLeader: "قائد الفريق",
        roleMember: "عضو الفريق",
        supervisorLabel: "إشراف أكاديمي",
        supervisorBy: "تحت إشراف:",
        supervisorName: "البروفيسور. علاء الصغير",
        members: {
          sharidah: "شريدة الغنام",
          ali: "علي البراهيم",
          qasem: "قاسم العليوي",
          abdullah: "عبدالله الخضير"
        }
      }
    },
    terms: {
      badge: "قانوني",
      title: "شروط الخدمة",
      desc: "تحكم هذه الشروط وصولك واستخدامك لـ EyeStocks AI. باستخدام منصتنا، فإنك توافق على هذه الشروط والتزامنا بالشفافية.",
      lastUpdated: "آخر تحديث: مايو 2026",
      onThisPage: "في هذه الصفحة",
      showMore: "عرض المزيد",
      sections: [
        { id: "intro", title: "1. مقدمة", content: "مرحباً بك في <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span>. تحكم شروط الخدمة هذه (\"الشروط\") وصولك واستخدامك لموقعنا الإلكتروني وأدوات توقع الأسهم المدعومة بالذكاء الاصطناعي ومحاكي التداول الافتراضي وميزات المجتمع. من خلال إنشاء حساب أو استخدام خدماتنا، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام المنصة." },
        { id: "user", title: "2. مسؤوليات المستخدم", content: "للحفاظ على بيئة آمنة، فإنك توافق على: تقديم معلومات دقيقة وكاملة أثناء التسجيل. الحفاظ على سرية بيانات اعتماد حسابك. أن تكون مسؤولاً حصرياً عن جميع الأنشطة التي تحدث تحت حسابك. إخطارنا فوراً بأي استخدام غير مصرح به لحسابك." },
        { id: "use", title: "3. الاستخدام المقبول", content: "أنت توافق على عدم استخدام <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span> من أجل: محاولة تجاوز أو الزحف أو \"كشط\" نماذج توقع الذكاء الاصطناعي أو خطوط أنابيب البيانات لدينا. نشر محتوى مسيء أو تشهيري أو غير قانوني داخل ساحة المشاركات الاجتماعية للمجتمع. التلاعب بمحاكي التداول الافتراضي من خلال الثغرات التقنية. انتحال شخصية المستشارين الماليين أو تقديم مشورة مالية احترافية لمستخدمين آخرين." },
        { id: "intellectual", title: "4. الملكية الفكرية", content: "جميع المحتويات الموجودة على هذه المنصة - بما في ذلك نماذج الذكاء الاصطناعي الهجينة (<span dir='ltr' style='unicode-bidi: isolate'>LSTM & XGBoost</span>)، والخوارزميات المملوكة، وتصميم واجهة المستخدم، والشعارات، والوثائق - هي ملكية فكرية لفريق تطوير <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span> ومحمية بقوانين حقوق النشر والنزاهة الأكاديمية. تُمنح ترخيصاً محدوداً وغير حصري لاستخدام المنصة لأغراض تعليمية شخصية غير تجارية." },
        { id: "disclaimer", title: "5. إخلاء المسؤولية (هام)", content: "للاستخدام التعليمي فقط: <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span> هو مشروع تخرج تم تطويره لأغراض أكاديمية. إنه ليس خدمة استشارية مالية مرخصة. لا توجد نصيحة مالية: توقعات الذكاء الاصطناعي ورؤى المجتمع هي لأغراض إعلامية ومحاكاة فقط. لا تشكل نصيحة استثمارية. المحاكاة مقابل الواقع: يستخدم محاكي التداول الافتراضي بيانات السوق الحقيقية، ولكن يتم تنفيذ جميع \"الصفقات\" بالعملة الافتراضية. لا يوجد أموال حقيقية في خطر أبداً. الدقة: بينما نسعى لتحقيق دقة عالية (+64% دقة اتجاهية)، فإن أسواق الأسهم متقلبة بطبيعتها. نحن لا نضمن دقة أي توقع. تحديد المسؤولية: المطورون وجامعة الملك فيصل (<span dir='ltr' style='unicode-bidi: isolate'>KFU</span>) ليسوا مسؤولين عن أي خسائر مالية يتم تكبدها في التداول في العالم الحقيقي بناءً على معلومات من هذه المنصة." },
        { id: "contact", title: "6. معلومات التواصل", content: "للأسئلة المتعلقة بهذه الشروط، يرجى التواصل معنا عبر: البريد الإلكتروني: <span dir='ltr' style='unicode-bidi: isolate'>support@eyestocks-ai.com</span>" }
      ]
    },
    privacy: {
      badge: "الخصوصية",
      title: "سياسة الخصوصية",
      desc: "خصوصيتك هي أولويتنا في <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span>. تشرح سياسة الخصوصية هذه كيف نجمع معلوماتك ونستخدمها ونحميها عندما تتفاعل مع منصتنا.",
      lastUpdated: "آخر تحديث: مايو 2026",
      onThisPage: "في هذه الصفحة",
      sections: [
        { id: "intro", title: "1. مقدمة", content: "في <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span>، خصوصيتك هي أولوية. تشرح سياسة الخصوصية هذه كيف نجمع معلوماتك ونستخدمها ونحميها عندما تتفاعل مع منصتنا." },
        { id: "collect", title: "2. المعلومات التي نجمعها", content: "نجمع المعلومات لتوفير تجربة مخصصة ووظيفية: المعلومات الشخصية (الاسم وعنوان البريد الإلكتروني وتفاصيل الملف الشخصي المقدمة أثناء التسجيل)، بيانات الاستخدام (تفاصيل صفقاتك الافتراضية وتفضيلات قائمة المراقبة والتفاعلات داخل مجتمع الموقع)، والبيانات التقنية (عنوان <span dir='ltr' style='unicode-bidi: isolate'>IP</span> ونوع المتصفح ومعلومات الجهاز التي يتم جمعها عبر موفري خدمة الاستضافة السحابية لدينا)." },
        { id: "usage", title: "3. كيف نستخدم المعلومات", content: "نستخدم البيانات التي تم جمعها للأغراض التالية: لإدارة محفظتك الافتراضية ومزامنة سجل التداول الخاص بك. لتحسين نماذج توقع الذكاء الاصطناعي لدينا من خلال تحليل اتجاهات المستخدمين الإجمالية. للحفاظ على أمان وسلامة ساحة المشاركات الاجتماعية للمجتمع. لتقديم الدعم الفني وتحديثات المنصة." },
        { id: "cookies", title: "4. ملفات تعريف الارتباط والتتبع", content: "تستخدم <span dir='ltr' style='unicode-bidi: isolate'>EyeStocks AI</span> ملفات تعريف الارتباط الأساسية والتخزين المحلي من أجل: إبقاءك مسجلاً للدخول عبر الجلسات (باستخدام رموز <span dir='ltr' style='unicode-bidi: isolate'>JWT</span>)، وتذكر تفضيلات واجهة المستخدم الخاصة بك (مثل الوضع الليلي)، وتحليل حركة المرور للمنصة من خلال أدوات التحليل الأساسية. يمكنك تعطيل ملفات تعريف الارتباط في إعدادات متصفحك، ولكن قد تتوقف بعض ميزات المنصة عن العمل." },
        { id: "sharing", title: "5. مشاركة البيانات", content: "نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. نحن نشارك المعلومات فقط مع مزودي الخدمة اللازمين لعملياتنا: إدارة قاعدة البيانات (يتم تخزين بياناتك بشكل آمن عبر موفر خدمة قواعد البيانات لدينا)، مزودو الاستضافة (يتم إدارة السجلات التقنية بواسطة موفري خدمة الاستضافة السحابية لدينا)، والمتطلبات القانونية (قد نفصح عن المعلومات إذا طُلب منا ذلك بموجب القانون أو لحماية حقوقنا الأكاديمية والقانونية)." },
        { id: "security", title: "6. أمن البيانات", content: "نحن نطبق إجراءات أمنية قياسية في الصناعة، بما في ذلك: التشفير (يتم تأمين جميع عمليات نقل البيانات عبر <span dir='ltr' style='unicode-bidi: isolate'>HTTPS/SSL</span>)، والمصادقة الآمنة (نستخدم رموز <span dir='ltr' style='unicode-bidi: isolate'>JSON Web Tokens</span> الآمنة لجلسات المستخدم)، وأمن قاعدة البيانات (يتم تطبيق <span dir='ltr' style='unicode-bidi: isolate'>Row Level Security</span> لضمان وصولك فقط إلى بيانات محفظتك الخاصة)." },
        { id: "rights", title: "7. حقوقك", content: "لديك الحق في: الوصول إلى البيانات الشخصية التي نحتفظ بها عنك. طلب تصحيح البيانات غير الدقيقة. طلب حذف حسابك وجميع بيانات التداول المرتبطة به. إلغاء الاشتراك في أي اتصالات غير أساسية." },
        { id: "contact", title: "8. معلومات التواصل", content: "للاستفسارات المتعلقة بالخصوصية أو لممارسة حقوق البيانات الخاصة بك، يرجى التواصل عبر: البريد الإلكتروني: <span dir='ltr' style='unicode-bidi: isolate'>privacy@eyestocks-ai.com</span>" }
      ]
    },
    help: {
      title: "مركز المساعدة",
      subtitle: "ابحث عن الإجابات والأدلة والدعم لمساعدتك في تحقيق أقصى استفادة من EyeStocks AI.",
      searchPlaceholder: "ابحث عن مقالات، مواضيع أو كلمات رئيسية...",
      browseByCategory: "تصفح حسب الفئة",
      popularArticles: "المقالات الشائعة",
      stillNeedHelp: "هل ما زلت بحاجة للمساعدة؟",
      cantFind: "ألا تجد ما تبحث عنه؟",
      contactSupport: "تواصل مع الدعم",
      articlesCount: "مقالات",
      categories: {
        gettingStarted: { title: "البداية", desc: "تعرف على الأساسيات وقم بإعداد حسابك بسرعة." },
        features: { title: "المميزات والأدوات", desc: "افهم الأدوات القوية وكيفية عملها." },
        simulator: { title: "المحاكي", desc: "تعرف على كيفية ممارسة التداول باستخدام المحاكي." },
        account: { title: "الحساب والأمان", desc: "إدارة حسابك والحفاظ عليه آمنًا." },
        billing: { title: "الفواتير والاشتراك", desc: "إدارة خطتك والمدفوعات والاشتراكات." }
      },
      popularArticlesList: [
        "كيف يقوم EyeStocks AI بتوقعات الأسهم",
        "كيف تستخدم محاكي التداول",
        "فهم درجة الثقة",
        "كيف تدير قائمة المراقبة الخاصة بك",
        "أفضل ممارسات أمان الحساب"
      ],
      highlights: [
        { title: "دعم 24/7", desc: "نحن هنا متى احتجت إلينا." },
        { title: "آمن وموثوق", desc: "أمنك هو أولويتنا القصوى." },
        { title: "مصادر تعليمية", desc: "أدلة وبرامج تعليمية لمساعدتك على النمو." },
        { title: "مدفوع بالمجتمع", desc: "انضم إلى المناقشات وتعلم من الآخرين." }
      ]
    }
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("esai-language") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("esai-language", lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const isRTL = language === "ar";

  // Apply lang attribute, direction + Thmanyah font class when Arabic is active
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (language === 'ar') {
      document.documentElement.classList.add('lang-ar');
    } else {
      document.documentElement.classList.remove('lang-ar');
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isRTL,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
