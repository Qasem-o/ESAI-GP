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
    holdings: string;
    watchlist: string;
    transactions: string;
    noHoldings: string;
    noWatchlist: string;
    noTransactions: string;
    startInvesting: string;
    addStocks: string;
    symbol: string;
    shares: string;
    avgCost: string;
    currentPrice: string;
    gainLoss: string;
    action: string;
    sell: string;
    buy: string;
    addToPortfolio: string;
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
    confirmReset: string;
    goal: string;
    reached: string;
    notReached: string;
    startingBalance: string;
    targetBalance: string;
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
      holdings: "Holdings",
      watchlist: "Watchlist",
      transactions: "Transactions",
      noHoldings: "No holdings yet",
      noWatchlist: "No stocks in watchlist",
      noTransactions: "No transactions yet",
      startInvesting: "Start investing to see your portfolio here",
      addStocks: "Add stocks to your watchlist",
      symbol: "Symbol",
      shares: "Shares",
      avgCost: "Avg. Cost",
      currentPrice: "Current Price",
      gainLoss: "Gain/Loss",
      action: "Action",
      sell: "Sell",
      buy: "Buy",
      addToPortfolio: "Add to Portfolio",
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
      confirmReset: "Are you sure you want to reset your portfolio?",
      goal: "Goal",
      reached: "Goal Reached!",
      notReached: "Keep going",
      startingBalance: "Starting Balance",
      targetBalance: "Target Balance",
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
      noData: "لا توجد بيانات",
      viewAll: "عرض الكل",
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
      holdings: "الأصول",
      watchlist: "المفضلة",
      transactions: "المعاملات",
      noHoldings: "لا توجد أصول بعد",
      noWatchlist: "لا توجد أسهم في المفضلة",
      noTransactions: "لا توجد معاملات بعد",
      startInvesting: "ابدأ بالاستثمار لعرض محفظتك هنا",
      addStocks: "أضف أسهماً إلى قائمة المفضلة",
      symbol: "الرمز",
      shares: "الأسهم",
      avgCost: "متوسط التكلفة",
      currentPrice: "السعر الحالي",
      gainLoss: "الربح/الخسارة",
      action: "إجراء",
      sell: "بيع",
      buy: "شراء",
      addToPortfolio: "إضافة للمحفظة",
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
      confirmReset: "هل أنت متأكد من إعادة تعيين محفظتك؟",
      goal: "الهدف",
      reached: "تم تحقيق الهدف!",
      notReached: "واصل المحاولة",
      startingBalance: "الرصيد الابتدائي",
      targetBalance: "الرصيد المستهدف",
    },
    profile: {
      title: "الملف الشخصي",
      editProfile: "تعديل الملف الشخصي",
      followers: "المتابعون",
      following: "المتابَعون",
      posts: "المنشورات",
      joinedDate: "انضم في",
      bio: "نبذة شخصية",
      noBio: "لا توجد نبذة بعد",
      changePicture: "تغيير الصورة",
      saveChanges: "حفظ التغييرات",
      portfolioPerformance: "أداء المحفظة",
      totalReturn: "العائد الكلي",
      winRate: "نسبة النجاح",
      tradesCount: "عدد الصفقات",
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

  // Apply lang attribute + Thmanyah font class when Arabic is active
  useEffect(() => {
    document.documentElement.lang = language;
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
