'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Target, Plus, Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, ChevronDown, ChevronRight, Trash2, Edit3, Zap, ArrowRight, RefreshCw } from 'lucide-react';

const AdaptivePlanner = ({ dark, applications, profile }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: '', deadline: '', category: 'skill', priority: 'high' });
  const [scenarios, setScenarios] = useState([]);
  const [activeView, setActiveView] = useState('goals');

  const categories = [
    { id: 'skill', label: 'Skill Development', icon: TrendingUp, color: 'cyan' },
    { id: 'application', label: 'Job Application', icon: Target, color: 'emerald' },
    { id: 'networking', label: 'Networking', icon: Plus, color: 'purple' },
    { id: 'interview', label: 'Interview Prep', icon: Clock, color: 'amber' },
    { id: 'relocation', label: 'Relocation', icon: ArrowRight, color: 'blue' },
  ];

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/planner/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile, action: 'load' }),
      });
      const data = await res.json();
      if (data.success) setPlan(data.data);
    } catch (e) {
      console.error('Failed to load plan:', e);
    } finally {
      setLoading(false);
    }
  }, [applications, profile]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const addGoal = async () => {
    try {
      const res = await fetch('/api/planner/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile, action: 'addGoal', goal: newGoal }),
      });
      const data = await res.json();
      if (data.success) {
        setPlan(data.data);
        setShowAddGoal(false);
        setNewGoal({ title: '', deadline: '', category: 'skill', priority: 'high' });
      }
    } catch (e) {
      console.error('Failed to add goal:', e);
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      const res = await fetch('/api/planner/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile, action: 'updateProgress', goalId, progress }),
      });
      const data = await res.json();
      if (data.success) setPlan(data.data);
    } catch (e) {
      console.error('Failed to update progress:', e);
    }
  };

  const runScenario = async (scenario) => {
    try {
      const res = await fetch('/api/planner/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, profile, action: 'scenario', scenario }),
      });
      const data = await res.json();
      if (data.success) setScenarios([...scenarios, data.data]);
    } catch (e) {
      console.error('Failed to run scenario:', e);
    }
  };

  const GoalCard = ({ goal }) => {
    const cat = categories.find(c => c.id === goal.category);
    const Icon = cat?.icon || Target;
    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <div className={`p-4 rounded-lg border transition-all cursor-pointer ${
        dark ? 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300'
      } ${selectedGoal === goal._id ? (dark ? 'border-cyan-500/50' : 'border-blue-500') : ''}`}
        onClick={() => setSelectedGoal(selectedGoal === goal._id ? null : goal._id)}>
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${cat?.color || 'cyan'}-500/10`}>
              <Icon className={`w-5 h-5 text-${cat?.color || 'cyan'}-400`} />
            </div>
            <div>
              <h4 className="font-medium text-sm">{goal.title}</h4>
              <p className="text-xs text-neutral-400">{cat?.label}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
            goal.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
            goal.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
            goal.priority === 'medium' ? 'bg-cyan-500/10 text-cyan-400' :
            'bg-neutral-500/10 text-neutral-400'
          }`}>
            {goal.priority}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Progress</span>
            <span>{goal.progress || 0}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${
              (goal.progress || 0) >= 100 ? 'bg-emerald-400' :
              (goal.progress || 0) >= 50 ? 'bg-cyan-400' :
              'bg-amber-400'
            }`} style={{ width: `${Math.min(100, goal.progress || 0)}%` }} />
          </div>
        </div>

        {daysLeft !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {goal.deadline}
            </span>
            <span className={daysLeft < 7 ? 'text-red-400' : daysLeft < 30 ? 'text-amber-400' : 'text-neutral-400'}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
            </span>
          </div>
        )}

        {selectedGoal === goal._id && goal.milestones && (
          <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
            <h5 className="text-xs font-medium text-neutral-400 mb-2">Milestones</h5>
            {goal.milestones.map((milestone, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <button onClick={(e) => { e.stopPropagation(); updateGoalProgress(goal._id, milestone.requiredProgress); }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    (goal.progress || 0) >= milestone.requiredProgress
                      ? 'bg-emerald-500 text-white'
                      : (dark ? 'bg-neutral-800 border border-neutral-700' : 'bg-neutral-100 border border-neutral-300')
                  }`}>
                  {(goal.progress || 0) >= milestone.requiredProgress && <CheckCircle className="w-3 h-3" />}
                </button>
                <span className={(goal.progress || 0) >= milestone.requiredProgress ? 'text-neutral-400 line-through' : ''}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Adaptive Career Planner
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Dynamic goal tracking with automatic adjustment</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddGoal(!showAddGoal)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
              dark ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}>
            <Plus className="w-3.5 h-3.5" />
            Add Goal
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['goals', 'timeline', 'scenarios'].map((view) => (
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

      {showAddGoal && (
        <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h3 className="font-medium text-sm mb-4">Add New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Goal Title</label>
              <input type="text" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
                placeholder="e.g., Learn React Native" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Deadline</label>
              <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Category</label>
              <select value={newGoal.category} onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Priority</label>
              <select value={newGoal.priority} onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addGoal} disabled={!newGoal.title}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-neutral-900 hover:bg-cyan-400 disabled:opacity-50">
              Add Goal
            </button>
            <button onClick={() => setShowAddGoal(false)}
              className={`px-4 py-2 rounded-lg text-sm ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Loading your career plan...</p>
        </div>
      )}

      {!loading && plan && activeView === 'goals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold block">{plan.goals?.length || 0}</span>
              <span className="text-[10px] text-neutral-400">Total Goals</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-emerald-400">{plan.goals?.filter(g => (g.progress || 0) >= 100).length || 0}</span>
              <span className="text-[10px] text-neutral-400">Completed</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-cyan-400">{plan.goals?.filter(g => (g.progress || 0) > 0 && (g.progress || 0) < 100).length || 0}</span>
              <span className="text-[10px] text-neutral-400">In Progress</span>
            </div>
            <div className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <span className="text-2xl font-bold text-amber-400">{plan.goals?.filter(g => g.priority === 'critical' || g.priority === 'high').length || 0}</span>
              <span className="text-[10px] text-neutral-400">High Priority</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.goals?.map((goal) => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>

          {plan.goals?.length === 0 && (
            <div className={`text-center py-12 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <Target className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">No goals yet. Add your first career goal!</p>
            </div>
          )}
        </div>
      )}

      {!loading && plan && activeView === 'timeline' && (
        <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h3 className="font-medium text-sm mb-4">Career Timeline</h3>
          <div className="relative">
            {plan.timeline?.map((item, i) => (
              <div key={i} className="flex items-start gap-4 pb-6 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.status === 'completed' ? 'bg-emerald-500 text-white' :
                    item.status === 'current' ? 'bg-cyan-500 text-neutral-900' :
                    (dark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700')
                  }`}>
                    {item.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < (plan.timeline?.length || 0) - 1 && (
                    <div className={`w-0.5 h-full min-h-[40px] ${dark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <span className="text-xs text-neutral-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{item.description}</p>
                  {item.impact && (
                    <span className="text-xs text-emerald-400 mt-1 inline-block">Impact: {item.impact}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && plan && activeView === 'scenarios' && (
        <div className="space-y-4">
          <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-medium text-sm mb-4">Scenario Modeling</h3>
            <p className="text-xs text-neutral-400 mb-4">Explore "what-if" scenarios to see how different choices affect your career trajectory.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'learn-ai', label: 'Learn AI/ML', impact: '+25% job prospects', icon: '🧠' },
                { id: 'relocate', label: 'Relocate to EU', impact: '+40% salary potential', icon: '✈️' },
                { id: 'startup', label: 'Join Startup', impact: '+60% equity upside', icon: '🚀' },
              ].map((scenario) => (
                <button key={scenario.id} onClick={() => runScenario(scenario)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    dark ? 'border-neutral-800 hover:border-cyan-500/30 bg-neutral-900/50' : 'border-neutral-200 hover:border-blue-300 bg-white'
                  }`}>
                  <span className="text-2xl mb-2 block">{scenario.icon}</span>
                  <h4 className="font-medium text-sm">{scenario.label}</h4>
                  <p className="text-xs text-cyan-400 mt-1">{scenario.impact}</p>
                </button>
              ))}
            </div>
          </div>

          {scenarios.length > 0 && (
            <div className="space-y-3">
              {scenarios.map((scenario, i) => (
                <div key={i} className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-medium">{scenario.title}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                      <span className="text-lg font-bold block text-cyan-400">+{scenario.salaryImpact}%</span>
                      <span className="text-[10px] text-neutral-400">Salary Impact</span>
                    </div>
                    <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                      <span className="text-lg font-bold block text-emerald-400">+{scenario.jobImpact}%</span>
                      <span className="text-[10px] text-neutral-400">Job Prospects</span>
                    </div>
                    <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                      <span className="text-lg font-bold block text-amber-400">{scenario.timeRequired}</span>
                      <span className="text-[10px] text-neutral-400">Time Required</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{scenario.analysis}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptivePlanner;
