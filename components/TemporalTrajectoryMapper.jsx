'use client';

import React, { useState, useCallback } from 'react';
import { TrendingUp, RefreshCw, Calendar, ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const TemporalTrajectoryMapper = ({ dark, applications, profile }) => {
  const [trajectory, setTrajectory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('2y');

  const loadTrajectory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/temporal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile, timeframe }),
      });
      const data = await res.json();
      if (data.success) setTrajectory(data.data);
    } catch (e) {
      console.error('Temporal analysis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [applications, profile, timeframe]);

  React.useEffect(() => { loadTrajectory(); }, [loadTrajectory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Temporal Trajectory Mapper
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Career trajectory projection with confidence bands</p>
        </div>
        <div className="flex gap-2">
          {['6m', '1y', '2y', '5y'].map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeframe === tf
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200')
              }`}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Projecting trajectory...</p>
        </div>
      )}

      {!loading && trajectory && (
        <>
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-4">Career Growth Projection</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectory.projection || []}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#262626' : '#e5e5e5'} />
                  <XAxis dataKey="period" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                  <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                  <ReferenceLine x="Now" stroke="#f59e0b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="actual" stroke="#06b6d4" fillOpacity={1} fill="url(#colorActual)" />
                  <Area type="monotone" dataKey="projected" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProjected)" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs">
              <span className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-500 rounded" /> Actual</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded" /> Projected</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-amber-500 rounded border-dashed" /> Current</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Growth Rate</h4>
                  <p className="text-xs text-neutral-400">Career progression speed</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-400">+{trajectory.growthRate || 0}%</span>
              <span className="text-xs text-neutral-400 block mt-1">per year projected</span>
            </div>
            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Acceleration</h4>
                  <p className="text-xs text-neutral-400">Momentum detection</p>
                </div>
              </div>
              <span className={`text-2xl font-bold ${trajectory.acceleration > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trajectory.acceleration > 0 ? '+' : ''}{trajectory.acceleration || 0}%
              </span>
              <span className="text-xs text-neutral-400 block mt-1">momentum change</span>
            </div>
            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Next Milestone</h4>
                  <p className="text-xs text-neutral-400">Projected achievement</p>
                </div>
              </div>
              <span className="text-lg font-bold">{trajectory.nextMilestone?.date || 'N/A'}</span>
              <span className="text-xs text-neutral-400 block mt-1">{trajectory.nextMilestone?.title || ''}</span>
            </div>
          </div>

          {trajectory.milestones && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-4">Trajectory Milestones</h3>
              <div className="space-y-3">
                {trajectory.milestones.map((milestone, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded ${
                    milestone.status === 'achieved' ? 'bg-emerald-500/5' :
                    milestone.status === 'current' ? 'bg-cyan-500/5' :
                    dark ? 'bg-neutral-800/50' : 'bg-neutral-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      milestone.status === 'achieved' ? 'bg-emerald-500 text-white' :
                      milestone.status === 'current' ? 'bg-cyan-500 text-neutral-900' :
                      (dark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700')
                    }`}>
                      {milestone.status === 'achieved' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{milestone.title}</span>
                      <p className="text-xs text-neutral-400">{milestone.description}</p>
                    </div>
                    <span className="text-xs text-neutral-400">{milestone.projectedDate}</span>
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

export default TemporalTrajectoryMapper;
