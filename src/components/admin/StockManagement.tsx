import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface StockRow {
  stock_id: number;
  symbol: string;
  name: string | null;
  sector: string | null;
  current_price: number | null;
}

export function StockManagement() {
  const [stocks, setStocks]   = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [adding, setAdding]   = useState(false);
  const [addMsg, setAddMsg]   = useState('');

  const fetchStocks = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/stocks`, { headers: getHeaders(true) })
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(data => { setStocks(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(fetchStocks, []);

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
      setAddMsg(`✅ ${symbol} added! Historical data is being fetched in the background.`);
      setNewTicker('');
      fetchStocks();
    } catch (e: any) {
      setAddMsg(`❌ ${e.message}`);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground mt-1">Add or remove stocks. New stocks auto-fetch data from Yahoo Finance.</p>
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
          <p className={`mt-2 text-sm ${addMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
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
