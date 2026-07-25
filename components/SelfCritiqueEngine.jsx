'use client';

import React, { useState, useCallback } from 'react';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Eye, BarChart3, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

const SelfCritiqueEngine = ({ dark, applications, profile }) => {
  const [critique, setCritique] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [expandedItems, setExpandedItems] = useState({});

  const runCritique = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile }),
      });
      const data = await res.json();
      if (data.success) setCritique(data.data);
    } catch (e) {
      console.error('Self-critique failed:', e);
    } finally {
      setLoading(false);
    }
  }, [applications, profile]);

  const toggleItem = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const CritiqueItem = ({ item }) => {
    const isExpanded = expandedItems[item.id];
    const typeColors = {
      bias: 'bg-amber-500/10 text-amber-400',
      inconsistency: 'bg-red-500/10 text-red-400',
      assumption: 'bg-purple-500/10 text-purple-400',
      strength: 'bg-emerald-500/10 text-emerald-400',
    };

    return (
      <div className={`rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <button onClick={() => toggleItem(item.id)}
          className="w-full p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${typeColors[item.type] || ''}`}>
              {item.type}
            </span>
            <span className="font-medium text-sm">{item.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${item.severity === 'high' ? 'text-red-400' : item.severity === 'medium' ? 'text-amber-400' : 'text-neutral-400'}`}>
              {item.severity}
            </span>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs text-neutral-400">{item.description}</p>
            {item.evidence && (
              <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                <span className="text-[10px] font-mono text-neutral-500 block mb-1">EVIDENCE</span>
                <p className="text-xs">{item.evidence}</p>
              </div>
            )}
            {item.recommendation && (
              <div className={`p-3 rounded border-l-2 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
                <span className="text-[10px] font-mono text-cyan-400 block mb-1">RECOMMENDATION</span>
                <p className="text-xs">{item.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Self-Critique Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Validates analysis outputs for bias and logical consistency</p>
        </div>
        <button onClick={runCritique} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading
              ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
              : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
          }`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Run Critique'}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Critiquing analysis outputs...</p>
        </div>
      )}

      {!loading && critique && (
        <>
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                Credibility Assessment
              </h3>
              <span className={`text-2xl font-bold ${
                critique.credibilityScore >= 80 ? 'text-emerald-400' :
                critique.credibilityScore >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {critique.credibilityScore}%
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-3 mb-3">
              <div className={`h-3 rounded-full transition-all ${
                critique.credibilityScore >= 80 ? 'bg-emerald-400' :
                critique.credibilityScore >= 60 ? 'bg-amber-400' : 'bg-red-400'
              }`} style={{ width: `${critique.credibilityScore}%` }} />
            </div>
            <p className="text-xs text-neutral-400">{critique.credibilityNote}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['overview', 'biases', 'assumptions', 'strengths'].map((view) => (
              <button key={view} onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                  activeView === view
                    ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                    : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200')
                }`}>
                {view}
              </button>
            ))}
          </div>

          {activeView === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-amber-400">{critique.biasesFound || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Biases Found</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-red-400">{critique.inconsistencies || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Inconsistencies</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-purple-400">{critique.assumptionsCount || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Assumptions</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-emerald-400">{critique.strengthsCount || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Strengths</span>
                </div>
              </div>
              <div className="space-y-2">
                {critique.items?.slice(0, 5).map((item) => (
                  <CritiqueItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {activeView === 'biases' && (
            <div className="space-y-2">
              {critique.items?.filter(i => i.type === 'bias').map((item) => (
                <CritiqueItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {activeView === 'assumptions' && (
            <div className="space-y-2">
              {critique.items?.filter(i => i.type === 'assumption').map((item) => (
                <CritiqueItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {activeView === 'strengths' && (
            <div className="space-y-2">
              {critique.items?.filter(i => i.type === 'strength').map((item) => (
                <CritiqueItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !critique && (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <Shield className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Self-Critique Analysis</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            This engine critically evaluates the outputs of all analysis modules, 
            identifying biases, logical inconsistencies, unstated assumptions, and 
            areas of strength. Run a critique to validate your analysis quality.
          </p>
        </div>
      )}
    </div>
  );
};

export default SelfCritiqueEngine;
