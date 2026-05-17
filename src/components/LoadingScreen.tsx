import React from "react";
import { motion } from "framer-motion";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";
import { Header } from "./Header";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

interface LoadingScreenProps {
  message?: string;
  currentPage?: string;
  onGoToHome?: () => void;
  onGoToExplore?: () => void;
  onGoToPortfolio?: () => void;
  onGoToSimulator?: () => void;
  onGoToProfile?: () => void;
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
  onGoToAdmin?: () => void;
}

export function LoadingScreen({
  message,
  currentPage,
  onGoToHome,
  onGoToExplore,
  onGoToPortfolio,
  onGoToSimulator,
  onGoToProfile,
  onGoToSignup,
  onGoToLogin,
  onGoToAdmin,
}: LoadingScreenProps) {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header
        currentPage={currentPage}
        onGoToHome={onGoToHome}
        onGoToExplore={onGoToExplore}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
        onGoToAdmin={onGoToAdmin}
      />
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          {/* Custom Logo Loading Animation */}
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
            {/* Pulsing outer ring */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-primary/20"
            />
            
            {/* Rotating border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-full"
            />

            {/* The Logo itself with a smooth rotation/bounce */}
            <motion.div
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-24 h-24 flex items-center justify-center z-10 p-4"
            >
              <img
                src={theme === 'dark' ? logoDarkImg : logoImg}
                alt="EyeStocks AI Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </motion.div>
          </div>

          <h2 className="text-xl font-bold mb-2 tracking-tight">
            {isRTL ? "جاري التجهيز..." : "Preparing..."}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {message || (isRTL ? "لحظات ونكون معك" : "Just a moment...")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
