import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";
import { Button } from "./ui/button";
import { User, Menu, X, LogOut, ChevronDown, Shield, Languages } from "lucide-react";
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

            {/* Mobile Hamburger - Visible ONLY on small mobile screens */}     
            <div className="block md:hidden">
              <MobileNav
                currentPage={currentPage}
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
        className="md:hidden force-hide-on-pc"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}     
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 rtl:left-0 rtl:right-auto w-full bg-background border-b shadow-lg z-50">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4 text-left">
            <button
              onClick={() => handleNavClick(() => (window.scrollTo(0, 0), undefined))}
              className={`text-left py-2 ${currentPage === "home" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => handleNavClick(onGoToExplore)}
              className={`text-left py-2 ${currentPage === "explore" || currentPage === "stocks" ? "text-primary font-medium" : "text-muted-foreground"}`}      
            >
              {t.nav.explore}
            </button>
            <button
              onClick={() => handleNavClick(onGoToPortfolio)}
              className={`text-left py-2 ${currentPage === "portfolio" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {t.nav.portfolio}
            </button>
            <button
              onClick={() => handleNavClick(onGoToSimulator)}
              className={`text-left py-2 ${currentPage === "simulator" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {t.nav.simulator}
            </button>

            {/* Language Toggle in Mobile */}
            <button
              onClick={() => { toggleLanguage(); closeMenu(); }}
              className="flex items-center gap-3 text-left py-3 px-4 rounded-xl bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
            >
              <Languages className="w-5 h-5 text-primary" />
              <span className="font-bold uppercase tracking-widest text-xs">    
                {language === "en" ? "Switch to Arabic" : "English Language"}   
              </span>
            </button>

            <div className="flex flex-col space-y-2 pt-2 border-t">
              {isAuthenticated ? (
                <>
                  <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} py-2`}>
                    <Avatar className="h-8 w-8">
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
                    <div className="flex flex-col">
                      <span className="font-medium leading-none">{user?.full_name || user?.username}</span>
                      <span className="text-xs text-muted-foreground mt-1">@{user?.username}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => handleNavClick(onGoToProfile)} className="justify-start">
                    <User className="w-4 h-4 mr-2" /> {t.nav.profile}
                  </Button>
                  <Button variant="destructive" onClick={() => handleNavClick(onLogout)} className="justify-start">
                    <LogOut className="w-4 h-4 mr-2" /> {t.nav.logout}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => handleNavClick(onGoToLogin)} className="justify-start">
                    {t.nav.login}
                  </Button>
                  <Button onClick={() => handleNavClick(onGoToSignup)} className="justify-start">
                    {t.nav.signup}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
