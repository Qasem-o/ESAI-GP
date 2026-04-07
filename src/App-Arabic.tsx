import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import { TrendingUp, Brain, Target, BarChart3, Zap, Shield, Menu, User, X } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { ArabicPredictionDashboard } from "./components/PredictionDashboard-Arabic";

type Page = "home" | "dashboard" | "portfolio" | "stocks" | "community" | "news" | "learn" | "simulator" | "profile";

export default function ArabicApp() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToDashboard = () => {
    setCurrentPage("dashboard");
    setMobileMenuOpen(false);
  };
  const goToPortfolio = () => {
    setCurrentPage("portfolio");
    setMobileMenuOpen(false);
  };
  const goToStocks = () => {
    setCurrentPage("stocks");
    setMobileMenuOpen(false);
  };
  const goToCommunity = () => {
    setCurrentPage("community");
    setMobileMenuOpen(false);
  };
  const goToNews = () => {
    setCurrentPage("news");
    setMobileMenuOpen(false);
  };
  const goToLearn = () => {
    setCurrentPage("learn");
    setMobileMenuOpen(false);
  };
  const goToSimulator = () => {
    setCurrentPage("simulator");
    setMobileMenuOpen(false);
  };
  const goToProfile = () => {
    setCurrentPage("profile");
    setMobileMenuOpen(false);
  };
  const goToHome = () => {
    setCurrentPage("home");
    setMobileMenuOpen(false);
  };

  const navigationProps = {
    currentPage,
    onGoToHome: goToHome,
    onGoToStocks: goToStocks,
    onGoToPortfolio: goToPortfolio,
    onGoToCommunity: goToCommunity,
    onGoToNews: goToNews,
    onGoToLearn: goToLearn,
    onGoToSimulator: goToSimulator,
    onGoToProfile: goToProfile
  };

  if (currentPage === "dashboard") {
    return <ArabicPredictionDashboard {...navigationProps} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 font-arabic" dir="rtl">
      {/* Header */}
      <header className="border-b bg-gradient-to-l from-emerald-900/5 via-blue-900/5 to-purple-900/5 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                عين الأسهم الذكية
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <button onClick={goToStocks} className="text-muted-foreground hover:text-emerald-600 transition-colors font-medium">الأسهم</button>
              <button onClick={goToPortfolio} className="text-muted-foreground hover:text-emerald-600 transition-colors font-medium">المحفظة</button>
              <button onClick={goToCommunity} className="text-muted-foreground hover:text-emerald-600 transition-colors font-medium">المجتمع</button>
              <button onClick={goToNews} className="text-muted-foreground hover:text-emerald-600 transition-colors font-medium">الأخبار</button>
              <button onClick={goToLearn} className="text-muted-foreground hover:text-emerald-600 transition-colors font-medium">تعلم</button>
              <button onClick={goToSimulator} className="text-muted-foreground hover:text-emerald-600 transition-colors font-medium">المحاكي</button>
            </nav>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" onClick={goToProfile} size="icon" className="hidden md:flex hover:bg-emerald-50">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="hidden md:inline-flex hover:bg-emerald-50">تسجيل الدخول</Button>
              <Button onClick={goToDashboard} className="hidden sm:inline-flex bg-gradient-to-l from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
                ابدأ الآن
              </Button>
              
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]" dir="rtl">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-3 space-x-reverse text-right">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span>عين الأسهم الذكية</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col space-y-4 mt-8">
                    <Button variant="ghost" onClick={goToDashboard} className="justify-start h-12 text-right">
                      <BarChart3 className="w-5 h-5 ml-3" />
                      ابدأ الآن
                    </Button>
                    
                    <div className="border-t pt-4 space-y-2">
                      <Button variant="ghost" onClick={goToStocks} className="w-full justify-start h-12">
                        <TrendingUp className="w-5 h-5 ml-3" />
                        الأسهم
                      </Button>
                      <Button variant="ghost" onClick={goToPortfolio} className="w-full justify-start h-12">
                        <Target className="w-5 h-5 ml-3" />
                        المحفظة
                      </Button>
                      <Button variant="ghost" onClick={goToCommunity} className="w-full justify-start h-12">
                        <User className="w-5 h-5 ml-3" />
                        المجتمع
                      </Button>
                      <Button variant="ghost" onClick={goToNews} className="w-full justify-start h-12">
                        <BarChart3 className="w-5 h-5 ml-3" />
                        الأخبار
                      </Button>
                      <Button variant="ghost" onClick={goToLearn} className="w-full justify-start h-12">
                        <Brain className="w-5 h-5 ml-3" />
                        تعلم
                      </Button>
                      <Button variant="ghost" onClick={goToSimulator} className="w-full justify-start h-12">
                        <Zap className="w-5 h-5 ml-3" />
                        المحاكي
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <Button variant="ghost" onClick={goToProfile} className="w-full justify-start h-12">
                        <User className="w-5 h-5 ml-3" />
                        الملف الشخصي
                      </Button>
                      <Button variant="outline" className="w-full h-12">
                        تسجيل الدخول
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-right">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit mx-auto lg:mx-0 lg:mr-auto bg-gradient-to-l from-emerald-100 to-blue-100 text-emerald-700 border-emerald-200">
                <Zap className="w-4 h-4 ml-2" />
                توقعات مدعومة بالذكاء الاصطناعي
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                توقع أسعار الأسهم بدقة 
                <span className="bg-gradient-to-l from-emerald-600 to-blue-600 bg-clip-text text-transparent"> الذكاء الاصطناعي</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto lg:mx-0 lg:mr-auto leading-relaxed">
                استخدم قوة التعلم الآلي المتقدم للتنبؤ بحركات السوق واتخاذ قرارات استثمارية مدروسة ومربحة.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="px-8 w-full sm:w-auto bg-gradient-to-l from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg" 
                onClick={goToDashboard}
              >
                ابدأ التوقع الآن
                <TrendingUp className="w-4 h-4 mr-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 w-full sm:w-auto border-emerald-200 hover:bg-emerald-50">
                شاهد العرض التوضيحي
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                <span>دقة 94% في التوقعات</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <span>تحليل فوري ومباشر</span>
              </div>
            </div>
          </div>
          
          <div className="relative mt-8 lg:mt-0">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-white/80 to-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-2xl mx-auto max-w-sm lg:max-w-none">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-emerald-700">توقع سهم أبل AAPL</h3>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">مباشر</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2 space-x-reverse">
                    <span className="text-xl sm:text-2xl font-bold text-right">185.42$</span>
                    <span className="text-emerald-500 text-sm font-medium">+2.4%</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground text-right">التوقع للساعة القادمة: 187.21$</p>
                </div>
                
                {/* Mock Chart */}
                <div className="h-24 sm:h-32 bg-gradient-to-l from-emerald-500/10 to-blue-500/10 rounded-lg flex items-end justify-center p-2 sm:p-4 border border-emerald-100">
                  <div className="flex items-end space-x-1 h-full w-full">
                    {[20, 25, 30, 35, 45, 40, 50, 48, 55, 60, 58, 65].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-gradient-to-t from-emerald-500/60 to-blue-500/60 flex-1 max-w-[6px] rounded-t-sm transition-all duration-300 hover:from-emerald-600 hover:to-blue-600 shadow-sm"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">مستوى الثقة</span>
                  <span className="font-bold text-emerald-600">%92</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gradient-to-bl from-emerald-50/50 to-blue-50/50 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">لماذا تختار عين الأسهم الذكية؟</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
              خوارزميات الذكاء الاصطناعي المتقدمة تحلل آلاف النقاط البيانية لتقديم توقعات دقيقة للسوق.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 px-0 pt-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right">نماذج ذكاء اصطناعي متقدمة</CardTitle>
                <CardDescription className="text-sm sm:text-base text-right leading-relaxed">
                  مدعوم بشبكات عصبية متطورة مدربة على عقود من بيانات السوق المالية
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 px-0 pt-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right">دقة عالية</CardTitle>
                <CardDescription className="text-sm sm:text-base text-right leading-relaxed">
                  حقق دقة توقع تصل إلى 94% مع خوارزمياتنا الخاصة والمملوكة
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 px-0 pt-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right">تحليل فوري ومباشر</CardTitle>
                <CardDescription className="text-sm sm:text-base text-right leading-relaxed">
                  احصل على توقعات فورية مبنية على بيانات السوق المباشرة وتحليل الأخبار
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 px-0 pt-0">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500/10 to-violet-600/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Zap className="w-6 h-6 text-violet-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right">سرعة البرق</CardTitle>
                <CardDescription className="text-sm sm:text-base text-right leading-relaxed">
                  تلقى التوقعات في أجزاء من الثانية، مثالي للتداول اليومي والقرارات السريعة
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 px-0 pt-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right">إدارة المخاطر</CardTitle>
                <CardDescription className="text-sm sm:text-base text-right leading-relaxed">
                  أدوات تقييم المخاطر المدمجة لمساعدتك في اتخاذ خيارات استثمارية أكثر أماناً
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-white to-rose-50/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 px-0 pt-0">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500/10 to-rose-600/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <TrendingUp className="w-6 h-6 text-rose-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right">دعم أسواق متعددة</CardTitle>
                <CardDescription className="text-sm sm:text-base text-right leading-relaxed">
                  توقع الأسعار عبر أسواق الأسهم والعملات المشفرة والفوركس والسلع
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-bl from-emerald-900/5 to-blue-900/5">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">هل أنت مستعد لتحويل تداولك؟</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4 leading-relaxed">
              انضم إلى آلاف المتداولين الذين يستخدمون بالفعل عين الأسهم الذكية لاتخاذ قرارات استثمارية أذكى وأكثر ربحية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 w-full sm:w-auto bg-gradient-to-l from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg" 
                onClick={goToDashboard}
              >
                ابدأ التجربة المجانية
              </Button>
              <Button variant="outline" size="lg" className="px-8 w-full sm:w-auto border-emerald-200 hover:bg-emerald-50">
                احجز عرض توضيحي
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-bl from-slate-50 to-emerald-50/30 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-l from-emerald-600 to-blue-600 bg-clip-text text-transparent">عين الأسهم الذكية</span>
              </div>
              <p className="text-sm text-muted-foreground text-right leading-relaxed">
                تمكين المتداولين بتوقعات السوق المدعومة بالذكاء الاصطناعي.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm sm:text-base text-right">المنتج</h4>
              <div className="space-y-2 text-sm text-muted-foreground text-right">
                <a href="#" className="block hover:text-emerald-600 transition-colors">الميزات</a>
                <a href="#" className="block hover:text-emerald-600 transition-colors">الأسعار</a>
                <a href="#" className="block hover:text-emerald-600 transition-colors">واجهة البرمجة</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm sm:text-base text-right">الشركة</h4>
              <div className="space-y-2 text-sm text-muted-foreground text-right">
                <a href="#" className="block hover:text-emerald-600 transition-colors">عن الشركة</a>
                <a href="#" className="block hover:text-emerald-600 transition-colors">المدونة</a>
                <a href="#" className="block hover:text-emerald-600 transition-colors">الوظائف</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm sm:text-base text-right">الدعم</h4>
              <div className="space-y-2 text-sm text-muted-foreground text-right">
                <a href="#" className="block hover:text-emerald-600 transition-colors">مركز المساعدة</a>
                <a href="#" className="block hover:text-emerald-600 transition-colors">اتصل بنا</a>
                <a href="#" className="block hover:text-emerald-600 transition-colors">حالة الخدمة</a>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-sm text-muted-foreground">
            <p>جميع الحقوق محفوظة © 2025 عين الأسهم الذكية</p>
          </div>
        </div>
      </footer>
    </div>
  );
}