'use client';

import React, { useState, useCallback } from 'react';
import { BookOpen, RefreshCw, Copy, Download, Lightbulb, Edit3 } from 'lucide-react';

const StrategicNarrativeBuilder = ({ dark, profile, applications }) => {
  const [narrative, setNarrative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [narrativeType, setNarrativeType] = useState('growth');
  const [customAngle, setCustomAngle] = useState('');

  const narrativeTypes = [
    { id: 'growth', label: 'Growth Story', desc: 'Career progression narrative' },
    { id: 'pivot', label: 'Pivot Story', desc: 'Career change narrative' },
    { id: 'expertise', label: 'Expertise Story', desc: 'Technical authority narrative' },
    { id: 'impact', label: 'Impact Story', desc: 'Results-driven narrative' },
  ];

  const generateNarrative = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: narrativeType, profile, applications, customAngle }),
      });
      const data = await res.json();
      if (data.success) setNarrative(data.data);
    } catch (e) {
      console.error('Narrative generation failed:', e);
    } finally {
      setLoading(false);
    }
  }, [narrativeType, profile, applications, customAngle]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadNarrative = () => {
    if (!narrative) return;
    const text = `CAREER NARRATIVE - ${narrativeType.toUpperCase()}\n${'='.repeat(50)}\n\n${narrative.text}\n\n${'='.repeat(50)}\n\nKEY THEMES:\n${narrative.themes?.join('\n') || ''}\n\nUSAGE SUGGESTIONS:\n${narrative.usageSuggestions?.join('\n') || ''}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-narrative-${narrativeType}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Strategic Narrative Builder
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Create compelling career stories for interviews and branding</p>
        </div>
      </div>

      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-medium text-sm mb-4">Select Narrative Angle</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {narrativeTypes.map((type) => (
            <button key={type.id} onClick={() => setNarrativeType(type.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                narrativeType === type.id
                  ? (dark ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-blue-500 bg-blue-50')
                  : (dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50' : 'border-neutral-200 hover:border-neutral-300 bg-white')
              }`}>
              <h4 className="font-medium text-sm">{type.label}</h4>
              <p className="text-xs text-neutral-400 mt-1">{type.desc}</p>
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Custom Angle (optional)</label>
          <input type="text" value={customAngle} onChange={(e) => setCustomAngle(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
            placeholder="e.g., Focus on my transition from finance to tech..." />
        </div>
        <button onClick={generateNarrative} disabled={loading}
          className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            loading
              ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
              : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
          }`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Generate Narrative'}
        </button>
      </div>

      {!loading && narrative && (
        <>
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Generated Narrative</h3>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(narrative.text)}
                  className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={downloadNarrative}
                  className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={`p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
              {narrative.text}
            </div>
          </div>

          {narrative.themes && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Key Themes</h3>
              <div className="flex flex-wrap gap-2">
                {narrative.themes.map((theme, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {narrative.usageSuggestions && (
            <div className={`p-5 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                How to Use This Narrative
              </h3>
              <div className="space-y-2">
                {narrative.usageSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {narrative.variations && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Narrative Variations</h3>
              <div className="space-y-3">
                {narrative.variations.map((variation, i) => (
                  <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-400">{variation.context}</span>
                      <button onClick={() => copyToClipboard(variation.text)}
                        className="text-xs text-cyan-400 hover:text-cyan-300">Copy</button>
                    </div>
                    <p className="text-sm">{variation.text}</p>
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

export default StrategicNarrativeBuilder;
