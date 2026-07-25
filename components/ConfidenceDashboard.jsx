'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Target, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, TrendingUp, BarChart3, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ConfidenceDashboard = ({ dark, applications }) => {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const loadScores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/confidence/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications }),
      });
      const data = await res.json();
      if (data.success) setScores(data.data);
    } catch (e) {
      console.error('Failed to load confidence scores:', e);
    } finally {
      setLoading(false);
    }
  }, [applications]);

  useEffect(() => { loadScores(); }, [loadScores]);

  const getConfidenceColor = (level) => {
    if (level >= 80) return 'text-emerald-400 bg-emerald-500/10';
    if (level >= 60) return 'text-cyan-400 bg-cyan-500/10';
    if (level >= 40) return 'text-amber-400 bg-amber-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getConfidenceLabel = (level) => {
    if (level >= 80) return 'High';
    if (level >= 60) return 'Moderate';
    if (level >= 40) return 'Low';
    return 'Very Low';
  };

  const ConfidenceGauge = ({ value, label, explanation }) => {
    const rotation = (value / 100) * 180 - 90;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-16 overflow-hidden">
          <div className={`absolute inset-0 rounded-t-full border-4 border-b-0 ${
            dark ? 'border-neutral-800' : 'border-neutral-200'
          }`} />
          <div className="absolute bottom-0 left-1/2 w-1 h-16 origin-bottom bg-cyan-400 rounded-full transition-transform duration-1000"
            style={{ transform: `rotate(${rotation}deg)` }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400" />
        </div>
        <span className={`text-2xl font-bold mt-2 ${getConfidenceColor(value).split(' ')[0]}`}>{value}%</span>
        <span className="text-xs text-neutral-400">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Confidence Scorer
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Uncertainty quantification for all predictions</p>
        </div>
        <button onClick={loadScores} disabled={loading}
          className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Calculating confidence scores...</p>
        </div>
      )}

      {!loading && scores && (
        <>
          <div className={`p-6 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-6">Overall Confidence Assessment</h3>
            <div className="flex justify-center">
              <ConfidenceGauge value={scores.overall} label="Overall Confidence" />
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className={`text-lg font-bold block ${getConfidenceColor(scores.dataQuality).split(' ')[0]}`}>
                  {scores.dataQuality}%
                </span>
                <span className="text-[10px] text-neutral-400">Data Quality</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className={`text-lg font-bold block ${getConfidenceColor(scores.predictionAccuracy).split(' ')[0]}`}>
                  {scores.predictionAccuracy}%
                </span>
                <span className="text-[10px] text-neutral-400">Prediction Accuracy</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className={`text-lg font-bold block ${getConfidenceColor(scores.modelReliability).split(' ')[0]}`}>
                  {scores.modelReliability}%
                </span>
                <span className="text-[10px] text-neutral-400">Model Reliability</span>
              </div>
              <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className={`text-lg font-bold block ${getConfidenceColor(scores.dataFreshness).split(' ')[0]}`}>
                  {scores.dataFreshness}%
                </span>
                <span className="text-[10px] text-neutral-400">Data Freshness</span>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-4">Prediction Confidence Ranges</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores.predictions || []} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="metric" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                    {(scores.predictions || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.confidence >= 70 ? '#10b981' : entry.confidence >= 50 ? '#06b6d4' : entry.confidence >= 30 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.items?.map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border transition-all ${
                dark ? 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
                onMouseEnter={() => setHoveredItem(i)}
                onMouseLeave={() => setHoveredItem(null)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-neutral-400">{item.source}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${getConfidenceColor(item.confidence)}`}>
                    {item.confidence}% • {getConfidenceLabel(item.confidence)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Point Estimate</span>
                    <span className="font-medium">{item.pointEstimate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Confidence Interval</span>
                    <span className="font-medium text-cyan-400">{item.confidenceInterval}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Margin of Error</span>
                    <span className="font-medium text-amber-400">±{item.marginOfError}%</span>
                  </div>
                </div>

                {hoveredItem === item && item.explanation && (
                  <div className={`mt-3 p-3 rounded text-xs ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                    <div className="flex items-start gap-2">
                      <Info className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{item.explanation}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-neutral-500">Confidence Level</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${
                      item.confidence >= 70 ? 'bg-emerald-400' :
                      item.confidence >= 50 ? 'bg-cyan-400' :
                      item.confidence >= 30 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ width: `${item.confidence}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scores.warnings && scores.warnings.length > 0 && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Confidence Warnings
              </h3>
              <div className="space-y-2">
                {scores.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-3">How Confidence is Calculated</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-neutral-300">Data Quality:</strong> Completeness and accuracy of your profile information</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-neutral-300">Sample Size:</strong> Number of data points used for statistical analysis</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-neutral-300">Model Reliability:</strong> Historical accuracy of prediction algorithms</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-neutral-300">Data Freshness:</strong> How recent the underlying market data is</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfidenceDashboard;
