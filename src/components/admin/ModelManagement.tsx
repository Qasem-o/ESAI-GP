import { useEffect, useState, useRef } from 'react';
import { Play, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Brain, BarChart3, Terminal } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface TrainingStatus {
  status: 'idle' | 'running' | 'done' | 'error';
  started_at: string | null;
  log: string[];
}

interface PredictionRow {
  symbol: string;
  prediction_date: string;
  predicted_price: number;
  confidence: number;
  direction: string;
  change_percent: number;
  trained_at: string;
}

const STATUS_ICONS = {
  idle:    <Clock className="w-4 h-4 text-muted-foreground" />,
  running: <Loader2 className="w-4 h-4 text-foreground animate-spin" />,
  done:    <CheckCircle2 className="w-4 h-4 text-foreground" />,
  error:   <XCircle className="w-4 h-4 text-destructive" />,
};

export function ModelManagement() {
  const [status, setStatus]       = useState<TrainingStatus>({ status: 'idle', started_at: null, log: [] });
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);
  const [loading, setLoading]     = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    const r = await fetch(`${API_BASE_URL}/admin/models/status`, { headers: getHeaders(true) });
    if (r.ok) setStatus(await r.json());
  };

  const fetchPredictions = async () => {
    const r = await fetch(`${API_BASE_URL}/admin/models/predictions`, { headers: getHeaders(true) });
    if (r.ok) setPredictions(await r.json());
  };

  useEffect(() => {
    fetchStatus();
    fetchPredictions();
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [status.log]);

  // Poll while running
  useEffect(() => {
    if (status.status === 'running') {
      pollerRef.current = setInterval(() => {
        fetchStatus();
        fetchPredictions();
      }, 3000);
    } else {
      if (pollerRef.current) clearInterval(pollerRef.current);
    }
    return () => { if (pollerRef.current) clearInterval(pollerRef.current); };
  }, [status.status]);

  const startTraining = async () => {
    setLoading(true);
    await fetch(`${API_BASE_URL}/admin/models/train`, {
      method: 'POST', headers: getHeaders(true),
    });
    setLoading(false);
    fetchStatus();
  };

  const startRetrainAll = async () => {
    if (!confirm('Force retrain ALL stocks, even those already trained today? This may take a long time.')) return;
    setLoading(true);
    await fetch(`${API_BASE_URL}/admin/models/train-all`, {
      method: 'POST', headers: getHeaders(true),
    });
    setLoading(false);
    fetchStatus();
  };

  const startFillMissing = async () => {
    setLoading(true);
    await fetch(`${API_BASE_URL}/admin/stocks/fill-missing`, {
      method: 'POST', headers: getHeaders(true),
    });
    setLoading(false);
    fetchStatus();
  };

  const directionBadge = (dir: string, pct: number) => {
    const isUp = dir === 'bullish';
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground border">
        <span className="text-muted-foreground">{isUp ? '↑' : '↓'}</span> {Math.abs(pct).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Model Management Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor, train, and evaluate predictive financial models.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs font-medium uppercase tracking-wider text-muted-foreground border">
             {STATUS_ICONS[status.status]}
             <span>{status.status}</span>
             {status.started_at && status.status === 'running' && (
               <span className="ml-1 opacity-70 animate-pulse lowercase font-normal tracking-normal">since {new Date(status.started_at).toLocaleTimeString()}</span>
             )}
           </div>
           <Button variant="outline" size="sm" onClick={fetchStatus} title="Refresh Status" className="h-8 px-2">
              <RefreshCw className={`w-4 h-4 ${status.status === 'running' ? 'animate-spin' : ''}`} />
           </Button>
        </div>
      </div>

      {/* Training Control Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-lg border bg-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded bg-muted text-foreground border">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Training Command Center</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={startTraining}
                disabled={loading || status.status === 'running'}
                className="gap-2 h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
              >
                {status.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Daily Hybrid Train (Parallel)
              </Button>
              
              <Button
                variant="outline"
                onClick={startRetrainAll}
                disabled={loading || status.status === 'running'}
                className="gap-2 h-12 px-6"
              >
                <RefreshCw className="w-4 h-4" /> Force Full Retrain
              </Button>

              <Button
                variant="outline"
                onClick={startFillMissing}
                disabled={loading || status.status === 'running'}
                className="gap-2 h-12 px-6"
              >
                <Clock className="w-4 h-4" /> Fill Missing Data
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                <span><strong>LSTM:</strong> Trained weekly for feature extraction.</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                <span><strong>XGBoost:</strong> Trained daily in parallel for next-day residuals.</span>
              </div>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="rounded-lg border bg-card">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Recent Live Predictions</h2>
              <button onClick={fetchPredictions} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Asset</th>
                    <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">For Date</th>
                    <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Predicted Price</th>
                    <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Trend</th>
                    <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {predictions.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5 font-semibold text-foreground">{p.symbol}</td>
                      <td className="py-3 px-5 text-muted-foreground">{p.prediction_date}</td>
                      <td className="py-3 px-5 text-foreground">${p.predicted_price.toFixed(2)}</td>
                      <td className="py-3 px-5">{directionBadge(p.direction, p.change_percent)}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="bg-foreground h-full" style={{ width: `${Math.min(p.confidence, 100)}%` }} />
                          </div>
                          <span className="text-muted-foreground">{Math.round(p.confidence)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {predictions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No predictions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="rounded-lg border bg-card flex flex-col h-full min-h-[400px]">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Execution Logs</h2>
              <Terminal className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div
              ref={logRef}
              className="flex-1 bg-muted/30 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto"
            >
              {status.log.length > 0 ? (
                status.log.map((line, i) => (
                  <div key={i} className={`mb-1 ${
                    line.includes('❌') || line.includes('Error') ? 'text-destructive' : 
                    line.includes('✅') || line.includes('success') ? 'text-foreground font-medium' : 
                    line.includes('[FETCH]') || line.includes('[LSTM]') ? 'text-foreground' :
                    'text-muted-foreground'
                  }`}>
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                    {line}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  Waiting for activity...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
