'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Filter, RefreshCw } from 'lucide-react';

const CATEGORY_COLORS = {
  application: 'bg-indigo-500/10 text-indigo-400',
  discovery: 'bg-cyan-500/10 text-cyan-400',
  campaign: 'bg-emerald-500/10 text-emerald-400',
  profile: 'bg-amber-500/10 text-amber-400',
  agent: 'bg-purple-500/10 text-purple-400',
  notification: 'bg-pink-500/10 text-pink-400',
  export: 'bg-orange-500/10 text-orange-400',
  system: 'bg-red-500/10 text-red-400',
};

const SEVERITY_COLORS = {
  info: 'text-neutral-300',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  critical: 'text-red-500 font-bold',
};

export default function AuditTrail({ dark }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit?limit=100');
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadAuditLogs();
    setRefreshing(false);
  };

  const filtered = categoryFilter === 'all' ? logs : logs.filter(l => l.category === categoryFilter);
  const categories = [...new Set(logs.map(l => l.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-xs text-neutral-400 mt-1">Complete activity log for compliance and monitoring.</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono ${dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 text-xs font-mono flex-wrap">
        <button onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded transition-colors ${categoryFilter === 'all' ? (dark ? 'bg-neutral-800 text-white' : 'bg-neutral-200') : 'text-neutral-400 hover:text-white'}`}>
          All ({logs.length})
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded transition-colors ${categoryFilter === cat ? (dark ? 'bg-neutral-800 text-white' : 'bg-neutral-200') : 'text-neutral-400 hover:text-white'}`}>
            {cat} ({logs.filter(l => l.category === cat).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600 text-xs font-mono">Loading audit trail...</div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <ClipboardList className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
          <p className="text-sm text-neutral-500">No audit logs found.</p>
        </div>
      ) : (
        <div className={`border rounded-lg overflow-hidden ${dark ? 'border-neutral-900' : 'border-neutral-200'}`}>
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.map((log) => (
              <div key={log._id} className={`flex items-start gap-3 p-4 border-b last:border-b-0 ${dark ? 'border-neutral-900/50 hover:bg-[#0F0F11]' : 'border-neutral-100 hover:bg-neutral-50'}`}>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${CATEGORY_COLORS[log.category] || 'bg-neutral-500/10 text-neutral-400'}`}>
                  {log.category}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{log.action}</span>
                    {log.targetType && (
                      <span className="text-[10px] text-neutral-500 font-mono">{log.targetType}:{log.targetId}</span>
                    )}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-1 text-[10px] font-mono text-neutral-500 truncate">
                      {Object.entries(log.details).slice(0, 3).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' | ')}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-mono ${SEVERITY_COLORS[log.severity] || 'text-neutral-400'}`}>{log.severity}</span>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
