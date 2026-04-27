import { useState } from 'react';
import { Users, TrendingUp, Brain, MessageSquare, LayoutDashboard, LogOut, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { Button } from '../ui/button';

import logoImg from '../../assets/logo.png';
import logoDarkImg from '../../assets/logo-dark.png';

const LINKS = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Overview',  end: true },
  { to: '/admin/users',        icon: Users,           label: 'Users'              },
  { to: '/admin/stocks',       icon: TrendingUp,      label: 'Stocks'             },
  { to: '/admin/community',    icon: MessageSquare,   label: 'Community'          },
  { to: '/admin/models',       icon: Brain,           label: 'AI Models'          },
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
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r bg-card flex flex-col shadow-lg z-40`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <img 
              src={theme === 'dark' ? logoDarkImg : logoImg} 
              alt="ESAI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm truncate">ESAI Admin</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {LINKS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t px-3 py-4 space-y-2">
          {sidebarOpen && (
            <p className="text-xs text-muted-foreground truncate px-1">{user?.email}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="ml-2">Log out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="hidden sm:flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Site
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Logged in as</span>
            <span className="text-sm font-semibold text-primary">{user?.username}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
