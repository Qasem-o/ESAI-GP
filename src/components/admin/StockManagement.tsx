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
  running: <Loader2 className="w-4 h-4 text-foreground animate-spin" />,
  done:    <CheckCircle2 className="w-4 h-4 text-foreground" />,
  error:   <XCircle className="w-4 h-4 text-destructive" />,
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
    if (line.includes('[ERROR]') || line.includes('[FATAL]')) return 'text-destructive';
    if (line.includes('[OK]'))    return 'text-foreground font-medium';
    if (line.includes('[SKIP]'))  return 'text-muted-foreground';
    if (line.includes('[WARN]'))  return 'text-muted-foreground';
    if (line.includes('[FETCH]')) return 'text-foreground';
    if (line.includes('---'))     return 'text-foreground font-bold';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Stock Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Add or remove stocks. New stocks auto-fetch data from Yahoo Finance.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
          <span>Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          {/* Add Stock */}
          <div className="rounded-lg border bg-card p-6 flex flex-col justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Stock
            </h2>
            <div className="flex flex-col gap-3">
              <input
                value={newTicker}
                onChange={e => setNewTicker(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStock()}
                placeholder="Ticker symbol (e.g. AAPL, 2222.SR)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
              <Button onClick={addStock} disabled={adding} className="w-full gap-2 h-10 bg-foreground text-background hover:bg-foreground/90 font-medium">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Stock
              </Button>
            </div>
            {addMsg && (
              <p className={`mt-3 text-sm font-medium ${addMsg.startsWith('Error') ? 'text-destructive' : 'text-foreground'}`}>
                {addMsg}
              </p>
            )}
          </div>

          {/* Fill Missing Data */}
          <div className="rounded-lg border bg-card p-6 flex flex-col justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" /> Fill Missing Data
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Fetches only the <strong>missing</strong> price rows (from last stored date to today) for all stocks
              and computes their technical indicators. Much faster than a full re-fetch.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={fillMissingData}
                disabled={filling || fillStatus.status === 'running'}
                variant="outline"
                className="w-full gap-2 h-10"
              >
                {fillStatus.status === 'running'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
                  : <><Database className="w-4 h-4" /> Fill Missing Data</>
                }
              </Button>
              <Button variant="ghost" size="sm" onClick={fetchJobStatus} className="w-full gap-2 h-8 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-3 h-3" /> Refresh Status
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2 border-t pt-3">
                {STATUS_ICONS[fillStatus.status]}
                <span className="uppercase tracking-wider font-medium">{fillStatus.status}</span>
              </div>
            </div>

            {/* Live Log */}
            {fillStatus.log.length > 0 && (
              <div
                ref={logRef}
                className="mt-4 bg-muted/30 rounded p-3 font-mono text-[10px] leading-relaxed border shadow-inner max-h-[150px] overflow-y-auto"
              >
                {fillStatus.log.map((line, i) => (
                  <div key={i} className={`${logLineColor(line)} whitespace-pre-wrap break-words mb-1`}>{line || '\u00a0'}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {/* Stocks Table */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-foreground">Registered Assets</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{stocks.length} assets</span>
                <Button variant="ghost" size="sm" onClick={fetchStocks} className="gap-1 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-3 text-destructive p-4 border-b bg-destructive/5">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Symbol</th>
                      <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Name</th>
                      <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Sector</th>
                      <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Price</th>
                      <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stocks.map(s => (
                      <tr key={s.stock_id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-5 font-semibold text-foreground">{s.symbol}</td>
                        <td className="py-3 px-5 text-muted-foreground">{s.name || '—'}</td>
                        <td className="py-3 px-5 text-muted-foreground">{s.sector || '—'}</td>
                        <td className="py-3 px-5 text-foreground">{s.current_price ? `$${s.current_price.toFixed(2)}` : '—'}</td>
                        <td className="py-3 px-5 text-right">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => deleteStock(s.symbol)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {stocks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No stocks found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
