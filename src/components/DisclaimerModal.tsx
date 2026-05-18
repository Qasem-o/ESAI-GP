import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { AlertCircle, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export function DisclaimerModal() {
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const shouldShow = localStorage.getItem('show_disclaimer');
      if (shouldShow === 'true' && isAuthenticated) {
        setShow(true);
      }
    };

    check();
    const interval = setInterval(check, 1000);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAuthenticated]);

  const handleAccept = () => {
    setShow(false);
    localStorage.removeItem('show_disclaimer');
  };

  const items = [
    {
      icon: <Info className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10",
      hoverBorder: "hover:border-primary/10",
      title: isRTL ? "هدف المنصة" : "Platform Purpose",
      desc: isRTL
        ? "EyeStocks AI أداة تعليمية لتحليل البيانات وتوقعات الذكاء الاصطناعي."
        : "EyeStocks AI is an educational tool for data analysis and AI predictions.",
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-500/10",
      hoverBorder: "hover:border-orange-500/10",
      title: isRTL ? "المسؤولية" : "Responsibility",
      desc: isRTL
        ? "جميع القرارات المالية تقع على عاتقك وحدك. نحن لا نقدم نصائح مالية."
        : "All financial decisions are your sole responsibility. We do not provide financial advice.",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10",
      hoverBorder: "hover:border-blue-500/10",
      title: isRTL ? "مخاطر التداول" : "Financial Risk",
      desc: isRTL
        ? "التداول ينطوي على مخاطر. النتائج السابقة لا تضمن الأداء المستقبلي."
        : "Trading involves risk. Past results don't guarantee future performance.",
    },
  ];

  return createPortal(
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          style={{ position: 'fixed', zIndex: 999999, top: 0, left: 0, right: 0, bottom: 0 }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full overflow-y-auto border border-border/50 relative mx-auto flex flex-col max-h-[88vh]"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary flex-shrink-0" />

            {/* Header Content */}
            <div className="p-5 sm:p-8 pb-3 text-center flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform rotate-3 border border-primary/20 shadow-inner flex-shrink-0">
                <ShieldCheck className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {t.disclaimer.title}
              </h2>
              <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 sm:text-2xl font-medium uppercase tracking-widest opacity-70">
                {isRTL ? "معلومات هامة" : "Important Information"}
              </p>
            </div>

            {/* List Body Section */}
            <div className="p-5 sm:p-8 pt-0 pb-4 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 sm:p-4 rounded-2xl bg-muted/30 border border-transparent ${item.hoverBorder} transition-colors`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground text-xs sm:text-sm">{item.title}</p>
                      <p className="text-muted-foreground leading-relaxed text-[11px] sm:text-[13px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons Section */}
            <div className="p-5 sm:p-8 pt-3 border-t bg-card flex-shrink-0 mt-auto rounded-b-3xl">
              <Button
                onClick={handleAccept}
                className="w-full h-11 sm:h-13 text-sm sm:text-base font-bold shadow-2xl shadow-primary/20 rounded-2xl group relative overflow-hidden flex items-center justify-center cursor-pointer"
              >
                <span className="relative z-10">{t.disclaimer.accept}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-[0.15em] font-medium leading-normal">
                {isRTL ? (
                  <>
                    بالنقر فوق، تقر بـ{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline underline-offset-4 font-bold transition-all inline-block"
                      style={{ textTransform: "none" }}
                    >
                      سياستنا للخصوصية
                    </a>
                  </>
                ) : (
                  <>
                    By clicking, you acknowledge our{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline underline-offset-4 font-bold transition-all inline-block"
                    >
                      privacy policy
                    </a>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
