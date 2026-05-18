import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { AlertTriangle, Key } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export function SessionExpiredModal() {
  const { user, logout } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      // Show only if the user was previously logged in
      if (user || localStorage.getItem('access_token')) {
        setShow(true);
        // Clear session immediately to avoid infinite loops and protect user storage
        logout();
      }
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [user, logout]);

  const handleRedirect = () => {
    setShow(false);
    navigate("/login");
  };

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
            className="bg-card rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] w-full border border-red-500/20 relative mx-auto flex flex-col max-h-[85vh] p-6 sm:p-8"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 flex-shrink-0 rounded-t-3xl" />

            {/* Header Content */}
            <div className="text-center flex-shrink-0 my-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 border border-red-500/20 shadow-inner flex-shrink-0">
                <AlertTriangle className="w-9 h-9 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {isRTL ? "انتهت صلاحية الجلسة" : "Session Expired"}
              </h2>
              <p className="text-red-500 text-xs mt-1 font-semibold uppercase tracking-wider opacity-90">
                {isRTL ? "تنبيه أمني" : "Security Alert"}
              </p>
            </div>

            {/* Body Description */}
            <div className="py-4 text-center">
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {isRTL
                  ? "انتهت صلاحية جلسة تسجيل الدخول الخاصة بك لحماية حسابك. يرجى إعادة تسجيل الدخول لمتابعة استخدام المنصة."
                  : "Your login session has expired to protect your account. Please log in again to continue using the platform."}
              </p>
            </div>

            {/* Button Actions */}
            <div className="mt-6 flex-shrink-0">
              <Button
                onClick={handleRedirect}
                className="w-full h-12 text-base font-bold shadow-xl shadow-red-500/10 rounded-2xl group relative overflow-hidden flex items-center justify-center cursor-pointer gap-2"
              >
                <Key className="w-5 h-5 shrink-0" />
                <span className="relative z-10">
                  {isRTL ? "تسجيل الدخول الآن" : "Log In Now"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            <div className="text-center mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
              {isRTL ? "منصة آي ستوكس الذكية" : "EyeStocks AI Platform"}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
