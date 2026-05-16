export interface HelpArticle {
  id: string;
  category: string;
  title: { ar: string; en: string };
  content: { ar: string; en: string };
}

export interface HelpCategory {
  id: string;
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
  icon: string;
  articles: string[];
}

export const helpArticles: Record<string, HelpArticle> = {
  "predictions": {
    id: "predictions",
    category: "features",
    title: {
      ar: "كيف يقوم EyeStocks AI بتوقعات الأسهم",
      en: "How EyeStocks AI Predicts Stocks"
    },
    content: {
      ar: "يستخدم EyeStocks AI محرك ذكاء اصطناعي هجين يجمع بين شبكات LSTM العصبية ونماذج XGBoost. يقوم النظام بتحليل البيانات التاريخية للأسعار، المؤشرات الفنية، والمؤشرات الاقتصادية الكلية للتنبؤ باتجاه السعر في المستقبل.",
      en: "EyeStocks AI uses a hybrid AI engine combining LSTM neural networks and XGBoost models. The system analyzes historical price data, technical indicators, and macroeconomic factors to predict future price trends."
    }
  },
  "simulator": {
    id: "simulator",
    category: "simulator",
    title: {
      ar: "كيف تستخدم محاكي التداول",
      en: "How to Use the Trading Simulator"
    },
    content: {
      ar: "محاكي التداول يسمح لك بممارسة التداول بأموال افتراضية. يمكنك شراء وبيع الأسهم بأسعار السوق الحقيقية، تتبع أداء محفظتك، واختبار استراتيجيات التداول الخاصة بك دون أي مخاطر مالية.",
      en: "The trading simulator allows you to practice trading with virtual money. You can buy and sell stocks at real market prices, track your portfolio performance, and test your trading strategies without any financial risk."
    }
  },
  "confidence": {
    id: "confidence",
    category: "features",
    title: {
      ar: "فهم درجة الثقة",
      en: "Understanding the Confidence Score"
    },
    content: {
      ar: "درجة الثقة هي مقياس يعبر عن مدى يقين النموذج في التوقع الذي يقدمه. الدرجة العالية تعني أن البيانات التاريخية والاتجاهات الحالية تدعم التوقع بشكل قوي، بينما الدرجة المنخفضة تشير إلى وجود تقلبات عالية أو عدم وضوح في الاتجاه.",
      en: "The confidence score is a metric that expresses the model's certainty in its prediction. A high score means historical data and current trends strongly support the prediction, while a low score indicates high volatility or unclear direction."
    }
  },
  "watchlist": {
    id: "watchlist",
    category: "getting-started",
    title: {
      ar: "كيف تدير قائمة المراقبة الخاصة بك",
      en: "How to Manage Your Watchlist"
    },
    content: {
      ar: "يمكنك إضافة أي سهم إلى قائمة المراقبة بالضغط على أيقونة النجمة أو زر 'إضافة للمفضلة'. ستظهر لك هذه الأسهم في لوحة التحكم الخاصة بك لتتمكن من مراقبة تحركاتها بسرعة.",
      en: "You can add any stock to your watchlist by clicking the star icon or the 'Add to Favorites' button. These stocks will appear on your dashboard so you can monitor their movements quickly."
    }
  },
  "security": {
    id: "security",
    category: "account",
    title: {
      ar: "أفضل ممارسات أمان الحساب",
      en: "Account Security Best Practices"
    },
    content: {
      ar: "لحماية حسابك، نوصي باستخدام كلمة مرور قوية وفريدة، تفعيل المصادقة الثنائية إن أمكن، وعدم مشاركة بيانات الدخول الخاصة بك مع أي شخص. كما يجب عليك مراقبة الجلسات النشطة باستمرار.",
      en: "To protect your account, we recommend using a strong and unique password, enabling two-factor authentication if possible, and not sharing your login credentials with anyone. You should also constantly monitor active sessions."
    }
  }
};

export const helpCategories: Record<string, HelpCategory> = {
  "getting-started": {
    id: "getting-started",
    title: { ar: "البداية", en: "Getting Started" },
    desc: { ar: "تعرف على الأساسيات وقم بإعداد حسابك بسرعة.", en: "Learn the basics and set up your account quickly." },
    icon: "BookOpen",
    articles: ["watchlist"]
  },
  "features": {
    id: "features",
    title: { ar: "المميزات والأدوات", en: "Features & Tools" },
    desc: { ar: "افهم الأدوات القوية وكيفية عملها.", en: "Understand the powerful tools and how they work." },
    icon: "Zap",
    articles: ["predictions", "confidence"]
  },
  "simulator": {
    id: "simulator",
    title: { ar: "المحاكي", en: "Simulator" },
    desc: { ar: "تعرف على كيفية ممارسة التداول باستخدام المحاكي.", en: "Learn how to practice trading using the simulator." },
    icon: "Settings",
    articles: ["simulator"]
  },
  "account": {
    id: "account",
    title: { ar: "الحساب والأمان", en: "Account & Security" },
    desc: { ar: "إدارة حسابك والحفاظ عليه آمنًا.", en: "Manage your account and keep it secure." },
    icon: "Shield",
    articles: ["security"]
  },
  "billing": {
    id: "billing",
    title: { ar: "الفواتير والاشتراك", en: "Billing & Subscription" },
    desc: { ar: "إدارة خطتك والمدفوعات والاشتراكات.", en: "Manage your plan, payments, and subscriptions." },
    icon: "CreditCard",
    articles: []
  }
};
