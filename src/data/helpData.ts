export interface HelpArticle {
  id: string;
  category: string;
  title: { ar: string; en: string };
  content: { ar: string; en: string };
  readTime: number;
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
    },
    readTime: 4
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
    },
    readTime: 5
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
    },
    readTime: 3
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
    },
    readTime: 2
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
    },
    readTime: 3
  },
  "buying": {
    id: "buying",
    category: "transactions",
    title: {
      ar: "كيفية شراء الأسهم",
      en: "How to Buy Stocks"
    },
    content: {
      ar: "تتيح لك منصة EyeStocks AI شراء الأسهم بسهولة من خلال النقر على زر \"شراء\" داخل صفحة تفاصيل السهم. قم بتحديد عدد الأسهم، ثم تأكيد الطلب. ستظهر لك تفاصيل الصفقة وتحديث رصيدك الفوري.",
      en: "EyeStocks AI allows you to purchase stocks easily by clicking the \"Buy\" button on the stock detail page. Specify the number of shares, then confirm the order. Transaction details and your updated balance will be displayed instantly."
    },
    readTime: 3
  },
  "selling": {
    id: "selling",
    category: "transactions",
    title: {
      ar: "كيفية بيع الأسهم",
      en: "How to Sell Stocks"
    },
    content: {
      ar: "لبيع أسهمك، انتقل إلى محفظتك، اختر السهم الذي ترغب ببيعه، واضغط زر \"بيع\". حدد عدد الأسهم وسعر السوق، ثم أكد الصفقة لتتم معالجتها فورًا.",
      en: "To sell your holdings, go to your portfolio, select the desired stock, and click the \"Sell\" button. Choose the quantity and market price, then confirm to execute the trade instantly."
    },
    readTime: 3
  },
  "jobs": {
    id: "jobs",
    category: "jobs",
    title: {
      ar: "وظائف في EyeStocks AI",
      en: "Jobs at EyeStocks AI"
    },
    content: {
      ar: "نحن نبحث عن مهندسين موهوبين، علماء بيانات، ومصممين لتطوير المنصة. يمكنك زيارة صفحة \"الوظائف\" على موقعنا لتقديم طلبك. نحن نقدم بيئة عمل مرنة ومكافآت تنافسية.",
      en: "We are seeking talented engineers, data scientists, and designers to enhance the platform. Visit our \"Jobs\" page to apply. We offer a flexible work environment and competitive compensation."
    },
    readTime: 2
  },
  "trading-basics": {
    id: "trading-basics",
    category: "trading",
    title: {
      ar: "أساسيات التداول للمبتدئين",
      en: "Trading Basics for Beginners"
    },
    content: {
      ar: "التداول هو عملية شراء وبيع الأوراق المالية لتحقيق ربح من تقلبات الأسعار. الفرق الجوهري بين الاستثمار والتداول هو الفترة الزمنية؛ فالمستثمر يحتفظ بالسهم لسنوات، بينما المتداول يركز على الحركات القصيرة. من المهم فهم أن التداول ينطوي على مخاطر، لذا يجب دائمًا استخدام أوامر وقف الخسارة وإدارة رأس المال بحذر.",
      en: "Trading is the process of buying and selling securities to profit from price fluctuations. The key difference between investing and trading is the time horizon; investors hold stocks for years, while traders focus on short-term movements. It's crucial to understand that trading involves risk, so always use stop-loss orders and manage your capital carefully."
    },
    readTime: 6
  },
  "metrics": {
    id: "metrics",
    category: "metrics",
    title: {
      ar: "دليل المقاييس المالية",
      en: "Financial Metrics Guide"
    },
    content: {
      ar: "المقاييس المالية تساعدك في تقييم أداء الشركة وقيمتها:\n1. P/E Ratio: يقارن سعر السهم بأرباح الشركة. السهم الرخيص قد يكون فرصة.\n2. EPS: نصيب السهم من الأرباح، وهو مؤشر على ربحية الشركة.\n3. Dividend Yield: العائد الذي توزعه الشركة كأرباح للمساهمين.\n4. Market Cap: القيمة السوقية الإجمالية للشركة (عدد الأسهم × سعر السهم).",
      en: "Financial metrics help you evaluate a company's performance and value:\n1. P/E Ratio: Compares the stock price to company earnings. A lower ratio might indicate a bargain.\n2. EPS (Earnings Per Share): Shows how much profit is allocated to each share.\n3. Dividend Yield: The percentage of the stock price paid out as dividends annually.\n4. Market Cap: The total market value of the company (shares outstanding × share price)."
    },
    readTime: 8
  },
  "uniqueness": {
    id: "uniqueness",
    category: "about",
    title: {
      ar: "لماذا تختار EyeStocks AI؟",
      en: "Why Choose EyeStocks AI?"
    },
    content: {
      ar: "تتميز منصتنا بكونها أول منصة عربية تدمج الذكاء الاصطناعي المتقدم مع واجهة مستخدم بسيطة. نحن لا نقدم بيانات فقط، بل نقدم \"درجة ثقة\" لكل توقع، مما يقلل من الحيرة عند اتخاذ القرار. كما نوفر بيئة تعليمية متكاملة ومحاكي تداول يربطك بالواقع دون المخاطرة بمالك الحقيقي.",
      en: "Our platform stands out as the first Arabic platform to integrate advanced AI with a simple user interface. We don't just provide data; we provide a 'Confidence Score' for every prediction, reducing uncertainty in decision-making. We also offer a complete educational environment and a trading simulator that connects you to reality without risking real money."
    },
    readTime: 4
  },
  "technical-indicators": {
    id: "technical-indicators",
    category: "metrics",
    title: {
      ar: "المؤشرات الفنية وكيفية استخدامها",
      en: "Technical Indicators and How to Use Them"
    },
    content: {
      ar: "المؤشرات الفنية هي أدوات حسابية تعتمد على السعر والحجم لتوقع الاتجاهات:\n1. RSI (مؤشر القوة النسبية): يخبرك إذا كان السهم مشبعاً بالشراء (فوق 70) أو مشبعاً بالبيع (تحت 30).\n2. Moving Averages: تساعد في تنعيم حركة السعر لتحديد الاتجاه العام (صاعد أم هابط).\n3. MACD: يقيس الزخم وقوة الاتجاه من خلال تقاطع متوسطين متحركين.\nاستخدام هذه المؤشرات يساعدك في تحديد نقاط الدخول والخروج بدقة أكبر.",
      en: "Technical indicators are mathematical tools based on price and volume to predict trends:\n1. RSI (Relative Strength Index): Tells you if a stock is overbought (above 70) or oversold (below 30).\n2. Moving Averages: Help smooth out price action to identify the overall trend (upward or downward).\n3. MACD: Measures momentum and trend strength through the crossover of two moving averages.\nUsing these indicators helps you identify entry and exit points with greater precision."
    },
    readTime: 10
  },
  "dashboard-guide": {
    id: "dashboard-guide",
    category: "getting-started",
    title: {
      ar: "دليل لوحة التحكم",
      en: "Dashboard Guide"
    },
    content: {
      ar: "لوحة التحكم هي مركز القيادة الخاص بك. هنا يمكنك رؤية ملخص سريع لأداء محفظتك، قائمة المراقبة، وأهم التوقعات التي يقدمها الذكاء الاصطناعي. يمكنك تخصيص اللوحة لتظهر لك الأسهم التي تهتم بها فقط.",
      en: "The dashboard is your command center. Here you can see a quick summary of your portfolio performance, your watchlist, and the top AI predictions. You can customize the dashboard to show only the stocks you are interested in."
    },
    readTime: 4
  },
  "portfolio-guide": {
    id: "portfolio-guide",
    category: "simulator",
    title: {
      ar: "إدارة محفظتك الاستثمارية",
      en: "Managing Your Investment Portfolio"
    },
    content: {
      ar: "تتيح لك صفحة المحفظة تتبع جميع استثماراتك في مكان واحد. يمكنك رؤية الأرباح والخسائر الإجمالية، توزيع الأصول، وتاريخ العمليات. يساعدك هذا في فهم أدائك العام واتخاذ قرارات مدروسة حول متى تزيد استثماراتك أو تقللها.",
      en: "The portfolio page allows you to track all your investments in one place. You can see total gains and losses, asset allocation, and transaction history. This helps you understand your overall performance and make informed decisions about when to increase or decrease your holdings."
    },
    readTime: 4
  },
};

