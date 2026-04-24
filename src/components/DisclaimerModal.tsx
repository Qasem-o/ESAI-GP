import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { AlertCircle, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function DisclaimerModal() {
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check immediately
    const check = () => {
      const shouldShow = localStorage.getItem('show_disclaimer');
      if (shouldShow === 'true' && isAuthenticated) {
        setShow(true);
      }
    };
    
    check();

    // Also check every second for 5 seconds in case of race conditions during login/signup
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

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-primary/20"
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-primary/20 via-blue-600/10 to-primary/20 p-8 text-center border-b border-primary/10 relative">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 -rotate-3 border border-primary/20">
                <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                Risk Disclosure & Disclaimer
              </h2>
            </div>

            <div className="p-8 space-y-6 text-left" dir="ltr">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground mb-1">Platform Purpose</p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      EyeStocks AI is an educational technology tool designed to assist in **data analysis** and provide predictions based on AI models.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-1">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground mb-1">Decision Responsibility</p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Any action you take based on the information provided is your **sole responsibility**. We do not provide financial advice and recommend consulting a licensed professional.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground mb-1">Financial Risk</p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Stock market investments involve high risk. Past performance does not guarantee future results, and technical models may be inaccurate.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAccept}
                className="w-full h-14 text-xl font-bold shadow-xl shadow-primary/20 mt-4 rounded-xl group relative overflow-hidden"
              >
                <span className="relative z-10">I Understand & Agree</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              
              <p className="text-center text-[10px] text-muted-foreground pt-2 uppercase tracking-widest">
                By clicking agree, you acknowledge our risk disclosure policy.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
