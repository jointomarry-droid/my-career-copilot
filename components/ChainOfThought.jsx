'use client';

import React, { useState, useCallback } from 'react';
import { Brain, ChevronDown, ChevronRight, Lightbulb, Target, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, Eye, Layers, Search, Zap } from 'lucide-react';

const ChainOfThought = ({ dark, applications, profile }) => {
  const [query, setQuery] = useState('');
  const [reasoningChain, setReasoningChain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [activeMode, setActiveMode] = useState('analysis');
  const [history, setHistory] = useState([]);

  const modes = [
    { id: 'analysis', label: 'Deep Analysis', icon: Brain, desc: 'Multi-step reasoning for complex questions' },
    { id: 'decision', label: 'Decision Helper', icon: Target, desc: 'Compare options with weighted factors' },
    { id: 'prediction', label: 'Predict Outcome', icon: Lightbulb, desc: 'Forecast results based on current trajectory' },
    { id: 'strategy', label: 'Build Strategy', icon: Layers, desc: 'Create actionable plan with priorities' },
  ];

  const presetQueries = [
    'Should I apply to Google or Amazon based on my profile?',
    'What are the biggest risks in my current job search strategy?',
    'How can I improve my interview success rate?',
    'Which skill should I learn next for maximum career impact?',
    'Is it worth relocating to Germany for better opportunities?',
  ];

  const runReasoning = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: activeMode, profile, applications }),
      });
      const data = await res.json();
      if (data.success) {
        setReasoningChain(data.data);
        setHistory(prev => [{ query, timestamp: new Date(), result: data.data }, ...prev].slice(0, 10));
      }
    } catch (e) {
      console.error('Reasoning failed:', e);
    } finally {
      setLoading(false);
    }
  }, [query, activeMode, profile, applications]);

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const ReasoningStep = ({ step, index }) => {
    const isExpanded = expandedSteps[step.id];
    const statusColors = {
      gathering: 'text-blue-400 bg-blue-500/10',
      analyzing: 'text-amber-400 bg-amber-500/10',
      concluding: 'text-emerald-400 bg-emerald-500/10',
      warning: 'text-red-400 bg-red-500/10',
    };

    return (
      <div className={`relative pl-8 pb-6 ${index < (reasoningChain?.steps?.length || 0) - 1 ? 'border-l border-neutral-800 ml-3' : ''}`}>
        <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold -translate-x-1/2 ${
          statusColors[step.status] || 'text-neutral-400 bg-neutral-800'
        }`}>
          {index + 1}
        </div>
        
        <div className={`rounded-lg border transition-all ${
          dark ? 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300'
        }`}>
          <button onClick={() => toggleStep(step.id)}
            className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${statusColors[step.status] || ''}`}>
                {step.status}
              </span>
              <span className="font-medium text-sm">{step.title}</span>
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
          </button>
          
          {isExpanded && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-neutral-400">{step.explanation}</p>
              
              {step.evidence && step.evidence.length > 0 && (
                <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                  <h5 className="text-[10px] font-mono uppercase text-neutral-500 mb-2">Evidence Gathered</h5>
                  <ul className="space-y-1">
                    {step.evidence.map((e, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <Search className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {step.factorWeights && (
                <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                  <h5 className="text-[10px] font-mono uppercase text-neutral-500 mb-2">Factor Analysis</h5>
                  <div className="space-y-2">
                    {step.factorWeights.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-neutral-800 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${f.impact > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                              style={{ width: `${Math.abs(f.impact)}%` }} />
                          </div>
                          <span className={f.impact > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {f.impact > 0 ? '+' : ''}{f.impact}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {step.insight && (
                <div className={`flex items-start gap-2 p-3 rounded border-l-2 ${
                  step.status === 'warning' ? 'border-red-500 bg-red-500/5' : 'border-cyan-500 bg-cyan-500/5'
                }`}>
                  <Lightbulb className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-xs">{step.insight}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Chain-of-Thought Reasoning
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Multi-step transparent reasoning with evidence gathering</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button key={mode.id} onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeMode === mode.id
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50')
              }`}>
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a complex career question..."
              rows={2}
              className={`w-full px-4 py-3 rounded-lg text-sm border resize-none outline-none ${
                dark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border-neutral-200 placeholder-neutral-400'
              }`} />
          </div>
          <button onClick={runReasoning} disabled={loading || !query.trim()}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              loading || !query.trim()
                ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
                : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
            }`}>
            <Brain className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Thinking...' : 'Reason'}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Try:</span>
          {presetQueries.slice(0, 3).map((preset, i) => (
            <button key={i} onClick={() => setQuery(preset)}
              className="text-[11px] px-2 py-1 rounded bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
              {preset.substring(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <Brain className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-neutral-400 mt-4">Gathering evidence and analyzing...</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Step {Math.min(3, (reasoningChain?.steps?.length || 0) + 1)} of {reasoningChain?.steps?.length || '?'}</span>
          </div>
        </div>
      )}

      {reasoningChain && !loading && (
        <div className="space-y-6">
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dark ? 'bg-cyan-500/10' : 'bg-blue-50'
              }`}>
                <Eye className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium">Reasoning Overview</h3>
                <p className="text-xs text-neutral-400">{reasoningChain.query}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold text-cyan-400">{reasoningChain.confidence}%</span>
                <span className="text-[10px] text-neutral-400 block">Confidence</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold">{reasoningChain.steps?.length || 0}</span>
                <span className="text-[10px] text-neutral-400 block">Reasoning Steps</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold text-emerald-400">{reasoningChain.evidenceCount || 0}</span>
                <span className="text-[10px] text-neutral-400 block">Evidence Points</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-2xl font-bold text-amber-400">{reasoningChain.factorsAnalyzed || 0}</span>
                <span className="text-[10px] text-neutral-400 block">Factors Analyzed</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border-l-4 ${
              reasoningChain.conclusion?.type === 'positive' ? 'border-emerald-500 bg-emerald-500/5' :
              reasoningChain.conclusion?.type === 'negative' ? 'border-red-500 bg-red-500/5' :
              'border-amber-500 bg-amber-500/5'
            }`}>
              <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                {reasoningChain.conclusion?.type === 'positive' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                 reasoningChain.conclusion?.type === 'negative' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                 <Lightbulb className="w-4 h-4 text-amber-400" />}
                Conclusion
              </h4>
              <p className="text-sm">{reasoningChain.conclusion?.text}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Reasoning Chain
            </h3>
            <div className="space-y-0">
              {reasoningChain.steps?.map((step, index) => (
                <ReasoningStep key={step.id} step={step} index={index} />
              ))}
            </div>
          </div>

          {reasoningChain.alternatives && reasoningChain.alternatives.length > 0 && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                Alternative Reasoning Paths
              </h3>
              <div className="space-y-3">
                {reasoningChain.alternatives.map((alt, i) => (
                  <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{alt.title}</span>
                      <span className="text-xs text-neutral-400">{alt.confidence}% confidence</span>
                    </div>
                    <p className="text-xs text-neutral-400">{alt.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && !reasoningChain && (
        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h3 className="font-medium text-sm mb-3">Recent Reasoning</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item, i) => (
              <button key={i} onClick={() => { setQuery(item.query); setReasoningChain(item.result); }}
                className={`w-full text-left p-3 rounded flex items-center justify-between ${
                  dark ? 'bg-neutral-800/50 hover:bg-neutral-800' : 'bg-neutral-50 hover:bg-neutral-100'
                }`}>
                <span className="text-xs truncate">{item.query}</span>
                <span className="text-[10px] text-neutral-500 shrink-0 ml-2">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainOfThought;
