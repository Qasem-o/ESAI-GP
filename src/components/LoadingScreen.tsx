import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onLoadingComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center transition-colors duration-300">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl bg-background/50 backdrop-blur-sm border border-border">
            <img
              src={theme === 'dark' ? logoDarkImg : logoImg}
              alt="EyeStocks AI Logo"
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">EyeStocks AI</h1>
          <p className="text-xl text-muted-foreground">Intelligent Market Predictions</p>
        </div>

        {/* Investment Quote */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center">
            <p className="text-lg text-foreground italic">
              "Smart investments today, secure wealth tomorrow"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              - EyeStocks AI Investment Philosophy
            </p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 mx-auto space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading... {loadingProgress}%
          </p>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Preparing your AI-powered trading experience
          </p>
        </div>
      </div>
    </div>
  );
}
