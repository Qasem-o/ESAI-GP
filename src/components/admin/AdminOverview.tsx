import { useEffect, useState } from 'react';
import { Users, TrendingUp, Brain, MessageSquare, AlertCircle, BarChart3 } from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_stocks: number;
  total_posts: number;
  total_predictions: number;
}

const STAT_CARDS = [
  { key: 'total_users',      label: 'Total Users',       icon: Users,          color: 'from-blue-500 to-blue-600'    },
  { key: 'active_users',     label: 'Active Users',      icon: Users,          color: 'from-green-500 to-emerald-600' },
  { key: 'total_stocks',     label: 'Stocks Tracked',    icon: TrendingUp,     color: 'from-purple-500 to-violet-600' },
  { key: 'total_posts',      label: 'Community Posts',   icon: MessageSquare,  color: 'from-orange-500 to-amber-600'  },
  { key: 'total_predictions',label: 'AI Predictions',    icon: Brain,          color: 'from-rose-500 to-pink-600'     },
];

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders(true) })
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(setStats)
      .catch(() => setError('Failed to load stats. Make sure you are an admin.'));
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-lg p-4">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform health at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl bg-card border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats ? (stats as any)[key].toLocaleString() : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/users',     label: 'Manage Users',     emoji: '👥' },
            { href: '/admin/stocks',    label: 'Add Stock',        emoji: '📈' },
            { href: '/admin/models',    label: 'Train Models',     emoji: '🤖' },
            { href: '/admin/community', label: 'Review Posts',     emoji: '💬' },
          ].map(({ href, label, emoji }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-2 border rounded-lg p-4 hover:bg-muted transition-colors text-center"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