export const helpCategories: Record<string, HelpCategory> = {
  "getting-started": {
    id: "getting-started",
    title: { ar: "البداية", en: "Getting Started" },
    desc: { ar: "تعرف على الأساسيات وقم بإعداد حسابك بسرعة.", en: "Learn the basics and set up your account quickly." },
    icon: "BookOpen",
    articles: ["watchlist", "dashboard-guide"]
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
    articles: ["simulator", "portfolio-guide"]
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
  },
  // New Categories
  "transactions": {
    id: "transactions",
    title: { ar: "عمليات الشراء والبيع", en: "Buying & Selling" },
    desc: { ar: "تعلم كيف تشتري وتبيع الأسهم بسهولة.", en: "Learn how to buy and sell stocks easily." },
    icon: "CreditCard",
    articles: ["buying", "selling"]
  },
  "jobs": {
    id: "jobs",
    title: { ar: "الوظائف", en: "Jobs" },
    desc: { ar: "فرص عمل في فريق EyeStocks AI.", en: "Career opportunities at EyeStocks AI." },
    icon: "Users",
    articles: ["jobs"]
  },
  "trading": {
    id: "trading",
    title: { ar: "أساسيات التداول", en: "Trading Basics" },
    desc: { ar: "مبادئ التداول للمبتدئين.", en: "Fundamentals of trading for beginners." },
    icon: "Zap",
    articles: ["trading-basics"]
  },
  "metrics": {
    id: "metrics",
    title: { ar: "المقاييس المالية", en: "Financial Metrics" },
    desc: { ar: "فهم الأدوات التحليلية للمتداول.", en: "Understanding analytical tools for traders." },
    icon: "Settings",
    articles: ["metrics", "technical-indicators"]
  },
  "about": {
    id: "about",
    title: { ar: "ما يميزنا", en: "Our Advantages" },
    desc: { ar: "اكتشف ما يجعل EyeStocks AI فريدة.", en: "Discover what makes EyeStocks AI unique." },
    icon: "Shield",
    articles: ["uniqueness"]
  },
};
