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
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex items-center justify-center">
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
              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                <span className="text-base sm:text-xl md:text-2xl font-bold whitespace-nowrap" style={{ fontFamily: "'Cairo', sans-serif" }}>ESAI</span>
                <span className="text-[10px] font-bold text-muted-foreground px-1.5 py-0.5 uppercase tracking-wider">
                  {t.header.betaBadge}
                </span>
              </div>
            </motion.button>
          </div>

          {/* Center Nav */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-6">
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
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background hover:bg-accent transition-all text-sm font-medium shadow-sm"
              title={language === "en" ? "Switch to Arabic" : "التبديل للإنجليزية"}
            >
              <Languages className="w-4 h-4 text-primary" />
              <div className="h-4 w-[1px] bg-border mx-1" />
              <span className="font-bold tracking-tight text-foreground uppercase">
                {language === "en" ? "AR" : "EN"}
              </span>
            </motion.button>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-1">
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
                <Button variant="ghost" onClick={onGoToLogin} className="hidden lg:flex">
                  {t.nav.login}
                </Button>
                <Button onClick={onGoToSignup} className="hidden lg:flex">
                  {t.nav.signup}
                </Button>
              </>
            )}

            {/* Mobile Hamburger - Visible ONLY on small mobile screens */}
            <div className="block lg:hidden">
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

  const menuVariants = {
    closed: {
      x: isRTL ? "-100%" : "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  return (
    <div className="lg:hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMenu}
        className="relative z-[60] hover:bg-primary/10 transition-colors rounded-full h-10 w-10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </motion.div>
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={closeMenu}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[50]"
            />

            {/* Side Menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-[80%] max-w-xs bg-background border-l border-r shadow-2xl z-[55] flex flex-col`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="p-6 pt-20 flex-1 overflow-y-auto no-scrollbar">
                {/* User Info Section */}
                {isAuthenticated && (
                  <div className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage
                          src={user?.profile_picture_url?.startsWith('/')
                            ? `https://esai-firstdraft.onrender.com${user.profile_picture_url}`
                            : (user?.profile_picture_url || "")}
                          alt={user?.username}
                        />
                        <AvatarFallback><DefaultAvatar /></AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-lg truncate">{user?.full_name || user?.username}</span>
                        <span className="text-xs text-muted-foreground truncate">@{user?.username}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  {[
                    { label: t.nav.home, icon: <User className="w-5 h-5" />, active: currentPage === "home", onClick: () => handleNavClick(() => window.scrollTo(0, 0)) },
                    { label: t.nav.explore, icon: <Languages className="w-5 h-5" />, active: currentPage === "explore" || currentPage === "stocks", onClick: () => handleNavClick(onGoToExplore) },
                    { label: t.nav.portfolio, icon: <ChevronDown className="w-5 h-5" />, active: currentPage === "portfolio", onClick: () => handleNavClick(onGoToPortfolio) },
                    { label: t.nav.simulator, icon: <Shield className="w-5 h-5" />, active: currentPage === "simulator", onClick: () => handleNavClick(onGoToSimulator) },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.onClick}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                        item.active 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className={item.active ? "text-primary-foreground" : "text-primary"}>
                        {item.icon}
                      </span>
                      <span className="font-bold text-base">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t space-y-4">
                  <button
                    onClick={() => { toggleLanguage(); closeMenu(); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Languages className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-bold text-sm">
                        {language === "en" ? "العربية" : "English"}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground/50 border border-muted-foreground/20 px-1.5 py-0.5 rounded">
                      {language === "en" ? "AR" : "EN"}
                    </span>
                  </button>

                  {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => handleNavClick(onGoToLogin)} className="rounded-xl h-12 font-bold">
                        {t.nav.login}
                      </Button>
                      <Button onClick={() => handleNavClick(onGoToSignup)} className="rounded-xl h-12 font-bold">
                        {t.nav.signup}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="outline" onClick={() => handleNavClick(onGoToProfile)} className="w-full justify-start gap-3 h-12 rounded-xl border-dashed">
                        <User className="w-5 h-5" /> {t.nav.profile}
                      </Button>
                      <Button variant="destructive" onClick={() => handleNavClick(onLogout)} className="w-full justify-start gap-3 h-12 rounded-xl shadow-lg shadow-red-500/10">
                        <LogOut className="w-5 h-5" /> {t.nav.logout}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 text-center border-t bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  EyeStocks AI • {t.header.betaBadge}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

