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
  // Getting Started
  "welcome": {
    id: "welcome",
    category: "getting-started",
    title: { ar: "مرحباً بك في EyeStocks AI", en: "Welcome to EyeStocks AI" },
    content: {
      ar: "مرحباً بك في أول منصة عربية ذكية لتحليل الأسهم. تم تصميم EyeStocks AI لمساعدتك على اتخاذ قرارات استثمارية مدروسة باستخدام أحدث تقنيات الذكاء الاصطناعي. في هذا الدليل، ستتعرف على كيفية التنقل في الموقع واستخدام الأدوات الأساسية لبدء رحلتك.",
      en: "Welcome to the first intelligent Arabic stock analysis platform. EyeStocks AI is designed to help you make informed investment decisions using the latest AI technologies. In this guide, you'll learn how to navigate the site and use essential tools to start your journey."
    },
    readTime: 3
  },
  "dashboard-guide": {
    id: "dashboard-guide",
    category: "getting-started",
    title: { ar: "شرح لوحة التحكم", en: "Dashboard Overview" },
    content: {
      ar: "لوحة التحكم هي مركز القيادة الخاص بك. يمكنك من خلالها متابعة ملخص السوق، آخر التوقعات من الذكاء الاصطناعي، وأداء محفظتك الافتراضية. كما تظهر لك أهم الأخبار والمشاركات من المجتمع في الوقت الفعلي.",
      en: "The dashboard is your command center. From here, you can monitor market summaries, the latest AI predictions, and your virtual portfolio performance. It also displays top news and community posts in real-time."
    },
    readTime: 4
  },
  "watchlist": {
    id: "watchlist",
    category: "getting-started",
    title: { ar: "إدارة قائمة المراقبة", en: "Managing Your Watchlist" },
    content: {
      ar: "قائمة المراقبة تسمح لك بتتبع الأسهم التي تهتم بها دون الحاجة للبحث عنها في كل مرة. يمكنك إضافة أي سهم للقائمة عبر الضغط على أيقونة النجمة في صفحة تفاصيل السهم. ستظهر هذه الأسهم في لوحة التحكم لتتمكن من مراقبة تحركاتها بسرعة.",
      en: "The watchlist allows you to track stocks you're interested in without searching for them every time. You can add any stock to the list by clicking the star icon on the stock detail page. These stocks will appear on your dashboard for quick monitoring."
    },
    readTime: 2
  },

  // AI Predictions
  "hybrid-ai": {
    id: "hybrid-ai",
    category: "ai-predictions",
    title: { ar: "كيف يعمل الذكاء الاصطناعي الهجين", en: "How Hybrid AI Works" },
    content: {
      ar: "نستخدم نموذجاً هجيناً يجمع بين شبكات LSTM العصبية (المتخصصة في تحليل السلاسل الزمنية) ونماذج XGBoost (المتميزة في تحليل العوامل المتعددة). هذا المزيج يسمح للنظام بفهم الأنماط التاريخية المعقدة مع مراعاة المتغيرات الحالية في السوق لتقديم توقعات أكثر دقة.",
      en: "We use a hybrid model combining LSTM neural networks (specialized in time-series analysis) and XGBoost models (excellent at multi-factor analysis). This combination allows the system to understand complex historical patterns while considering current market variables for more accurate predictions."
    },
    readTime: 6
  },
  "confidence-score": {
    id: "confidence-score",
    category: "ai-predictions",
    title: { ar: "فهم درجة الثقة", en: "Understanding Confidence Score" },
    content: {
      ar: "درجة الثقة هي مؤشر يعكس مدى يقين النموذج في توقعه. يتم حسابها بناءً على جودة البيانات المتوفرة، استقرار السوق الحالي، ومدى توافق المؤشرات المختلفة. درجة فوق 80% تعني يقيناً عالياً، بينما الدرجة تحت 50% تشير إلى تقلبات عالية وعدم وضوح في الاتجاه.",
      en: "The confidence score reflects the model's certainty in its prediction. It's calculated based on available data quality, current market stability, and the alignment of various indicators. A score above 80% indicates high certainty, while a score below 50% suggests high volatility and unclear direction."
    },
    readTime: 5
  },
  "targets-stoploss": {
    id: "targets-stoploss",
    category: "ai-predictions",
    title: { ar: "الأهداف ووقف الخسارة", en: "Price Targets & Stop Loss" },
    content: {
      ar: "لكل توقع، يقترح الذكاء الاصطناعي سعراً مستهدفاً (Target Price) وسعراً لوقف الخسارة (Stop Loss). السعر المستهدف هو المكان الذي يتوقع النموذج وصول السهم إليه، بينما وقف الخسارة هو السعر الذي ينصح عنده بالخروج لحماية رأس مالك في حال تحرك السوق عكس التوقعات.",
      en: "For every prediction, the AI suggests a target price and a stop loss. The target price is where the model expects the stock to reach, while the stop loss is the price where exiting is recommended to protect your capital if the market moves against expectations."
    },
    readTime: 4
  },

  // Simulator
  "simulator-intro": {
    id: "simulator-intro",
    category: "simulator",
    title: { ar: "بداية التداول الافتراضي", en: "Getting Started with Simulator" },
    content: {
      ar: "محاكي التداول يوفر لك بيئة آمنة تماماً لممارسة الاستثمار. تبدأ برصيد افتراضي قدره 100,000 دولار. يمكنك شراء وبيع الأسهم بأسعار السوق الحقيقية وتجربة استراتيجياتك دون المخاطرة بقرش واحد من مالك الحقيقي.",
      en: "The trading simulator provides a completely safe environment to practice investing. You start with a virtual balance of $100,000. You can buy and sell stocks at real market prices and test your strategies without risking a single penny of your real money."
    },
    readTime: 5
  },
  "executing-trades": {
    id: "executing-trades",
    category: "simulator",
    title: { ar: "تنفيذ العمليات", en: "Executing Trades" },
    content: {
      ar: "لشراء سهم في المحاكي، ابحث عن السهم، حدد الكمية، واضغط 'شراء'. سيتم خصم القيمة من رصيدك الافتراضي وإضافة السهم لمحفظتك. يمكنك بيع أسهمك في أي وقت لجني الأرباح أو تقليل الخسائر عبر صفحة المحفظة أو صفحة السهم نفسه.",
      en: "To buy a stock in the simulator, search for the stock, specify the quantity, and click 'Buy'. The value will be deducted from your virtual balance and the stock added to your portfolio. You can sell your shares anytime to realize profits or minimize losses via the portfolio page or the stock's detail page."
    },
    readTime: 3
  },

  // Community
  "community-interaction": {
    id: "community-interaction",
    category: "community",
    title: { ar: "التفاعل مع المتداولين", en: "Interacting with Traders" },
    content: {
      ar: "مجتمع EyeStocks هو المكان الذي يلتقي فيه المستثمرون لتبادل الأفكار. يمكنك كتابة منشورات، مشاركة تحليلاتك، والتعليق على آراء الآخرين. التفاعل يساعدك على رؤية زوايا مختلفة للسوق والاستفادة من خبرات المتداولين الآخرين.",
      en: "The EyeStocks community is where investors meet to exchange ideas. You can write posts, share your analysis, and comment on others' views. Interaction helps you see different market angles and benefit from other traders' experiences."
    },
    readTime: 4
  },
  "badges-system": {
    id: "badges-system",
    category: "community",
    title: { ar: "نظام الأوسمة", en: "Badges System" },
    content: {
      ar: "لدينا نظام أوسمة لتمييز الخبرات: \n- Pro Trader: للمتداولين المحترفين ذوي الأداء العالي.\n- Analyst: للمحللين الذين يقدمون تقارير دقيقة.\n- Quant: للمتخصصين في التحليل الكمي والبيانات.\n- Verified: للحسابات الموثقة رسمياً.",
      en: "We have a badge system to highlight expertise:\n- Pro Trader: For high-performing professional traders.\n- Analyst: For analysts providing accurate reports.\n- Quant: For specialists in quantitative analysis and data.\n- Verified: For officially verified accounts."
    },
    readTime: 3
  },

  // Market Analysis
  "technical-indicators": {
    id: "technical-indicators",
    category: "market-analysis",
    title: { ar: "المؤشرات الفنية", en: "Technical Indicators" },
    content: {
      ar: "نوفر مجموعة من المؤشرات الفنية لمساعدتك في التحليل: \n- RSI: يقيس قوة الزخم.\n- MACD: يوضح اتجاه وقوة الحركة.\n- Moving Averages: تساعد في تحديد الاتجاه العام للسعر.\nاستخدام هذه الأدوات مع توقعات الذكاء الاصطناعي يزيد من فرص نجاح صفقاتك.",
      en: "We provide a set of technical indicators to help your analysis:\n- RSI: Measures momentum strength.\n- MACD: Shows trend direction and strength.\n- Moving Averages: Help identify the general price trend.\nUsing these tools alongside AI predictions increases your chances of successful trades."
    },
    readTime: 7
  },
  "fundamental-metrics": {
    id: "fundamental-metrics",
    category: "market-analysis",
    title: { ar: "المقاييس الأساسية", en: "Fundamental Metrics" },
    content: {
      ar: "لفهم قيمة الشركة، يجب متابعة المقاييس الأساسية مثل مكرر الأرباح (P/E Ratio)، ربحية السهم (EPS)، والقيمة السوقية. هذه البيانات تتوفر في صفحة كل سهم لمساعدتك في التقييم المالي الصحيح قبل الاستثمار.",
      en: "To understand a company's value, you should track fundamental metrics like P/E Ratio, Earnings Per Share (EPS), and Market Cap. This data is available on each stock's page to help you with proper financial evaluation before investing."
    },
    readTime: 6
  },

  // Model Evaluation
  "ai-signals": {
    id: "ai-signals",
    category: "market-analysis",
    title: { ar: "فهم إشارات الذكاء الاصطناعي", en: "Understanding AI Signals" },
    content: {
      ar: "يقدم EyeStocks AI إشارات مبنية على تحليلات عميقة. إليك كيفية قراءتها:\n\n- **السعر المتوقع (Tomorrow's Price):** تقدير المودل لسعر السهم في يوم التداول التالي.\n- **نسبة الثقة (Confidence):** مدى تأكد المودل من التوقع بناءً على البيانات التاريخية.\n- **الاتجاه (Direction):** 'Bullish' يعني توقع صعود، و 'Bearish' يعني توقع هبوط.\n\nيُنصح دائماً بدمج توقعات الذكاء الاصطناعي مع تحليلك الشخصي والأخبار لضمان أفضل قرار استثماري.",
      en: "EyeStocks AI provides signals based on deep analysis. Here's how to read them:\n\n- **Tomorrow's Price:** The model's estimate for the stock price on the next trading day.\n- **Confidence:** How certain the model is about the prediction based on historical data.\n- **Direction:** 'Bullish' means an upward trend is expected, 'Bearish' means a downward trend.\n\nIt is always recommended to combine AI predictions with your personal analysis and news to ensure the best investment decision."
    },
    readTime: 5
  },
  "directional-accuracy": {
    id: "directional-accuracy",
    category: "ai-predictions",
    title: { ar: "دقة الاتجاه (Directional Accuracy)", en: "Directional Accuracy" },
    content: {
      ar: "هذا المقياس يحدد مدى نجاح النموذج في توقع اتجاه السعر (صعوداً أو هبوطاً). إذا كان السهم قد صعد وتوقع النموذج صعوداً، فهذا يعتبر توقعاً صحيحاً. دقة الاتجاه العالية تعني أن النموذج موثوق جداً في تحديد المسار المستقبلي للسهم.",
      en: "This metric determines how successful the model is at predicting price direction (up or down). If a stock rose and the model predicted an upward move, it's considered a correct prediction. High directional accuracy means the model is very reliable in identifying the stock's future path."
    },
    readTime: 5
  },
  "model-rmse": {
    id: "model-rmse",
    category: "ai-predictions",
    title: { ar: "متوسط الخطأ التربيعي (RMSE)", en: "Root Mean Square Error (RMSE)" },
    content: {
      ar: "يقيس هذا المقياس الفرق بين السعر المتوقع والسعر الحقيقي. كلما انخفضت قيمة RMSE، كان النموذج أكثر دقة في تحديد السعر الفعلي. نستخدم هذا المقياس لضبط خوارزمياتنا وتقليل الفجوة بين التوقعات والواقع.",
      en: "This metric measures the difference between the predicted price and the actual price. The lower the RMSE value, the more accurate the model is at determining the actual price. We use this metric to fine-tune our algorithms and minimize the gap between predictions and reality."
    },
    readTime: 6
  },

  // Platform Pages
  "explore-page": {
    id: "explore-page",
    category: "getting-started",
    title: { ar: "صفحة الاستكشاف", en: "Explore Page" },
    content: {
      ar: "صفحة الاستكشاف هي بوابتك للسوق. يمكنك البحث عن أي سهم، تصفية الأسهم حسب القطاع، أو رؤية الأسهم الأكثر تداولاً. كل بطاقة سهم تعرض لك لمحة سريعة عن السعر وتوقع الذكاء الاصطناعي.",
      en: "The Explore page is your gateway to the market. You can search for any stock, filter stocks by sector, or see the most traded stocks. Each stock card shows you a quick snapshot of the price and AI prediction."
    },
    readTime: 4
  },
  "portfolio-page": {
    id: "portfolio-page",
    category: "getting-started",
    title: { ar: "صفحة المحفظة", en: "Portfolio Page" },
    content: {
      ar: "في صفحة المحفظة، يمكنك رؤية ملخص كامل لاستثماراتك الافتراضية. تعرض لك الصفحة إجمالي الرصيد، الربح أو الخسارة المحققة، وتوزيع أصولك. كما يمكنك تتبع تاريخ جميع صفقاتك السابقة.",
      en: "On the Portfolio page, you can see a full summary of your virtual investments. The page displays your total balance, realized profit or loss, and asset allocation. You can also track the history of all your past trades."
    },
    readTime: 5
  },
  "profile-page": {
    id: "profile-page",
    category: "getting-started",
    title: { ar: "الملف الشخصي", en: "User Profile" },
    content: {
      ar: "ملفك الشخصي يعرض هويتك في المجتمع. يمكنك إضافة نبذة شخصية، متابعة إحصائياتك (عدد المنشورات والمتابعين)، ورؤية الأوسمة التي حصلت عليها. كما يمكنك من هنا تعديل إعدادات حسابك وصورتك الشخصية.\n\n### أداء المحاكاة\nيتم عرض أداء تداولاتك في المحاكي مباشرة في ملفك الشخصي ليتمكن الجميع من رؤية مهاراتك في التداول. يتضمن ذلك نسبة النجاح، إجمالي الأرباح، وأفضل الصفقات التي قمت بها.",
      en: "Your profile showcases your identity in the community. You can add a bio, track your stats (posts and followers count), and see the badges you've earned. You can also edit your account settings and profile picture from here.\n\n### Simulation Performance\nYour trading performance in the simulator is displayed directly on your profile so everyone can see your trading skills. This includes win rate, total return, and your best trades."
    },
    readTime: 4
  },
  "platform-guide": {
    id: "platform-guide",
    category: "getting-started",
    title: { ar: "دليل الاستخدام الشامل", en: "Complete Platform Guide" },
    content: {
      ar: "يركز EyeStocks AI على تقديم تجربة استثمارية متكاملة عبر ثلاثة أقسام رئيسية:\n\n1. **الاستكشاف (Explore):** محرك البحث الخاص بك للسوق، حيث تجد الأسعار الفورية وتوقعات الذكاء الاصطناعي.\n2. **المحفظة (Portfolio):** حيث تتابع استثماراتك الحقيقية (للمتابعة فقط) وتراقب نمو أصولك.\n3. **المحاكي (Simulator):** بيئة آمنة للتداول الافتراضي برصيد 2,000 دولار لتجربة استراتيجياتك.\n\nيتم ربط جميع هذه الأقسام بملفك الشخصي لتكوين صورة كاملة عن أدائك وتفاعلك مع المجتمع.",
      en: "EyeStocks AI focuses on providing a complete investment experience through three main sections:\n\n1. **Explore:** Your market search engine, where you find real-time prices and AI predictions.\n2. **Portfolio:** Where you track your real investments (for tracking only) and monitor asset growth.\n3. **Simulator:** A safe virtual trading environment with a $2,000 balance to test your strategies.\n\nAll these sections are linked to your profile to form a complete picture of your performance and community interaction."
    },
    readTime: 6
  },

  // Account
  "security-best-practices": {
    id: "security-best-practices",
    category: "account",
    title: { ar: "أمان الحساب", en: "Account Security" },
    content: {
      ar: "حماية بياناتك هي أولويتنا. نوصي باستخدام كلمة مرور قوية وتفعيل التحقق بخطوتين. لا تشارك بيانات دخولك مع أي شخص، وتأكد دائماً من تسجيل الخروج عند استخدام أجهزة عامة.",
      en: "Protecting your data is our priority. We recommend using a strong password and enabling two-factor authentication. Never share your login credentials and always ensure you log out when using public devices."
    },
    readTime: 3
  },

  // About
  "our-vision": {
    id: "our-vision",
    category: "about",
    title: { ar: "رؤيتنا", en: "Our Vision" },
    content: {
      ar: "رؤيتنا هي تمكين المستثمر العربي من الوصول إلى أدوات تحليل احترافية كانت محتكرة سابقاً على المؤسسات الكبيرة. نحن نؤمن بأن دمج الذكاء الاصطناعي مع واجهة مستخدم سهلة سيغير طريقة تداول الأسهم في المنطقة العربية.",
      en: "Our vision is to empower Arabic investors by providing access to professional analysis tools previously exclusive to large institutions. We believe that integrating AI with a user-friendly interface will transform stock trading in the Arab region."
    },
    readTime: 4
  }
};

