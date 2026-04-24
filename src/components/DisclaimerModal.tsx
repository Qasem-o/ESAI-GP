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
        <div className="fixed inset-0 bg-background/60 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden border border-border/50 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Design Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
            
            {/* Header Area */}
            <div className="p-8 pb-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 border border-primary/20 shadow-inner">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Risk Disclosure & Disclaimer
              </h2>
              <p className="text-muted-foreground text-xs mt-2 font-medium uppercase tracking-widest opacity-70">
                Important Information
              </p>
            </div>

            <div className="p-8 pt-2 space-y-5">
              <div className="space-y-4">
                {/* Platform Purpose */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm">Platform Purpose</p>
                    <p className="text-muted-foreground leading-relaxed text-[13px]">
                      EyeStocks AI is an educational tool for **data analysis** and AI predictions.
                    </p>
                  </div>
                </div>

                {/* Decision Responsibility */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-orange-500/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm">Responsibility</p>
                    <p className="text-muted-foreground leading-relaxed text-[13px]">
                      All financial decisions are your **sole responsibility**. We do not provide financial advice.
                    </p>
                  </div>
                </div>

                {/* Financial Risk */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-blue-500/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm">Financial Risk</p>
                    <p className="text-muted-foreground leading-relaxed text-[13px]">
                      Trading involves risk. Past results don't guarantee future performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleAccept}
                  className="w-full h-14 text-base font-bold shadow-2xl shadow-primary/20 rounded-2xl group relative overflow-hidden"
                >
                  <span className="relative z-10">I Understand & Agree</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                
                <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em] font-medium">
                  By clicking, you acknowledge our policy
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
