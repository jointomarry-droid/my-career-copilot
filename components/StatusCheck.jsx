'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  RefreshCw, ExternalLink, Clock, CheckCircle2,
  XCircle, AlertCircle, Loader2, Globe
} from 'lucide-react';

const STATUS_ICONS = {
  Submitted: <Clock className="w-4 h-4 text-blue-400" />,
  'Under Review': <AlertCircle className="w-4 h-4 text-amber-400" />,
  'Interview Scheduled': <CheckCircle2 className="w-4 h-4 text-purple-400" />,
  Accepted: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  Rejected: <XCircle className="w-4 h-4 text-red-400" />,
};

const STATUS_COLORS = {
  Submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Interview Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function StatusCheck({ dark }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch status results:', e);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const runStatusCheck = async () => {
    setLoading(true);
    toast.info('Checking application statuses...');

    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        toast.success(`Checked ${data.count} applications`);
      } else {
        toast.error(data.error || 'Status check failed');
      }
    } catch (e) {
      toast.error('Failed to check statuses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Application Status Tracker</h2>
        <button
          onClick={runStatusCheck}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
            loading
              ? 'bg-neutral-600 cursor-not-allowed'
              : dark
                ? 'bg-cyan-500 hover:bg-cyan-600 text-neutral-950'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Checking...' : 'Check All Statuses'}
        </button>
      </div>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Globe className={`w-5 h-5 ${dark ? 'text-cyan-400' : 'text-blue-600'}`} />
          <h3 className="font-bold">How It Works</h3>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          The status checker visits each application portal and analyzes the page content to detect status changes.
          It looks for patterns like "application received", "under review", "interview scheduled", etc.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(STATUS_COLORS).map(([status, colors]) => (
            <div key={status} className={`flex items-center gap-2 px-3 py-2 rounded border text-xs ${colors}`}>
              {STATUS_ICONS[status]}
              {status}
            </div>
          ))}
        </div>
      </div>

      {initialLoad ? (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-400" />
          <p className="text-sm text-neutral-500">Loading status results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
          <p className="text-sm text-neutral-500">No status checks yet. Click "Check All Statuses" to start monitoring.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, i) => (
            <div
              key={result.applicationId || i}
              className={`border rounded-lg p-4 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-sm truncate">{result.title}</h4>
                    {result.detectedStatus && (
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${STATUS_COLORS[result.detectedStatus] || 'bg-neutral-500/10 text-neutral-400'}`}>
                        {result.detectedStatus}
                      </span>
                    )}
                    {result.statusUpdated && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Updated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(result.checkedAt).toLocaleString()}
                    </span>
                    {result.confidence > 0 && (
                      <span>{Math.round(result.confidence * 100)}% confidence</span>
                    )}
                    {result.error && (
                      <span className="text-red-400">{result.error}</span>
                    )}
                  </div>
                  {result.pageSnippet && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-500 mt-2 line-clamp-2">
                      {result.pageSnippet}
                    </p>
                  )}
                </div>
                {result.portalUrl && (
                  <a
                    href={result.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded ${dark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}