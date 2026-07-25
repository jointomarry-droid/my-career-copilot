'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, Target, AlertTriangle, CheckCircle, Zap, BarChart3, Lightbulb, ArrowRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const DeepAnalysisEngine = ({ dark, applications, profile }) => {
  const [activeModule, setActiveModule] = useState('success-prediction');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const modules = [
    { id: 'success-prediction', label: 'Success Prediction', icon: Target, desc: 'AI-powered probability scoring' },
    { id: 'career-path', label: 'Career Path', icon: TrendingUp, desc: 'Optimal trajectory mapping' },
    { id: 'competitive-analysis', label: 'Competitive Intel', icon: BarChart3, desc: 'Market positioning analysis' },
    { id: 'risk-assessment', label: 'Risk Matrix', icon: AlertTriangle, desc: 'Threat & opportunity detection' },
    { id: 'skill-gap', label: 'Skill Analysis', icon: Lightbulb, desc: 'Gap identification & roadmap' },
  ];

  const runDeepAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analysis/deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: activeModule, applications, profile }),
      });
      const data = await res.json();
      if (data.success) setAnalysisResults(data.data);
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [activeModule, applications, profile]);

  useEffect(() => { runDeepAnalysis(); }, [runDeepAnalysis]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SuccessPredictionModule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analysisResults?.predictions?.map((pred, i) => (
          <div key={i} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium truncate pr-2">{pred.title}</span>
              <span className={`text-2xl font-bold ${pred.probability > 70 ? 'text-emerald-400' : pred.probability > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {pred.probability}%
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full ${pred.probability > 70 ? 'bg-emerald-400' : pred.probability > 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${pred.probability}%` }} />
            </div>
            <div className="space-y-2 text-xs">
              {pred.factors.map((f, j) => (
                <div key={j} className="flex items-center justify-between">
                  <span className="text-neutral-400">{f.name}</span>
                  <span className={f.impact > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {f.impact > 0 ? '+' : ''}{f.impact}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-3 italic">{pred.reasoning}</p>
          </div>
        ))}
      </div>
      {analysisResults?.overallInsight && (
        <div className={`p-4 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-sm mb-1">AI Insight</h4>
              <p className="text-sm text-neutral-300">{analysisResults.overallInsight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CareerPathModule = () => (
    <div className="space-y-4">
      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Optimal Career Trajectory
        </h4>
        <div className="relative">
          {analysisResults?.trajectory?.map((step, i) => (
            <div key={i} className="flex items-start gap-4 pb-6 relative">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-cyan-500 text-white' : dark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
                }`}>{i + 1}</div>
                {i < analysisResults.trajectory.length - 1 && (
                  <div className={`w-0.5 h-full min-h-[40px] ${dark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">{step.role}</h5>
                  <span className="text-xs text-neutral-400">{step.timeline}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{step.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {step.skills.map((s, j) => (
                    <span key={j} className="px-2 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-emerald-400">+{step.salaryIncrease}% salary</span>
                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs text-neutral-400">{step.probability}% likelihood</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {analysisResults?.alternativePaths && (
        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h4 className="font-medium text-sm mb-3">Alternative Paths</h4>
          <div className="space-y-2">
            {analysisResults.alternativePaths.map((path, i) => (
              <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{path.name}</span>
                  <span className="text-xs text-neutral-400">{path.match}% match</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{path.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const CompetitiveAnalysisModule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysisResults?.competitors?.map((comp, i) => (
          <div key={i} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{comp.segment}</span>
              <span className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">{comp.poolSize} candidates</span>
            </div>
            <div className="space-y-2">
              {comp.metrics.map((m, j) => (
                <div key={j} className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${m.yours > m.average ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(m.yours, 100)}%` }} />
                    </div>
                    <span className="w-16 text-right">{m.yours} / {m.average}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${comp.advantage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {comp.advantage > 0 ? '+' : ''}{comp.advantage}% advantage
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-400">Rank #{comp.rank} of {comp.poolSize}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RiskAssessmentModule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${dark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
          <h4 className="font-medium text-sm text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Threats
          </h4>
          <div className="space-y-3">
            {analysisResults?.risks?.threats?.map((threat, i) => (
              <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-900/50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{threat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    threat.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    threat.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-neutral-500/20 text-neutral-400'
                  }`}>{threat.severity}</span>
                </div>
                <p className="text-xs text-neutral-400">{threat.description}</p>
                <p className="text-xs text-cyan-400 mt-2">Mitigation: {threat.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
          <h4 className="font-medium text-sm text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Opportunities
          </h4>
          <div className="space-y-3">
            {analysisResults?.risks?.opportunities?.map((opp, i) => (
              <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-900/50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{opp.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    opp.impact === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                    opp.impact === 'medium' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-neutral-500/20 text-neutral-400'
                  }`}>{opp.impact}</span>
                </div>
                <p className="text-xs text-neutral-400">{opp.description}</p>
                <p className="text-xs text-emerald-400 mt-2">Action: {opp.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SkillGapModule = () => (
    <div className="space-y-4">
      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Skill Gap Analysis
        </h4>
        <div className="space-y-3">
          {analysisResults?.skillGaps?.map((gap, i) => (
            <div key={i} className={`p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{gap.skill}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Current: {gap.current}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500" />
                  <span className="text-xs text-cyan-400">Target: {gap.target}</span>
                </div>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5 mb-2">
                <div className="h-1.5 rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${(gap.current / gap.target) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{gap.importance} importance</span>
                <span className="text-amber-400">{gap.estimatedTime} to master</span>
              </div>
              {gap.resources && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {gap.resources.map((r, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">{r}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {analysisResults?.learningPath && (
        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h4 className="font-medium text-sm mb-3">Recommended Learning Path</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {analysisResults.learningPath.map((step, i) => (
              <React.Fragment key={i}>
                <div className={`shrink-0 p-3 rounded-lg text-center min-w-[120px] ${
                  dark ? 'bg-neutral-800' : 'bg-neutral-100'
                }`}>
                  <span className="text-xs text-neutral-400 block">Week {step.week}</span>
                  <span className="text-sm font-medium block mt-1">{step.topic}</span>
                  <span className="text-[10px] text-cyan-400 block mt-1">{step.duration}</span>
                </div>
                {i < analysisResults.learningPath.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderModule = () => {
    switch (activeModule) {
      case 'success-prediction': return <SuccessPredictionModule />;
      case 'career-path': return <CareerPathModule />;
      case 'competitive-analysis': return <CompetitiveAnalysisModule />;
      case 'risk-assessment': return <RiskAssessmentModule />;
      case 'skill-gap': return <SkillGapModule />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Deep Analysis Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Advanced AI reasoning for career optimization</p>
        </div>
        <button onClick={runDeepAnalysis} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white'
          } disabled:opacity-50`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeModule === mod.id
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50')
              }`}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{mod.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Running deep analysis...</p>
        </div>
      ) : analysisResults ? (
        renderModule()
      ) : (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <Brain className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Click "Run Analysis" to generate insights</p>
        </div>
      )}
    </div>
  );
};

export default DeepAnalysisEngine;
