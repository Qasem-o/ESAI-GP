import { useState } from 'react';
import { Users, TrendingUp, Brain, MessageSquare, LayoutDashboard, LogOut, ArrowLeft, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

import logoImg from '../../assets/logo.png';
import logoDarkImg from '../../assets/logo-dark.png';

const LINKS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/stocks', icon: TrendingUp, label: 'Stocks' },
  { to: '/admin/community', icon: MessageSquare, label: 'Community' },
  { to: '/admin/models', icon: Brain, label: 'AI Models' },
];

export function AdminDashboard() {
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r bg-card flex flex-col z-40`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 border-b h-16">
          <motion.div
            whileHover={{ rotate: 90 }}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          >
            <img
              src={theme === 'dark' ? logoDarkImg : logoImg}
              alt="ESAI Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg tracking-tight truncate text-foreground"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                ESAI Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-4">
          {LINKS.map(({ to, icon: Icon, label, end }, index) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-lg text-base font-medium transition-all duration-300 ease-out transform active:scale-95 ${isActive
                    ? 'bg-foreground text-background shadow-md translate-x-1'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-2 hover:shadow-sm'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t p-4 space-y-3 bg-muted/20">
          {sidebarOpen && (
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-0.5">Admin Account</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="ml-2 font-medium">Log out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-muted/10">
        {/* Top Bar */}
        <header className="border-b bg-card px-6 flex items-center justify-between sticky top-0 z-30 h-16">
          {/* Left: Toggle */}
          <div className="flex items-center w-1/4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted bg-muted/30"
              title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Center: Return to Site */}
          <div className="flex-1 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 h-10 px-6 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-full shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-semibold tracking-wide">Return to Site</span>
              </Button>
            </motion.div>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center gap-3 justify-end w-1/4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Active Session</span>
              <span className="text-sm font-medium text-foreground">{user?.username}</span>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm shadow-md border-2 border-background"
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </motion.div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
