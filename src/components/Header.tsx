import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";
import { Button } from "./ui/button";
import { User, Menu, X, LogOut, ChevronDown, Shield, Languages, Home, Compass, Briefcase, TrendingUp, ChevronRight, ChevronLeft, Sun, Moon } from "lucide-react";
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
      className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50"  
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
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const handleNavClick = (callback?: () => void) => {
    closeMenu();
    if (callback) callback();
  };

  return (
    <div className="md:hidden">
      {/* Trigger button when menu is closed */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden force-hide-on-pc relative z-50 text-foreground hover:bg-muted/60"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 w-full h-full bg-background z-[100] flex flex-col"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Top Bar matching screenshot exactly */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background">
              {/* Brand Logo and BETA tag */}
              <div className="flex items-center">
                <button
                  onClick={() => handleNavClick(onGoToHome || (() => window.location.href = "/"))}
                  className={`flex items-center space-x-2.5 ${isRTL ? 'space-x-reverse' : ''} hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 p-0`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
                    <img
                      src={theme === 'dark' ? logoDarkImg : logoImg}
                      alt="EyeStocks AI Logo"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className={`flex items-center space-x-1.5 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <span className="text-lg font-extrabold whitespace-nowrap text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>ESAI</span>        
                    <span className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      BETA
                    </span>
                  </div>
                </button>
              </div>

              {/* Theme toggle and Close (X) buttons */}
              <div className="flex items-center gap-3">
                {/* Custom Styled Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl bg-background dark:bg-slate-900 border border-border/85 dark:border-slate-800 flex items-center justify-center hover:bg-muted/40 transition-colors shadow-sm cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {theme === 'light' ? (
                    <Sun className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-400" />
                  )}
                </button>

                {/* Styled Close Button */}
                <button
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-xl bg-background dark:bg-slate-900 border border-border/85 dark:border-slate-800 flex items-center justify-center hover:bg-muted/40 transition-colors shadow-sm cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5 text-foreground/80" />
                </button>
              </div>
            </div>

            {/* Menu Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
              {/* Navigation and Language toggles */}
              <div className="flex flex-col space-y-1">
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
                      className={`w-full flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "py-3 px-4 rounded-2xl bg-[#eef2ff] dark:bg-indigo-950/40 text-primary"
                          : "py-3 px-4 rounded-xl bg-transparent text-foreground/85 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isActive ? (
                          <div className="w-9 h-9 rounded-xl bg-[#e0e7ff] dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Icon className="w-5 h-5" fill="currentColor" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 flex items-center justify-center text-foreground/50">
                            <Icon className="w-5.5 h-5.5" />
                          </div>
                        )}
                        <span className={`text-[15.5px] tracking-wide ${isActive ? "font-bold text-foreground" : "font-semibold text-foreground/90"}`}>
                          {item.label}
                        </span>
                      </div>
                      
                      {!isActive && (
                        <div>
                          {isRTL ? (
                            <ChevronLeft className="w-4 h-4 text-foreground/45" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-foreground/45" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Divider */}
                <div className="border-t border-border/40 my-3" />

                {/* Language Switch Section */}
                <button
                  onClick={() => { toggleLanguage(); closeMenu(); }}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-transparent text-foreground/85 hover:bg-muted/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 flex items-center justify-center text-foreground/50">
                      <Languages className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[15px] font-semibold text-foreground/90">
                      {language === "en" ? "Switch to Arabic" : "تغيير إلى الإنجليزية"}
                    </span>
                  </div>
                  <span className="text-[15px] font-extrabold text-foreground">
                    {language === "en" ? "AR" : "EN"}
                  </span>
                </button>

                {/* Divider before User Account Section */}
                <div className="border-t border-border/40 my-3" />
              </div>

              {/* User Account / Auth Actions */}
              <div className="mt-auto pt-4">
                {isAuthenticated ? (
                  <div className="bg-[#f8fafc] dark:bg-slate-900/40 border border-[#f1f5f9] dark:border-slate-800 rounded-3xl p-[18px] flex flex-col gap-4">
                    {/* User profile details header */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-12 w-12 rounded-full border border-border/40">
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
                          <span className="font-bold text-foreground text-[15.5px] leading-tight">
                            {user?.full_name || user?.username}
                          </span>
                          <span className="text-[13px] text-muted-foreground mt-0.5">@{user?.username}</span>
                        </div>
                      </div>
                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100/50 dark:border-emerald-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isRTL ? "نشط" : "Active"}</span>
                      </span>
                    </div>

                    {/* Quick profile actions */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        onClick={() => handleNavClick(onGoToProfile)}
                        className="w-full h-12 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-[14px] shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <User className="w-4 h-4" /> 
                        <span>{t.nav.profile}</span>
                      </button>
                      <button
                        onClick={() => handleNavClick(onLogout)}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-[#e11d48] hover:bg-rose-600 text-white rounded-2xl font-bold text-[14px] shadow-md shadow-rose-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> 
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => handleNavClick(onGoToLogin)}
                      className="w-full h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-[14px] shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      {t.nav.login}
                    </button>
                    <button
                      onClick={() => handleNavClick(onGoToSignup)}
                      className="w-full h-12 flex items-center justify-center bg-primary hover:bg-primary/95 text-primary-foreground rounded-2xl font-bold text-[14px] shadow-md shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      {t.nav.signup}
                    </button>
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
