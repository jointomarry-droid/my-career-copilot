'use client';

import React, { useState, useCallback } from 'react';
import { Layers, RefreshCw, Download, AlertTriangle, CheckCircle, TrendingUp, Target, ArrowRight, Zap, Brain, BarChart3 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const SynthesisEngine = ({ dark, applications, profile }) => {
  const [synthesisReport, setSynthesisReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  const runSynthesis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/synthesis/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile }),
      });
      const data = await res.json();
      if (data.success) setSynthesisReport(data.data);
    } catch (e) {
      console.error('Synthesis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [applications, profile]);

  const exportReport = () => {
    if (!synthesisReport) return;
    const text = `
AI CAREER COPILOT - CROSS-MODULE SYNTHESIS REPORT
Generated: ${new Date().toLocaleString()}
${'='.repeat(50)}

EXECUTIVE SUMMARY
${synthesisReport.executiveSummary}

KEY FINDINGS
${synthesisReport.keyFindings.map((f, i) => `${i + 1}. ${f.title}: ${f.description}`).join('\n')}

STRATEGIC RECOMMENDATIONS
${synthesisReport.recommendations.map((r, i) => `${i + 1}. [${r.priority}] ${r.action}\n   Expected Impact: ${r.impact}\n   Timeline: ${r.timeline}`).join('\n\n')}

MODULE CONFLICTS
${synthesisReport.conflicts.map(c => `- ${c.module1} vs ${c.module2}: ${c.description}`).join('\n')}

CONFIDENCE SCORE: ${synthesisReport.overallConfidence}%
    `.trim();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthesis-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Cross-Module Synthesis
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Unified intelligence from all analysis modules</p>
        </div>
        <div className="flex gap-2">
          {synthesisReport && (
            <button onClick={exportReport}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}>
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
          <button onClick={runSynthesis} disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              loading
                ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
                : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
            }`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Synthesizing...' : 'Run Synthesis'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <Layers className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-neutral-400 mt-4">Synthesizing data from all modules...</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Deep Analysis</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Market Intel</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Skill Gaps</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Career Path</span>
          </div>
        </div>
      )}

      {!synthesisReport && !loading && (
        <div className={`text-center py-16 border rounded-lg ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <Layers className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Cross-Module Intelligence</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mb-6">
            This engine combines insights from Deep Analysis, Market Intelligence, Skill Gaps, 
            Career Path, and Risk Assessment to generate a unified strategy report.
          </p>
          <button onClick={runSynthesis}
            className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-medium transition-all">
            Generate Synthesis Report
          </button>
        </div>
      )}

      {synthesisReport && !loading && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['overview', 'findings', 'strategy', 'conflicts'].map((view) => (
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
            <div className="space-y-6">
              <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  Executive Summary
                </h3>
                <p className="text-sm leading-relaxed">{synthesisReport.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <h3 className="font-medium text-sm mb-4">Module Health Scores</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={synthesisReport.moduleScores || []}>
                        <PolarGrid stroke={dark ? '#262626' : '#e5e5e5'} />
                        <PolarAngleAxis dataKey="module" tick={{ fontSize: 10, fill: dark ? '#a3a3a3' : '#737373' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                        <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <h3 className="font-medium text-sm mb-4">Priority Matrix</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={synthesisReport.priorityMatrix || []}>
                        <XAxis dataKey="action" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 9 }} />
                        <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: dark ? '#171717' : '#ffffff',
                            border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="impact" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="effort" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-cyan-500 rounded" /> Impact</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-purple-500 rounded" /> Effort</span>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-lg border ${dark ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-cyan-200 bg-cyan-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Overall Confidence
                  </h3>
                  <span className="text-2xl font-bold text-cyan-400">{synthesisReport.overallConfidence}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                    style={{ width: `${synthesisReport.overallConfidence}%` }} />
                </div>
                <p className="text-xs text-neutral-400 mt-2">{synthesisReport.confidenceNote}</p>
              </div>
            </div>
          )}

          {activeView === 'findings' && (
            <div className="space-y-4">
              {synthesisReport.keyFindings?.map((finding, i) => (
                <div key={i} className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        finding.type === 'opportunity' ? 'bg-emerald-500/10 text-emerald-400' :
                        finding.type === 'risk' ? 'bg-red-500/10 text-red-400' :
                        'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {finding.type === 'opportunity' ? <TrendingUp className="w-5 h-5" /> :
                         finding.type === 'risk' ? <AlertTriangle className="w-5 h-5" /> :
                         <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{finding.title}</h4>
                        <p className="text-xs text-neutral-400">Source: {finding.source}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-mono ${
                      finding.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                      finding.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-neutral-500/10 text-neutral-400'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 mb-3">{finding.description}</p>
                  {finding.evidence && (
                    <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                      <p className="text-xs text-neutral-400">{finding.evidence}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeView === 'strategy' && (
            <div className="space-y-4">
              {synthesisReport.recommendations?.map((rec, i) => (
                <div key={i} className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      rec.priority === 'critical' ? 'bg-red-500 text-white' :
                      rec.priority === 'high' ? 'bg-amber-500 text-white' :
                      rec.priority === 'medium' ? 'bg-cyan-500 text-neutral-900' :
                      (dark ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-700')
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.action}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          rec.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
                          rec.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 mb-3">{rec.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <TrendingUp className="w-3 h-3" /> {rec.impact}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Target className="w-3 h-3" /> {rec.timeline}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <BarChart3 className="w-3 h-3" /> {rec.effort} effort
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'conflicts' && (
            <div className="space-y-4">
              {synthesisReport.conflicts?.length > 0 ? (
                synthesisReport.conflicts.map((conflict, i) => (
                  <div key={i} className={`p-5 rounded-lg border ${dark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <h4 className="font-medium">{conflict.module1} vs {conflict.module2}</h4>
                    </div>
                    <p className="text-sm text-neutral-300 mb-3">{conflict.description}</p>
                    <div className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-white'}`}>
                      <p className="text-xs text-cyan-400 font-medium mb-1">Resolution:</p>
                      <p className="text-xs text-neutral-400">{conflict.resolution}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-400">No conflicts detected between modules</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SynthesisEngine;
