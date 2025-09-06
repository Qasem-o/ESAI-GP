import React, { useState } from "react";
import { Button } from "./ui/button";
import { TrendingUp, User, Menu, X } from "lucide-react";

interface HeaderProps {
  currentPage?: string;
  onGoToHome?: () => void;
  onGoToStocks?: () => void;
  onGoToPortfolio?: () => void;
  onGoToCommunity?: () => void;
  onGoToNews?: () => void;
  onGoToLearn?: () => void;
  onGoToSimulator?: () => void;
  onGoToProfile?: () => void;
  onGoToDashboard?: () => void;
  onGoToSignup?: () => void;
}

export function Header({
  currentPage,
  onGoToHome,
  onGoToStocks,
  onGoToPortfolio,
  onGoToCommunity,
  onGoToNews,
  onGoToLearn,
  onGoToSimulator,
  onGoToProfile,
  onGoToDashboard,
  onGoToSignup

}: HeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onGoToHome}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-white">
                <img 
                  src="/src/assets/logo.png" 
                  alt="StockEye AI Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold">EyeStock AI</span>
            </button>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={onGoToStocks} 
              className={`transition-colors ${
                currentPage === "stocks" 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Market
            </button>
            <button 
              onClick={onGoToPortfolio} 
              className={`transition-colors relative
                ${
                  currentPage === "portfolio"
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Wallet
            </button>
            <button 
              onClick={onGoToCommunity} 
              className={`transition-colors ${
                currentPage === "community" 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Community
            </button>
            <button 
              onClick={onGoToNews} 
              className={`transition-colors ${
                currentPage === "news" 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              News
            </button>
            <button 
              onClick={onGoToLearn} 
              className={`transition-colors ${
                currentPage === "learn" 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Learn
            </button>
            <button 
              onClick={onGoToSimulator} 
              className={`transition-colors ${
                currentPage === "simulator" 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Simulator
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onGoToProfile} size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={onGoToSignup} className="hidden md:inline-flex">Sign Up</Button>
            <Button onClick={onGoToDashboard}>Get Started</Button>
            <MobileNav 
              currentPage={currentPage}
              onGoToStocks={onGoToStocks}
              onGoToPortfolio={onGoToPortfolio}
              onGoToCommunity={onGoToCommunity}
              onGoToNews={onGoToNews}
              onGoToLearn={onGoToLearn}
              onGoToSimulator={onGoToSimulator}
              onGoToProfile={onGoToProfile}
              onGoToSignup={onGoToSignup}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

interface MobileNavProps {
  currentPage?: string;
  onGoToStocks?: () => void;
  onGoToPortfolio?: () => void;
  onGoToCommunity?: () => void;
  onGoToNews?: () => void;
  onGoToLearn?: () => void;
  onGoToSimulator?: () => void;
  onGoToProfile?: () => void;
  onGoToSignup?: () => void;
}

function MobileNav({
  currentPage,
  onGoToStocks,
  onGoToPortfolio,
  onGoToCommunity,
  onGoToNews,
  onGoToLearn,
  onGoToSimulator,
  onGoToProfile,
  onGoToSignup
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (callback?: () => void) => {
    closeMenu();
    if (callback) callback();
  };

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleMenu}>
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 w-full bg-background border-b shadow-lg z-50">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <button 
              onClick={() => handleNavClick(onGoToStocks)}
              className={`text-left py-2 ${currentPage === "stocks" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Market
            </button>
            <button 
              onClick={() => handleNavClick(onGoToPortfolio)}
              className={`text-left py-2 ${currentPage === "portfolio" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Wallet
            </button>
            <button 
              onClick={() => handleNavClick(onGoToCommunity)}
              className={`text-left py-2 ${currentPage === "community" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Community
            </button>
            <button 
              onClick={() => handleNavClick(onGoToNews)}
              className={`text-left py-2 ${currentPage === "news" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              News
            </button>
            <button 
              onClick={() => handleNavClick(onGoToLearn)}
              className={`text-left py-2 ${currentPage === "learn" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Learn
            </button>
            <button 
              onClick={() => handleNavClick(onGoToSimulator)}
              className={`text-left py-2 ${currentPage === "simulator" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Simulator
            </button>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Button variant="outline" onClick={() => handleNavClick(onGoToProfile)} className="justify-start">
                <User className="w-4 h-4 mr-2" /> Profile
              </Button>
              <Button variant="outline" onClick={() => handleNavClick(onGoToSignup)} className="justify-start">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

