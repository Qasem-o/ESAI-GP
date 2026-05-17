import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";
import { Button } from "./ui/button";
import { User, Menu, X, LogOut, ChevronDown, Shield, Languages, Home, Compass, Briefcase, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DefaultAvatar } from "./DefaultAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentPage?: string;
  onGoToHome?: () => void;
  onGoToExplore?: () => void;
  onGoToPortfolio?: () => void;
  onGoToSimulator?: () => void;
  onGoToProfile?: () => void;
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
  onGoToAdmin?: () => void;
  onGoToCommunity?: () => void;
}

export function Header({
  currentPage,
  onGoToHome,
  onGoToExplore,
  onGoToPortfolio,
  onGoToSimulator,
  onGoToProfile,
  onGoToSignup,
  onGoToLogin,
  onGoToAdmin,
  onGoToCommunity,
}: HeaderProps) {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();

  const handleLogout = () => {
    logout();
    if (onGoToHome) onGoToHome();
  };

  const navItems = [
    { label: t.nav.home, onClick: onGoToHome, id: "home" },
    { label: t.nav.explore, onClick: onGoToExplore, id: "explore" },
    { label: t.nav.portfolio, onClick: onGoToPortfolio, id: "portfolio" },      
    { label: t.nav.simulator, onClick: onGoToSimulator, id: "simulator" },      
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="border-b bg-background sticky top-0 z-50"  
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoToHome}
              className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={theme === 'dark' ? logoDarkImg : logoImg}
                  alt="EyeStocks AI Logo"
                  className="w-full h-full object-contain p-1.5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                <span className="text-base sm:text-xl md:text-2xl font-bold whitespace-nowrap" style={{ fontFamily: "'Cairo', sans-serif" }}>ESAI</span>        
                <span className="text-[10px] font-bold text-muted-foreground px-1.5 py-0.5 uppercase tracking-wider">
                  {t.header.betaBadge}
                </span>
              </div>
            </motion.button>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={item.onClick}
                className={`px-4 text-base md:text-lg transition-colors cursor-pointer relative ${
                  currentPage === item.id || (item.id === "explore" && currentPage === "stocks")
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {(currentPage === item.id || (item.id === "explore" && currentPage === "stocks")) && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute bottom-[-1.25rem] left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 md:gap-3">        
            {/* Language Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background hover:bg-accent transition-all text-sm font-medium shadow-sm"
              title={language === "en" ? "Switch to Arabic" : "التبديل للعربية"}
            >
              <Languages className="w-4 h-4 text-primary" />
              <div className="h-4 w-[1px] bg-border mx-1" />
              <span className="font-bold tracking-tight text-foreground uppercase">
                {language === "en" ? "AR" : "EN"}
              </span>
            </motion.button>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                {/* Avatar */}
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:opacity-80 transition-opacity"
                  onClick={onGoToProfile}
                  title={t.header.goToProfile}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.profile_picture_url?.startsWith('/')
                        ? `https://esai-firstdraft.onrender.com${user.profile_picture_url}`
                        : (user?.profile_picture_url || "")}
                      alt={user?.username}
                    />
                    <AvatarFallback className="w-full h-full bg-transparent" asChild>
                      <DefaultAvatar />
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" title={t.header.accountOptions}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" /> 
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount> 
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name || user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          @{user?.username}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onGoToProfile} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t.nav.profile}</span>
                    </DropdownMenuItem>
                    {user?.is_admin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onGoToAdmin} className="cursor-pointer text-orange-600 focus:text-orange-600">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>{t.nav.adminPanel}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.nav.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={onGoToLogin} className="hidden md:flex">
                  {t.nav.login}
                </Button>
                <Button onClick={onGoToSignup} className="hidden md:flex">      
                  {t.nav.signup}
                </Button>
              </>
            )}

            <div className="block md:hidden">
              <MobileNav
                currentPage={currentPage}
                onGoToHome={onGoToHome}
                onGoToExplore={onGoToExplore}
                onGoToPortfolio={onGoToPortfolio}
                onGoToSimulator={onGoToSimulator}
                onGoToProfile={onGoToProfile}
                onGoToSignup={onGoToSignup}
                onGoToLogin={onGoToLogin}
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

interface MobileNavProps {
  currentPage?: string;
  onGoToHome?: () => void;
  onGoToExplore?: () => void;
  onGoToPortfolio?: () => void;
  onGoToSimulator?: () => void;
  onGoToProfile?: () => void;
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
  isAuthenticated?: boolean;
  user?: any;
  onLogout?: () => void;
}

