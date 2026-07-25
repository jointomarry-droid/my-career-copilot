'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Lock, Eye, Activity, Database, FileText, Zap } from 'lucide-react';

const SecurityDashboard = ({ dark }) => {
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScan, setActiveScan] = useState(null);

  const runScan = useCallback(async (type = 'full') => {
    setLoading(true);
    setActiveScan(type);
    try {
      const res = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type }),
      });
      const data = await res.json();
      if (data.success) setScanData(data.data);
    } catch (e) {
      console.error('Security scan failed:', e);
    } finally {
      setLoading(false);
      setActiveScan(null);
    }
  }, []);

  useEffect(() => { runScan('full'); }, [runScan]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-cyan-400" />;
      case 'needs-attention': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const categoryIcons = {
    authentication: Lock,
    apiSecurity: Shield,
    inputValidation: Eye,
    headers: FileText,
    monitoring: Activity,
    dependencies: Database,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Security Command Center
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Real-time threat monitoring and vulnerability scanning</p>
        </div>
        <button onClick={() => runScan('full')} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading ? 'bg-neutral-800 text-neutral-500' : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900'
          }`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Scanning...' : 'Run Full Scan'}
        </button>
      </div>

      {scanData && (
        <>
          <div className={`p-6 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Overall Security Score</h3>
              <span className={`text-4xl font-bold ${getScoreColor(scanData.overallScore)}`}>
                {scanData.overallScore}/100
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  scanData.overallScore >= 90 ? 'bg-emerald-500' : scanData.overallScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${scanData.overallScore}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {scanData.overallScore >= 90 ? 'Excellent security posture' : scanData.overallScore >= 70 ? 'Good security with room for improvement' : 'Security needs immediate attention'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scanData.categories || {}).map(([key, cat]) => {
              const Icon = categoryIcons[key] || Shield;
              return (
                <div key={key} className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cat.status)}
                      <span className={`text-sm font-bold ${getScoreColor(cat.score)}`}>{cat.score}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {cat.findings?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-neutral-300">{f}</span>
                      </div>
                    ))}
                  </div>
                  {cat.recommendations?.length > 0 && (
                    <div className="pt-2 border-t border-neutral-800">
                      {cat.recommendations.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs mt-1.5">
                          <Zap className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                          <span className="text-neutral-400">{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-cyan-400">{scanData.metrics?.totalRequests || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Events Logged</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-emerald-400">{scanData.threats?.blocked || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Threats Blocked</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-amber-400">{scanData.metrics?.rateLimitHits || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Rate Limit Hits</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-red-400">{scanData.metrics?.unauthorizedAttempts || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Auth Failures</span>
            </div>
          </div>

          {scanData.threats?.recentIncidents?.length > 0 && (
            <div className={`p-5 rounded-lg border-l-4 border-red-500 ${dark ? 'bg-red-500/5' : 'bg-red-50'}`}>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Recent Security Incidents
              </h3>
              <div className="space-y-2">
                {scanData.threats.recentIncidents.map((incident, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-neutral-900/50">
                    <span className="text-red-400 font-mono">{incident.event}</span>
                    <span className="text-neutral-400">{incident.ip}</span>
                    <span className="text-neutral-500">{new Date(incident.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SecurityDashboard;
