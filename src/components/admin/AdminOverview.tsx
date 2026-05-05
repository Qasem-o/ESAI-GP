import { useEffect, useState } from 'react';
import { Users, TrendingUp, Brain, MessageSquare, AlertCircle, BarChart3, Database, ShieldAlert, Activity } from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_stocks: number;
  total_posts: number;
  total_predictions: number;
}

const STAT_CARDS = [
  { key: 'total_users', label: 'Total Users', icon: Users },
  { key: 'active_users', label: 'Active Users', icon: Activity },
  { key: 'total_stocks', label: 'Stocks Tracked', icon: TrendingUp },
  { key: 'total_posts', label: 'Community Posts', icon: MessageSquare },
  { key: 'total_predictions', label: 'AI Predictions', icon: Brain },
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
      <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-lg p-4 border border-destructive/20">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform health and high-level metrics.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
          <span>System Operational</span>
        </div>
      </div>

      {/* Stat Cards - Horizontal Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-lg bg-card border p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-foreground opacity-70" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground tracking-tight leading-none">
                {stats ? (stats as any)[key].toLocaleString() : '—'}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-lg border bg-card flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {[
              { href: '/admin/users', label: 'Manage Users', icon: Users },
              { href: '/admin/stocks', label: 'Add Stock', icon: TrendingUp },
              { href: '/admin/models', label: 'Train Models', icon: Database },
              { href: '/admin/community', label: 'Review Posts', icon: ShieldAlert },
            ].map(({ href, label, icon: ActionIcon }) => (
              <a
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-3 border rounded-lg p-4 hover:bg-muted transition-colors text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
                  <ActionIcon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* System Status / Logs (Placeholder for layout) */}
        <div className="rounded-lg border bg-card flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">System Status</h2>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium text-foreground">Connected</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">API Latency</span>
              <span className="font-medium text-foreground">12ms</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Active Sessions</span>
              <span className="font-medium text-foreground">{stats?.active_users || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

