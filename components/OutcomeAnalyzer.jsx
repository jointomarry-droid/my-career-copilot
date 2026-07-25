'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Filter, RefreshCw, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const OutcomeAnalyzer = ({ dark, applications }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [activeView, setActiveView] = useState('overview');

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/outcomes/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, timeRange }),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
    } catch (e) {
      console.error('Failed to load analysis:', e);
    } finally {
      setLoading(false);
    }
  }, [applications, timeRange]);

  useEffect(() => { loadAnalysis(); }, [loadAnalysis]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Outcome Pattern Analyzer
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Learn from rejections and successes to improve your strategy</p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 6 Months</option>
          </select>
          <button onClick={loadAnalysis} disabled={loading}
            className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Analyzing outcome patterns...</p>
        </div>
      )}

      {!loading && analysis && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['overview', 'rejections', 'successes', 'timeline'].map((view) => (
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold block">{analysis.totalApplications || 0}</span>
                  <span className="text-[10px] text-neutral-400">Total Applications</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-emerald-400">{analysis.successRate || 0}%</span>
                  <span className="text-[10px] text-neutral-400">Success Rate</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-amber-400">{analysis.avgResponseTime || 0}d</span>
                  <span className="text-[10px] text-neutral-400">Avg Response Time</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <span className="text-2xl font-bold text-cyan-400">{analysis.interviewRate || 0}%</span>
                  <span className="text-[10px] text-neutral-400">Interview Rate</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <h3 className="font-medium text-sm mb-4">Outcome Distribution</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analysis.outcomeDistribution || []} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                          {(analysis.outcomeDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {(analysis.outcomeDistribution || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-neutral-400">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <h3 className="font-medium text-sm mb-4">Response by Type</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.byType || []}>
                        <XAxis dataKey="type" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                        <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="success" fill="#10b981" name="Success" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'rejections' && (
            <div className="space-y-4">
              <div className={`p-5 rounded-lg border ${dark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
                <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Rejection Pattern Analysis
                </h3>
                <div className="space-y-3">
                  {analysis.rejectionPatterns?.map((pattern, i) => (
                    <div key={i} className={`p-4 rounded ${dark ? 'bg-neutral-900/50' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{pattern.reason}</h4>
                        <span className="text-xs text-red-400">{pattern.frequency} occurrences</span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-2">{pattern.description}</p>
                      <div className={`p-2 rounded text-xs ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                        <span className="text-cyan-400 font-medium">Recommendation:</span> {pattern.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                <h3 className="font-medium text-sm mb-4">Rejection Timeline</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.rejectionTimeline || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#262626' : '#e5e5e5'} />
                      <XAxis dataKey="month" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                      <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="rejections" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'successes' && (
            <div className="space-y-4">
              <div className={`p-5 rounded-lg border ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
                <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Success Pattern Analysis
                </h3>
                <div className="space-y-3">
                  {analysis.successPatterns?.map((pattern, i) => (
                    <div key={i} className={`p-4 rounded ${dark ? 'bg-neutral-900/50' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{pattern.factor}</h4>
                        <span className="text-xs text-emerald-400">{pattern.impact}% impact</span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-2">{pattern.description}</p>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${pattern.impact}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                <h3 className="font-medium text-sm mb-4">Top Performing Applications</h3>
                <div className="space-y-2">
                  {analysis.topApplications?.map((app, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                      <div>
                        <span className="text-sm font-medium">{app.title}</span>
                        <span className="text-xs text-neutral-400 ml-2">{app.company}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-400">{app.matchScore}% match</span>
                        <span className="text-xs text-neutral-400">{app.daysToResponse}d response</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'timeline' && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-4">Application Timeline Analysis</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.monthlyTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#262626' : '#e5e5e5'} />
                    <XAxis dataKey="month" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                    <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="submitted" fill="#06b6d4" name="Submitted" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interviews" fill="#8b5cf6" name="Interviews" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="offers" fill="#10b981" name="Offers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-cyan-500 rounded" /> Submitted</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-purple-500 rounded" /> Interviews</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded" /> Offers</span>
              </div>
            </div>
          )}

          {analysis.insights && (
            <div className={`p-5 rounded-lg border-l-4 border-cyan-500 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`}>
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Key Insights
              </h3>
              <ul className="space-y-2">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OutcomeAnalyzer;
