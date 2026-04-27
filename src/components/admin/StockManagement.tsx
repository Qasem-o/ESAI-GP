import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, RefreshCw, Database, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface StockRow {
  stock_id: number;
  symbol: string;
  name: string | null;
  sector: string | null;
  current_price: number | null;
}

interface JobStatus {
  status: 'idle' | 'running' | 'done' | 'error';
  started_at: string | null;
  log: string[];
}

const STATUS_ICONS = {
  idle:    <Clock className="w-4 h-4 text-muted-foreground" />,
  running: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  done:    <CheckCircle2 className="w-4 h-4 text-green-500" />,
  error:   <XCircle className="w-4 h-4 text-red-500" />,
};

export function StockManagement() {
  const [stocks, setStocks]   = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [adding, setAdding]   = useState(false);
  const [addMsg, setAddMsg]   = useState('');

  // Fill-missing job state (reuses /admin/models/status endpoint)
  const [fillStatus, setFillStatus] = useState<JobStatus>({ status: 'idle', started_at: null, log: [] });
  const [filling, setFilling] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStocks = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/stocks`, { headers: getHeaders(true) })
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(data => { setStocks(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  const fetchJobStatus = async () => {
    const r = await fetch(`${API_BASE_URL}/admin/models/status`, { headers: getHeaders(true) });
    if (r.ok) setFillStatus(await r.json());
  };

  useEffect(fetchStocks, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [fillStatus.log]);

  // Poll while running
  useEffect(() => {
    if (fillStatus.status === 'running') {
      pollerRef.current = setInterval(fetchJobStatus, 2000);
    } else {
      if (pollerRef.current) clearInterval(pollerRef.current);
    }
    return () => { if (pollerRef.current) clearInterval(pollerRef.current); };
  }, [fillStatus.status]);

  const fillMissingData = async () => {
    setFilling(true);
    setFillStatus({ status: 'running', started_at: new Date().toISOString(), log: ['Starting fill-missing job...'] });
    try {
      const r = await fetch(`${API_BASE_URL}/admin/stocks/fill-missing`, {
        method: 'POST', headers: getHeaders(true),
      });
      if (!r.ok) {
        const data = await r.json();
        setFillStatus(s => ({ ...s, status: 'error', log: [...s.log, `Error: ${data.detail}`] }));
      } else {
        // Start polling
        pollerRef.current = setInterval(fetchJobStatus, 2000);
      }
    } catch (e: any) {
      setFillStatus(s => ({ ...s, status: 'error', log: [...s.log, `Error: ${e.message}`] }));
    } finally {
      setFilling(false);
    }
  };

  const addStock = async () => {
    const symbol = newTicker.trim().toUpperCase();
    if (!symbol) return;
    setAdding(true);
    setAddMsg('');
    try {
      const r = await fetch(`${API_BASE_URL}/admin/stocks`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ symbol }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Failed to add stock');
      setAddMsg(`Added! ${symbol} — historical data is being fetched in the background.`);
      setNewTicker('');
      fetchStocks();
    } catch (e: any) {
      setAddMsg(`Error: ${e.message}`);
    } finally {
      setAdding(false);
    }
  };

  const deleteStock = async (symbol: string) => {
    if (!confirm(`Delete all data for "${symbol}"? This includes price history and predictions.`)) return;
    await fetch(`${API_BASE_URL}/admin/stocks/${symbol}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    fetchStocks();
  };

  const logLineColor = (line: string) => {
    if (line.includes('[ERROR]') || line.includes('[FATAL]')) return 'text-red-400';
    if (line.includes('[OK]'))    return 'text-green-400';
    if (line.includes('[SKIP]'))  return 'text-yellow-400';
    if (line.includes('[WARN]'))  return 'text-orange-400';
    if (line.includes('[FETCH]')) return 'text-blue-300';
    if (line.includes('---'))     return 'text-green-300 font-bold';
    return 'text-gray-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground mt-1">Add or remove stocks. New stocks auto-fetch data from Yahoo Finance.</p>
      </div>

      {/* Fill Missing Data */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" /> Fill Missing Data (Incremental)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Fetches only the <strong>missing</strong> price rows (from last stored date to today) for all stocks
          and computes their technical indicators. Much faster than a full re-fetch.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={fillMissingData}
            disabled={filling || fillStatus.status === 'running'}
            className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg active:shadow-sm"
          >
            {fillStatus.status === 'running'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
              : <><Database className="w-4 h-4" /> Fill Missing Data</>
            }
          </Button>
          <Button variant="outline" size="sm" onClick={fetchJobStatus} className="gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh Status
          </Button>
          <div className="flex items-center gap-2 ml-auto text-sm">
            {STATUS_ICONS[fillStatus.status]}
            <span className="capitalize font-medium">{fillStatus.status}</span>
          </div>
        </div>

        {/* Live Log */}
        {fillStatus.log.length > 0 && (
          <div
            ref={logRef}
            className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-xs border border-gray-800/60 shadow-inner"
            style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}
          >
            {fillStatus.log.map((line, i) => (
              <div key={i} className={`${logLineColor(line)} whitespace-pre-wrap break-words mb-1`}>{line || '\u00a0'}</div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stock */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Stock
        </h2>
        <div className="flex gap-3 max-w-md">
          <input
            value={newTicker}
            onChange={e => setNewTicker(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStock()}
            placeholder="Ticker symbol (e.g. AAPL, 2222.SR)"
            className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={addStock} disabled={adding} className="gap-2">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </div>
        {addMsg && (
          <p className={`mt-2 text-sm ${addMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {addMsg}
          </p>
        )}
      </div>

      {/* Stocks Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h2 className="font-semibold text-sm">{stocks.length} stocks in database</h2>
          <Button variant="ghost" size="sm" onClick={fetchStocks} className="gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>
        {error && (
          <div className="flex items-center gap-3 text-destructive p-4">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Symbol</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Sector</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stocks.map(s => (
                  <tr key={s.stock_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{s.symbol}</td>
                    <td className="px-4 py-3">{s.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.sector || '—'}</td>
                    <td className="px-4 py-3">{s.current_price ? `$${s.current_price.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 flex justify-center">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => deleteStock(s.symbol)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
