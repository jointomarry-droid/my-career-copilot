'use client';

import React, { useState, useCallback } from 'react';
import { MessageSquare, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Edit3, Copy, Lightbulb } from 'lucide-react';

const CommunicationSentimentAnalyzer = ({ dark, profile }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [analysisType, setAnalysisType] = useState('cover-letter');

  const analysisTypes = [
    { id: 'cover-letter', label: 'Cover Letter' },
    { id: 'email', label: 'Email' },
    { id: 'resume-bullet', label: 'Resume Bullet' },
    { id: 'linkedin', label: 'LinkedIn Post' },
  ];

  const analyzeText = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: analysisType, profile }),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
    } catch (e) {
      console.error('Sentiment analysis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [text, analysisType, profile]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Communication Sentiment Analyzer
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Linguistic analysis of your communications</p>
        </div>
      </div>

      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <div className="flex gap-2 mb-4">
          {analysisTypes.map((type) => (
            <button key={type.id} onClick={() => setAnalysisType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                analysisType === type.id
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-neutral-100 text-neutral-600 border border-neutral-200')
              }`}>
              {type.label}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 rounded-lg text-sm border resize-none outline-none ${
            dark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border-neutral-200 placeholder-neutral-400'
          }`}
          placeholder="Paste your text here for analysis..." />
        <button onClick={analyzeText} disabled={loading || !text.trim()}
          className={`mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            loading || !text.trim()
              ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
              : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
          }`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </div>

      {!loading && analysis && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.sentiment?.score || 0)}`}>
                {analysis.sentiment?.score || 0}%
              </span>
              <span className="text-[10px] text-neutral-400 block">Sentiment Score</span>
              <span className={`text-[10px] ${analysis.sentiment?.label === 'positive' ? 'text-emerald-400' : analysis.sentiment?.label === 'negative' ? 'text-red-400' : 'text-amber-400'}`}>
                {analysis.sentiment?.label || 'neutral'}
              </span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.persuasiveness || 0)}`}>
                {analysis.persuasiveness || 0}%
              </span>
              <span className="text-[10px] text-neutral-400 block">Persuasiveness</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.tone?.consistency || 0)}`}>
                {analysis.tone?.consistency || 0}%
              </span>
              <span className="text-[10px] text-neutral-400 block">Tone Consistency</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.atsScore || 0)}`}>
                {analysis.atsScore || 0}%
              </span>
              <span className="text-[10px] text-neutral-400 block">ATS Friendliness</span>
            </div>
          </div>

          {analysis.metrics && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Detailed Metrics</h3>
              <div className="space-y-3">
                {Object.entries(analysis.metrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{value}/100</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${value >= 80 ? 'bg-emerald-400' : value >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.suggestions && (
            <div className={`p-5 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                Improvement Suggestions
              </h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.keywords && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Keyword Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((kw, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    kw.status === 'strong' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    kw.status === 'missing' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {kw.word} {kw.count > 0 && `(${kw.count})`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunicationSentimentAnalyzer;
