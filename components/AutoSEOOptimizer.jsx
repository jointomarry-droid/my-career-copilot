'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, CheckCircle, AlertTriangle, TrendingUp, FileText, Globe, Code, Zap } from 'lucide-react';

const AutoSEOOptimizer = ({ dark }) => {
  const [seoConfig, setSeoConfig] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/seo/auto-optimize');
      const data = await res.json();
      if (data.success) setSeoConfig(data.data);
    } catch (e) {
      console.error('Failed to load SEO config:', e);
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/auto-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: seoConfig?.siteUrl,
          pageContent: document.body?.innerHTML?.substring(0, 5000) || '',
          keywords: seoConfig?.defaultMeta?.keywords || [],
        }),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
    } catch (e) {
      console.error('SEO analysis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [seoConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (seoConfig) runAnalysis();
  }, [seoConfig, runAnalysis]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'meta', label: 'Meta Tags', icon: FileText },
    { id: 'schema', label: 'Schema', icon: Code },
    { id: 'fixes', label: 'Auto Fixes', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Auto SEO Optimizer
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Automatic search engine optimization and monitoring</p>
        </div>
        <button onClick={runAnalysis} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading ? 'bg-neutral-800 text-neutral-500' : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900'
          }`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {analysis && (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">SEO Score</h3>
                  <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}/100</span>
                </div>
                <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${analysis.score >= 90 ? 'bg-emerald-500' : analysis.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${analysis.score}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-xl font-bold">{analysis.analysis?.wordCount || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Words</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-xl font-bold">{analysis.analysis?.readabilityScore || 0}%</span>
                  <span className="text-[10px] text-neutral-400 block">Readability</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-xl font-bold">{analysis.analysis?.internalLinks || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Internal Links</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-xl font-bold">{analysis.recommendations?.length || 0}</span>
                  <span className="text-[10px] text-neutral-400 block">Recommendations</span>
                </div>
              </div>

              {analysis.analysis?.issues?.length > 0 && (
                <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <h3 className="font-medium text-sm mb-3">Issues Found</h3>
                  <div className="space-y-2">
                    {analysis.analysis.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        {issue.severity === 'high' ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> :
                         issue.severity === 'medium' ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> :
                         <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                        <div>
                          <span className={`font-medium ${issue.severity === 'high' ? 'text-red-400' : issue.severity === 'medium' ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {issue.type}:
                          </span>
                          <span className="ml-1 text-neutral-300">{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'meta' && seoConfig && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-4">Meta Tags Configuration</h3>
              <div className="space-y-3">
                <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                  <span className="text-[10px] text-neutral-400 block mb-1">Title ({seoConfig.defaultMeta?.title?.length || 0}/60)</span>
                  <p className="text-sm">{seoConfig.defaultMeta?.title}</p>
                </div>
                <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                  <span className="text-[10px] text-neutral-400 block mb-1">Description ({seoConfig.defaultMeta?.description?.length || 0}/160)</span>
                  <p className="text-sm">{seoConfig.defaultMeta?.description}</p>
                </div>
                <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                  <span className="text-[10px] text-neutral-400 block mb-1">Keywords</span>
                  <div className="flex flex-wrap gap-2">
                    {seoConfig.defaultMeta?.keywords?.map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{kw}</span>
                    ))}
                  </div>
                </div>
                <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                  <span className="text-[10px] text-neutral-400 block mb-1">Robots</span>
                  <p className="text-sm font-mono">Allow: {seoConfig.robots?.allow?.join(', ')} | Disallow: {seoConfig.robots?.disallow?.join(', ')}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && analysis?.structuredData && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-4">Structured Data (JSON-LD)</h3>
              <pre className={`p-4 rounded text-xs overflow-x-auto ${dark ? 'bg-neutral-800/50 text-neutral-300' : 'bg-neutral-50 text-neutral-700'}`}>
                {JSON.stringify(analysis.structuredData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'fixes' && analysis?.recommendations && (
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      rec.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{rec.action}</h4>
                      <p className="text-xs text-neutral-400 mt-1">Expected impact: {rec.impact}</p>
                    </div>
                    <span className={`ml-auto px-2 py-1 rounded text-[10px] font-medium ${
                      rec.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AutoSEOOptimizer;
