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
      <div>
        <h1 className="text-2xl font-bold">AI Model Management</h1>
        <p className="text-muted-foreground mt-1">Train models locally and view next-day price predictions</p>
      </div>

      {/* Training Control */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Training Control
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={startTraining}
            disabled={loading || status.status === 'running'}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {status.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {status.status === 'running' ? 'Training in progress...' : 'Start Training All Stocks'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchStatus} className="gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
          <div className="flex items-center gap-2 ml-auto text-sm">
            {STATUS_ICONS[status.status]}
            <span className="capitalize font-medium">{status.status}</span>
            {status.started_at && (
              <span className="text-muted-foreground">— {new Date(status.started_at).toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        {/* Log Output */}
        {status.log.length > 0 && (
          <div
            ref={logRef}
            className="bg-black/90 text-green-400 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto"
          >
            {status.log.map((line, i) => (
              <div key={i} className={line.includes('❌') || line.includes('Error') ? 'text-red-400' : line.includes('✅') ? 'text-green-400' : 'text-gray-300'}>
                {line}
              </div>
            ))}
          </div>
        )}
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
