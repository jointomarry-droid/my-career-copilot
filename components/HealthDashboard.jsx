'use client';

import { useState, useEffect } from 'react';
import { Heart, RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const STATUS_ICONS = {
  healthy: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  degraded: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  unhealthy: <XCircle className="w-4 h-4 text-red-400" />,
  idle: <Clock className="w-4 h-4 text-neutral-400" />,
  configured: <CheckCircle className="w-4 h-4 text-cyan-400" />,
  'not-configured': <AlertTriangle className="w-4 h-4 text-yellow-400" />,
};

const STATUS_COLORS = {
  healthy: 'border-emerald-500/30 bg-emerald-500/5',
  degraded: 'border-yellow-500/30 bg-yellow-500/5',
  warning: 'border-yellow-500/30 bg-yellow-500/5',
  unhealthy: 'border-red-500/30 bg-red-500/5',
  idle: 'border-neutral-500/30 bg-neutral-500/5',
  configured: 'border-cyan-500/30 bg-cyan-500/5',
  'not-configured': 'border-yellow-500/30 bg-yellow-500/5',
};

export default function HealthDashboard({ dark }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.error('Health check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadHealth();
    setRefreshing(false);
  };

  const overallColor = {
    healthy: 'text-emerald-400',
    degraded: 'text-yellow-400',
    warning: 'text-yellow-400',
    unhealthy: 'text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Health</h2>
          <p className="text-xs text-neutral-400 mt-1">Real-time monitoring of all system components.</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono ${dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600 text-xs font-mono">Checking system health...</div>
      ) : health ? (
        <>
          <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className={`w-6 h-6 ${overallColor[health.status] || 'text-neutral-400'}`} />
                <div>
                  <h3 className="font-bold text-lg">Overall Status</h3>
                  <p className="text-xs text-neutral-400">Version {health.version} • {new Date(health.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <span className={`text-2xl font-bold font-mono uppercase ${overallColor[health.status] || 'text-neutral-400'}`}>
                {health.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(health.checks || {}).map(([name, check]) => (
              <div key={name} className={`border rounded-lg p-4 ${STATUS_COLORS[check.status] || 'border-neutral-500/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[check.status] || STATUS_ICONS.healthy}
                    <h4 className="font-bold text-sm capitalize">{name.replace(/([A-Z])/g, ' $1')}</h4>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${STATUS_COLORS[check.status]}`}>
                    {check.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  {Object.entries(check).filter(([k]) => !['status', 'message'].includes(k)).slice(0, 5).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-neutral-300">
                        {typeof val === 'boolean' ? (val ? '✓' : '✗') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>

                {check.message && (
                  <div className="mt-2 text-[10px] text-neutral-500">{check.message}</div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <XCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
          <p className="text-sm text-neutral-500">Health check failed</p>
        </div>
      )}
    </div>
  );
}
