'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Bell, CheckCircle, Clock, TrendingDown, TrendingUp, Eye } from 'lucide-react';

const AnomalyDetectionSystem = ({ dark, applications }) => {
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications }),
      });
      const data = await res.json();
      if (data.success) setAnomalies(data.data);
    } catch (e) {
      console.error('Failed to load anomalies:', e);
    } finally {
      setLoading(false);
    }
  }, [applications]);

  useEffect(() => { loadAnomalies(); }, [loadAnomalies]);

  const severityColors = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const typeIcons = {
    success_rate: TrendingUp,
    response_time: Clock,
    rejection_pattern: TrendingDown,
    market_shift: Eye,
    deadline_conflict: AlertTriangle,
    opportunity: Bell,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cyan-400" />
            Anomaly Detection System
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Proactive monitoring for unusual patterns</p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'warning', 'positive'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200')
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Scanning for anomalies...</p>
        </div>
      )}

      {!loading && anomalies && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-red-400">{anomalies.criticalCount || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Critical</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-amber-400">{anomalies.warningCount || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Warnings</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-cyan-400">{anomalies.infoCount || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Info</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-emerald-400">{anomalies.positiveCount || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Positive</span>
            </div>
          </div>

          <div className="space-y-3">
            {anomalies.items
              ?.filter(a => filter === 'all' || a.severity === filter)
              .map((anomaly, i) => {
                const Icon = typeIcons[anomaly.type] || AlertTriangle;
                return (
                  <div key={i} className={`p-4 rounded-lg border ${severityColors[anomaly.severity] || ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${severityColors[anomaly.severity]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{anomaly.title}</h4>
                          <span className="text-xs text-neutral-400">{anomaly.timestamp}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-2">{anomaly.description}</p>
                        {anomaly.recommendation && (
                          <div className={`p-2 rounded text-xs ${dark ? 'bg-neutral-800/50' : 'bg-white'}`}>
                            <span className="text-cyan-400 font-medium">Action: </span>
                            {anomaly.recommendation}
                          </div>
                        )}
                        {anomaly.impact && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-neutral-400">Impact:</span>
                            <span className={anomaly.impact > 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {anomaly.impact > 0 ? '+' : ''}{anomaly.impact}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {anomalies.items?.length === 0 && (
            <div className={`text-center py-12 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">No anomalies detected. Everything looks normal!</p>
            </div>
          )}

          {anomalies.summary && (
            <div className={`p-5 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
              <h3 className="font-medium text-sm mb-2">Monitoring Summary</h3>
              <p className="text-sm text-neutral-300">{anomalies.summary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnomalyDetectionSystem;
