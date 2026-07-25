'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Target, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const CalibrationTracker = ({ dark, applications }) => {
  const [calibration, setCalibration] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCalibration = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications }),
      });
      const data = await res.json();
      if (data.success) setCalibration(data.data);
    } catch (e) {
      console.error('Failed to load calibration:', e);
    } finally {
      setLoading(false);
    }
  }, [applications]);

  useEffect(() => { loadCalibration(); }, [loadCalibration]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Calibration Tracker
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Prediction accuracy tracking and model adjustment</p>
        </div>
        <button onClick={loadCalibration} disabled={loading}
          className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Loading calibration data...</p>
        </div>
      )}

      {!loading && calibration && (
        <>
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-4">Prediction Calibration Curve</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calibration.curve || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#262626' : '#e5e5e5'} />
                  <XAxis dataKey="predicted" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} label={{ value: 'Predicted %', position: 'bottom', offset: -5 }} />
                  <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} label={{ value: 'Actual %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: dark ? '#171717' : '#ffffff', border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`, borderRadius: '8px', fontSize: '12px' }} />
                  <ReferenceLine y={0} stroke={dark ? '#404040' : '#d4d4d4'} />
                  <ReferenceLine y={100} stroke={dark ? '#404040' : '#d4d4d4'} />
                  <Line type="monotone" dataKey="ideal" stroke="#525252" strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs">
              <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-neutral-500 border-dashed" /> Perfect Calibration</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-500 rounded" /> Your Predictions</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className={`text-2xl font-bold ${calibration.overallAccuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {calibration.overallAccuracy || 0}%
              </span>
              <span className="text-[10px] text-neutral-400 block">Overall Accuracy</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className={`text-2xl font-bold ${calibration.bias > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {calibration.bias > 0 ? '+' : ''}{calibration.bias || 0}%
              </span>
              <span className="text-[10px] text-neutral-400 block">Systematic Bias</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-cyan-400">{calibration.calibrationScore || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Calibration Score</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold">{calibration.totalPredictions || 0}</span>
              <span className="text-[10px] text-neutral-400 block">Predictions Tracked</span>
            </div>
          </div>

          {calibration.insights && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Calibration Insights</h3>
              <div className="space-y-3">
                {calibration.insights.map((insight, i) => (
                  <div key={i} className={`p-3 rounded flex items-start gap-3 ${
                    insight.type === 'positive' ? 'bg-emerald-500/5' :
                    insight.type === 'warning' ? 'bg-amber-500/5' :
                    'bg-neutral-800/50'
                  }`}>
                    {insight.type === 'positive' ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> :
                     insight.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> :
                     <BarChart3 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-sm">{insight.text}</p>
                      {insight.adjustment && (
                        <p className="text-xs text-cyan-400 mt-1">Adjustment: {insight.adjustment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {calibration.recentPredictions && (
            <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Recent Predictions vs Outcomes</h3>
              <div className="space-y-2">
                {calibration.recentPredictions.map((pred, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                    <div>
                      <span className="text-sm">{pred.metric}</span>
                      <span className="text-xs text-neutral-400 ml-2">{pred.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span> Predicted: {pred.predicted}%</span>
                      <span>Actual: {pred.actual}%</span>
                      <span className={pred误差 < 10 ? 'text-emerald-400' : 'text-amber-400'}>
                        {pred.error < 0 ? '' : '+'}{pred.error}% error
                      </span>
                    </div>
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

export default CalibrationTracker;