export const helpCategories: Record<string, HelpCategory> = {
  "getting-started": {
    id: "getting-started",
    title: { ar: "البداية", en: "Getting Started" },
    desc: { ar: "تعلم الأساسيات وكيفية استخدام لوحة التحكم.", en: "Learn the basics and how to use the dashboard." },
    icon: "Rocket",
    articles: ["welcome", "platform-guide", "dashboard-guide", "watchlist", "explore-page", "portfolio-page", "profile-page"]
  },
  "ai-predictions": {
    id: "ai-predictions",
    title: { ar: "توقعات الذكاء الاصطناعي", en: "AI Predictions" },
    desc: { ar: "افهم كيف يحلل الذكاء الاصطناعي الأسهم.", en: "Understand how AI analyzes stocks." },
    icon: "Brain",
    articles: ["hybrid-ai", "confidence-score", "targets-stoploss", "ai-signals", "directional-accuracy", "model-rmse"]
  },
  "simulator": {
    id: "simulator",
    title: { ar: "محاكي التداول", en: "Trading Simulator" },
    desc: { ar: "تدرب على التداول بأموال افتراضية.", en: "Practice trading with virtual money." },
    icon: "Gamepad2",
    articles: ["simulator-intro", "executing-trades"]
  },
  "community": {
    id: "community",
    title: { ar: "المجتمع", en: "Community" },
    desc: { ar: "تفاعل مع المتداولين وشارك خبراتك.", en: "Interact with traders and share your expertise." },
    icon: "Users",
    articles: ["community-interaction", "badges-system"]
  },
  "market-analysis": {
    id: "market-analysis",
    title: { ar: "تحليل السوق", en: "Market Analysis" },
    desc: { ar: "تعلم عن المؤشرات الفنية والأساسية.", en: "Learn about technical and fundamental indicators." },
    icon: "BarChart2",
    articles: ["technical-indicators", "fundamental-metrics"]
  },
  "account": {
    id: "account",
    title: { ar: "الحساب والأمان", en: "Account & Security" },
    desc: { ar: "إدارة إعدادات حسابك وحمايته.", en: "Manage your account settings and protection." },
    icon: "Shield",
    articles: ["security-best-practices"]
  },
  "about": {
    id: "about",
    title: { ar: "عن المنصة", en: "About Platform" },
    desc: { ar: "تعرف على رؤيتنا وما يميزنا.", en: "Learn about our vision and uniqueness." },
    icon: "Star",
    articles: ["our-vision"]
  }
};
