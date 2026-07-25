'use client';

import React, { useState, useCallback } from 'react';
import { GitBranch, RefreshCw, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, ArrowRight, Search, Lightbulb, Target } from 'lucide-react';

const CausalReasoningEngine = ({ dark, applications, profile }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  const analyzeRejection = useCallback(async (application) => {
    setLoading(true);
    setSelectedEvent(application);
    try {
      const res = await fetch('/api/reasoning/causal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: application, applications, profile }),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
    } catch (e) {
      console.error('Causal analysis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [applications, profile]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const CausalNode = ({ node, depth = 0 }) => {
    const isExpanded = expandedNodes[node.id];
    const severityColors = {
      root: 'bg-red-500/10 text-red-400 border-red-500/30',
      contributing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      mitigating: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      contextual: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    };

    return (
      <div className={`${depth > 0 ? 'ml-6 border-l border-neutral-800 pl-4' : ''}`}>
        <div className={`p-3 rounded-lg border cursor-pointer transition-all ${
          dark ? 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300'
        } ${severityColors[node.severity] || ''}`}
          onClick={() => toggleNode(node.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {node.children?.length > 0 && (
                isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                node.severity === 'root' ? 'bg-red-500/20 text-red-400' :
                node.severity === 'contributing' ? 'bg-amber-500/20 text-amber-400' :
                node.severity === 'mitigating' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-cyan-500/20 text-cyan-400'
              }`}>
                {node.severity}
              </span>
              <span className="font-medium text-sm">{node.title}</span>
            </div>
            <span className="text-xs text-neutral-400">{node.confidence}% confidence</span>
          </div>
          {node.description && (
            <p className="text-xs text-neutral-400 mt-2 ml-6">{node.description}</p>
          )}
        </div>
        {isExpanded && node.children && (
          <div className="mt-2 space-y-2">
            {node.children.map((child) => (
              <CausalNode key={child.id} node={child} depth={depth + 1} />
            ))}
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
            <GitBranch className="w-5 h-5 text-cyan-400" />
            Causal Reasoning Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Root cause analysis for rejections and outcomes</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-medium text-sm mb-3">Select Application to Analyze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {applications?.slice(0, 9).map((app, i) => (
            <button key={i} onClick={() => analyzeRejection(app)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedEvent?._id === app._id
                  ? (dark ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-blue-500 bg-blue-50')
                  : (dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50' : 'border-neutral-200 hover:border-neutral-300 bg-white')
              }`}>
              <span className="text-sm font-medium block truncate">{app.title || 'Untitled'}</span>
              <span className="text-xs text-neutral-400">{app.institution || 'Unknown'} • {app.status || 'Unknown'}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Tracing causal chain...</p>
        </div>
      )}

      {!loading && analysis && (
        <div className="space-y-6">
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium">Causal Analysis Summary</h3>
                <p className="text-xs text-neutral-400">{analysis.summary}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold text-red-400">{analysis.rootCauses || 0}</span>
                <span className="text-[10px] text-neutral-400 block">Root Causes</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold text-amber-400">{analysis.contributingFactors || 0}</span>
                <span className="text-[10px] text-neutral-400 block">Contributing</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold text-emerald-400">{analysis.mitigatingFactors || 0}</span>
                <span className="text-[10px] text-neutral-400 block">Mitigating</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              Causal Chain
            </h3>
            <div className="space-y-3">
              {analysis.causalChain?.map((node) => (
                <CausalNode key={node.id} node={node} />
              ))}
            </div>
          </div>

          {analysis.recommendations && (
            <div className={`p-5 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !analysis && (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <GitBranch className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Causal Analysis</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Select an application above to trace the root cause chain and understand 
            why specific outcomes occurred. This analysis goes beyond correlation to 
            identify actual causal relationships.
          </p>
        </div>
      )}
    </div>
  );
};

export default CausalReasoningEngine;
