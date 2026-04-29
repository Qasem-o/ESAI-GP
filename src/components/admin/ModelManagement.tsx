import { useEffect, useState, useRef } from 'react';
import { Play, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Brain, BarChart3 } from 'lucide-react';
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
  idle:    <Clock className="w-5 h-5 text-muted-foreground" />,
  running: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
  done:    <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error:   <XCircle className="w-5 h-5 text-red-500" />,
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
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
        ${isUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
        {isUp ? '↑' : '↓'} {Math.abs(pct).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Model Intelligence</h1>
          <p className="text-muted-foreground mt-1">Manage the core predictive brain of EyeStocks AI</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
             status.status === 'running' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900' :
             status.status === 'done' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900' :
             status.status === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900' :
             'bg-muted/50 border-border text-muted-foreground'
           }`}>
             {STATUS_ICONS[status.status]}
             <span className="capitalize">{status.status}</span>
             {status.started_at && status.status === 'running' && (
               <span className="ml-1 opacity-70 animate-pulse">since {new Date(status.started_at).toLocaleTimeString()}</span>
             )}
           </div>
           <Button variant="outline" size="icon" onClick={fetchStatus} title="Refresh Status">
              <RefreshCw className={`w-4 h-4 ${status.status === 'running' ? 'animate-spin' : ''}`} />
           </Button>
        </div>
      </div>

      {/* Training Control Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Brain className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Training Command Center</h2>
                <p className="text-sm text-muted-foreground">Orchestrate model training pipelines</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={startTraining}
                disabled={loading || status.status === 'running'}
                className="gap-2 h-11 px-6 shadow-sm hover:shadow-md transition-all"
              >
                {status.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Daily Hybrid Train (Parallel)
              </Button>
              
              <Button
                variant="outline"
                onClick={startRetrainAll}
                disabled={loading || status.status === 'running'}
                className="gap-2 h-11 px-6 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-950/20"
              >
                <RefreshCw className="w-4 h-4" /> Force Full Retrain
              </Button>

              <Button
                variant="outline"
                onClick={startFillMissing}
                disabled={loading || status.status === 'running'}
                className="gap-2 h-11 px-6 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/20"
              >
                <Clock className="w-4 h-4" /> Fill Missing Data
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-dashed border-border/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-3 h-3" /> Architecture Notes
              </h3>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>LSTM:</strong> Trained <strong>weekly</strong> for feature extraction (heavy, sequential).</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>XGBoost:</strong> Trained <strong>daily</strong> in parallel for next-day residuals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Optimization:</strong> Only stores last 60 days (test set) + tomorrow's prediction.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col h-full">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Execution Logs
            </h2>
            
            <div
              ref={logRef}
              className="flex-1 bg-[#0a0a0a] text-gray-300 rounded-xl p-4 font-mono text-[10px] leading-relaxed border border-gray-800/60 shadow-inner custom-scrollbar"
              style={{ minHeight: '280px', maxHeight: '400px', overflowY: 'auto' }}
            >
              {status.log.length > 0 ? (
                status.log.map((line, i) => (
                  <div key={i} className={`mb-1 ${
                    line.includes('❌') || line.includes('Error') ? 'text-red-400' : 
                    line.includes('✅') || line.includes('success') ? 'text-green-400' : 
                    line.includes('[FETCH]') || line.includes('[LSTM]') ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    <span className="opacity-40 mr-2">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                    {line}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                  Waiting for activity...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Latest AI Predictions
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchPredictions} className="gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">For Date</th>
                <th className="px-4 py-3 text-left font-medium">Predicted Price</th>
                <th className="px-4 py-3 text-left font-medium">Direction</th>
                <th className="px-4 py-3 text-left font-medium">Confidence</th>
                <th className="px-4 py-3 text-left font-medium">Trained At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {predictions.map((p, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{p.symbol}</td>
                  <td className="px-4 py-3">{p.prediction_date}</td>
                  <td className="px-4 py-3 font-semibold">
                    ${p.predicted_price.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    {directionBadge(p.direction, p.change_percent)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[60px]">
                        <div
                          className="bg-primary rounded-full h-1.5"
                          style={{ width: `${Math.min(p.confidence, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.confidence.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.trained_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {predictions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No predictions yet. Run training to generate predictions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