function MobileNav({
  currentPage,
  onGoToHome,
  onGoToExplore,
  onGoToPortfolio,
  onGoToSimulator,
  onGoToProfile,
  onGoToSignup,
  onGoToLogin,
  isAuthenticated,
  user,
  onLogout
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, toggleLanguage, language, isRTL } = useLanguage();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const handleNavClick = (callback?: () => void) => {
    closeMenu();
    if (callback) callback();
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden force-hide-on-pc relative z-50 text-foreground hover:bg-muted/60"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "menu"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
          </motion.div>
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 w-full bg-background border-b border-border/80 shadow-2xl z-50 overflow-hidden"
          >
            <div className="container mx-auto px-5 pt-5 pb-7 flex flex-col space-y-4.5" dir={isRTL ? "rtl" : "ltr"}>
              {/* Navigation Links Group */}
              <div className="flex flex-col space-y-3 pt-2">
                {[
                  {
                    label: t.nav.home,
                    onClick: onGoToHome || (() => window.location.href = "/"),
                    id: "home",
                    icon: Home
                  },
                  {
                    label: t.nav.explore,
                    onClick: onGoToExplore,
                    id: "explore",
                    icon: Compass
                  },
                  {
                    label: t.nav.portfolio,
                    onClick: onGoToPortfolio,
                    id: "portfolio",
                    icon: Briefcase
                  },
                  {
                    label: t.nav.simulator,
                    onClick: onGoToSimulator,
                    id: "simulator",
                    icon: TrendingUp
                  }
                ].map((item) => {
                  const isActive = currentPage === item.id || (item.id === "explore" && currentPage === "stocks");
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.onClick)}
                      className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.005] active:scale-[0.995] ${
                        isActive
                          ? "bg-primary/10 text-primary font-bold shadow-sm"
                          : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[13.5px] font-semibold tracking-wide">{item.label}</span>
                      </div>
                      
                      <div>
                        {isActive ? (
                          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        ) : (
                          isRTL ? (
                            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/60" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                          )
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Language Switch Section */}
              <button
                onClick={() => { toggleLanguage(); closeMenu(); }}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/5 text-primary">
                    <Languages className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold uppercase tracking-wide">
                    {language === "en" ? "Switch to Arabic" : "English Language"}
                  </span>
                </div>
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {language === "en" ? "AR" : "EN"}
                </span>
              </button>

              {/* Authentication Actions */}
              <div className="pt-3.5 border-t border-border/60">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {/* User profile details header */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/30 border border-border/40 mb-1.5">
                      <div className={`flex items-center space-x-2.5 ${isRTL ? 'space-x-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                          <AvatarImage
                            src={user?.profile_picture_url?.startsWith('/')
                              ? `https://esai-firstdraft.onrender.com${user.profile_picture_url}`
                              : (user?.profile_picture_url || "")}
                            alt={user?.username}
                          />
                          <AvatarFallback className="w-full h-full bg-transparent" asChild>
                            <DefaultAvatar />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-start">
                          <span className="font-semibold text-foreground text-[12.5px] leading-tight">
                            {user?.full_name || user?.username}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">@{user?.username}</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {t.profile?.active || "Active"}
                      </span>
                    </div>

                    {/* Quick profile actions */}
                    <div className="grid grid-cols-2 gap-3 pt-0.5">
                      <Button
                        variant="outline"
                        onClick={() => handleNavClick(onGoToProfile)}
                        className="w-full h-10 justify-center rounded-xl gap-2 border-border/80 text-[12.5px] font-semibold text-foreground/80 hover:text-foreground hover:scale-[1.005] active:scale-[0.995] transition-all"
                      >
                        <User className="w-3.5 h-3.5" /> 
                        <span>{t.nav.profile}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleNavClick(onLogout)}
                        className="w-full h-10 justify-center rounded-xl gap-2 hover:bg-red-600/90 hover:scale-[1.005] active:scale-[0.995] transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" /> 
                        <span>{t.nav.logout}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 py-0.5">
                    <Button
                      variant="outline"
                      onClick={() => handleNavClick(onGoToLogin)}
                      className="w-full h-10 justify-center rounded-xl border-border/80 text-[12.5px] font-semibold text-foreground/80 hover:text-foreground hover:scale-[1.005] active:scale-[0.995] transition-all"
                    >
                      {t.nav.login}
                    </Button>
                    <Button
                      onClick={() => handleNavClick(onGoToSignup)}
                      className="w-full h-10 justify-center rounded-xl shadow-md shadow-primary/10 hover:scale-[1.005] active:scale-[0.995] transition-all"
                    >
                      {t.nav.signup}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
