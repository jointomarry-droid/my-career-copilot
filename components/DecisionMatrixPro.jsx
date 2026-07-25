'use client';

import React, { useState, useCallback } from 'react';
import { Scale, Plus, Trash2, RefreshCw, BarChart3, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DecisionMatrixPro = ({ dark, applications }) => {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([
    { id: 1, name: 'Option A', scores: {} },
    { id: 2, name: 'Option B', scores: {} },
  ]);
  const [criteria, setCriteria] = useState([
    { id: 1, name: 'Salary', weight: 30 },
    { id: 2, name: 'Growth Potential', weight: 25 },
    { id: 3, name: 'Work-Life Balance', weight: 20 },
    { id: 4, name: 'Location', weight: 15 },
    { id: 5, name: 'Culture Fit', weight: 10 },
  ]);
  const [showSensitivity, setShowSensitivity] = useState(false);

  const addCriterion = () => {
    setCriteria([...criteria, { id: Date.now(), name: '', weight: 10 }]);
  };

  const removeCriterion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriterion = (id, field, value) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addOption = () => {
    setOptions([...options, { id: Date.now(), name: `Option ${String.fromCharCode(65 + options.length)}`, scores: {} }]);
  };

  const removeOption = (id) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOptionName = (id, name) => {
    setOptions(options.map(o => o.id === id ? { ...o, name } : o));
  };

  const updateScore = (optionId, criterionId, score) => {
    setOptions(options.map(o => 
      o.id === optionId ? { ...o, scores: { ...o.scores, [criterionId]: parseInt(score) || 0 } } : o
    ));
  };

  const calculateMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options, criteria }),
      });
      const data = await res.json();
      if (data.success) setMatrix(data.data);
    } catch (e) {
      console.error('Decision matrix calculation failed:', e);
    } finally {
      setLoading(false);
    }
  }, [options, criteria]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            Decision Matrix Pro
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Multi-criteria decision analysis with sensitivity</p>
        </div>
        <button onClick={calculateMatrix} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading
              ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
              : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
          }`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Decision Criteria</h3>
            <button onClick={addCriterion}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {criteria.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input type="text" value={c.name} onChange={(e) => updateCriterion(c.id, 'name', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
                  placeholder="Criterion name" />
                <input type="number" value={c.weight} onChange={(e) => updateCriterion(c.id, 'weight', parseInt(e.target.value) || 0)}
                  className={`w-20 px-3 py-2 rounded-lg text-sm border text-center ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
                  min="0" max="100" />
                <span className="text-xs text-neutral-400">%</span>
                <button onClick={() => removeCriterion(c.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-400">
            Total weight: {criteria.reduce((s, c) => s + (c.weight || 0), 0)}%
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Options to Compare</h3>
            <button onClick={addOption}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {options.map((opt) => (
              <div key={opt.id} className={`p-3 rounded-lg ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <input type="text" value={opt.name} onChange={(e) => updateOptionName(opt.id, e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
                    placeholder="Option name" />
                  <button onClick={() => removeOption(opt.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {criteria.map((c) => (
                    <div key={c.id} className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400 w-16 truncate">{c.name}</span>
                      <input type="number" value={opt.scores[c.id] || ''}
                        onChange={(e) => updateScore(opt.id, c.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-xs border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
                        min="0" max="10" placeholder="0-10" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {matrix && (
        <div className="space-y-6">
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Decision Results
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matrix.results || []}>
                  <XAxis dataKey="name" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                  <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="weightedScore" radius={[4, 4, 0, 0]}>
                    {(matrix.results || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : index === 1 ? '#8b5cf6' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-5 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
            <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              Recommendation
            </h3>
            <p className="text-sm">{matrix.recommendation}</p>
            {matrix.confidence && (
              <span className="text-xs text-neutral-400 mt-2 block">Confidence: {matrix.confidence}%</span>
            )}
          </div>

          {matrix.sensitivity && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <button onClick={() => setShowSensitivity(!showSensitivity)}
                className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Sensitivity Analysis
                <span className="text-xs text-neutral-400">(How much would weights need to change to flip the result?)</span>
              </button>
              {showSensitivity && (
                <div className="mt-4 space-y-2">
                  {matrix.sensitivity.map((s, i) => (
                    <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{s.criterion}</span>
                        <span className="text-xs text-amber-400">{s.threshold}% weight needed</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{s.impact}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DecisionMatrixPro;
