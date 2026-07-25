'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Mail, Clock, Users, DollarSign, CheckCircle, AlertCircle, Play, Pause, Settings, Plus, Trash2, ArrowRight, TrendingUp } from 'lucide-react';

const SmartAutomation = ({ dark, applications, profile }) => {
  const [activeTab, setActiveTab] = useState('follow-ups');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const tabs = [
    { id: 'follow-ups', label: 'Auto Follow-ups', icon: Mail },
    { id: 'negotiation', label: 'Salary Negotiation', icon: DollarSign },
    { id: 'networking', label: 'Smart Networking', icon: Users },
    { id: 'scheduling', label: 'Smart Scheduling', icon: Clock },
  ];

  const loadAutomationData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automation/rules');
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to load automation data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAutomationData(); }, [loadAutomationData]);

  const toggleRule = async (ruleId) => {
    try {
      const res = await fetch('/api/automation/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, action: 'toggle' }),
      });
      if (res.ok) loadAutomationData();
    } catch (e) {
      console.error('Failed to toggle rule:', e);
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      const res = await fetch('/api/automation/rules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId }),
      });
      if (res.ok) loadAutomationData();
    } catch (e) {
      console.error('Failed to delete rule:', e);
    }
  };

  const AutoFollowUpModule = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [newRule, setNewRule] = useState({
      trigger: 'no_response_7days',
      template: 'polite_followup',
      subject: '',
      customMessage: '',
    });

    const templates = [
      { id: 'polite_followup', label: 'Polite Follow-up', desc: 'Gentle reminder about your application' },
      { id: 'value_add', label: 'Value Add', desc: 'Share relevant achievement or article' },
      { id: 'final_check', label: 'Final Check', desc: 'Last attempt before closing' },
      { id: 'custom', label: 'Custom', desc: 'Write your own template' },
    ];

    const triggers = [
      { id: 'no_response_7days', label: 'No response (7 days)' },
      { id: 'no_response_14days', label: 'No response (14 days)' },
      { id: 'interview_completed', label: 'After interview (24h)' },
      { id: 'offer_received', label: 'Offer received (48h)' },
      { id: 'custom_date', label: 'Custom date' },
    ];

    const createRule = async () => {
      try {
        const res = await fetch('/api/automation/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'follow-up',
            ...newRule,
            enabled: true,
          }),
        });
        if (res.ok) {
          setShowCreate(false);
          loadAutomationData();
        }
      } catch (e) {
        console.error('Failed to create rule:', e);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Follow-up Rules</h3>
          <button onClick={() => setShowCreate(!showCreate)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              dark ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}>
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
        </div>

        {showCreate && (
          <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <h4 className="font-medium text-sm mb-3">Create Follow-up Rule</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Trigger</label>
                <select value={newRule.trigger} onChange={(e) => setNewRule({...newRule, trigger: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}>
                  {triggers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => setNewRule({...newRule, template: t.id})}
                      className={`p-2 rounded-lg text-left text-xs border ${
                        newRule.template === t.id
                          ? (dark ? 'border-cyan-500 bg-cyan-500/10' : 'border-blue-500 bg-blue-50')
                          : (dark ? 'border-neutral-700 hover:border-neutral-600' : 'border-neutral-200 hover:border-neutral-300')
                      }`}>
                      <span className="font-medium block">{t.label}</span>
                      <span className="text-neutral-400 text-[10px]">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              {newRule.template === 'custom' && (
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Custom Message</label>
                  <textarea value={newRule.customMessage} onChange={(e) => setNewRule({...newRule, customMessage: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg text-sm border resize-none ${dark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                    placeholder="Write your follow-up message..." />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={createRule}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-neutral-900 hover:bg-cyan-400">
                  Create Rule
                </button>
                <button onClick={() => setShowCreate(false)}
                  className={`px-4 py-2 rounded-lg text-sm ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {rules.filter(r => r.type === 'follow-up').map((rule) => (
            <div key={rule._id} className={`p-4 rounded-lg border flex items-center justify-between ${
              dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  rule.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{rule.label || 'Follow-up Rule'}</h4>
                  <p className="text-xs text-neutral-400">
                    {triggers.find(t => t.id === rule.trigger)?.label} • {templates.find(t => t.id === rule.template)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">{rule.sent || 0} sent</span>
                <button onClick={() => toggleRule(rule._id)}
                  className={`p-2 rounded-lg ${rule.enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-neutral-400 hover:bg-neutral-500/10'}`}>
                  {rule.enabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteRule(rule._id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {rules.filter(r => r.type === 'follow-up').length === 0 && (
            <div className={`text-center py-8 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <Mail className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No follow-up rules configured</p>
              <p className="text-xs text-neutral-500 mt-1">Create one to automate your follow-ups</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SalaryNegotiationModule = () => {
    const [negotiations, setNegotiations] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const mockNegotiations = [
      {
        _id: '1',
        company: 'Tech Corp',
        position: 'Senior Developer',
        initialOffer: 85000,
        targetSalary: 95000,
        currentStatus: 'in_progress',
        strategy: [
          { step: 1, action: 'Research market rate', status: 'completed', detail: 'Market range: $82K-$98K' },
          { step: 2, action: 'Prepare counter-offer', status: 'completed', detail: 'Justification: 5yr experience + specialized skills' },
          { step: 3, action: 'Schedule call', status: 'in_progress', detail: 'Pending response from recruiter' },
          { step: 4, action: 'Negotiate benefits', status: 'pending', detail: 'Stock options, remote work, PTO' },
        ],
        tips: [
          'Emphasize your unique value proposition',
          'Consider total compensation (benefits, equity)',
          'Practice your pitch beforehand',
          'Get the offer in writing before negotiating',
        ],
      },
    ];

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Salary Negotiation Assistant</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockNegotiations.map((neg) => (
            <div key={neg._id} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">{neg.company}</h4>
                  <p className="text-xs text-neutral-400">{neg.position}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  neg.currentStatus === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                  neg.currentStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-neutral-500/10 text-neutral-400'
                }`}>
                  {neg.currentStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                  <span className="text-xs text-neutral-400 block">Initial</span>
                  <span className="font-bold">${(neg.initialOffer / 1000).toFixed(0)}K</span>
                </div>
                <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                  <span className="text-xs text-neutral-400 block">Target</span>
                  <span className="font-bold text-cyan-400">${(neg.targetSalary / 1000).toFixed(0)}K</span>
                </div>
                <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                  <span className="text-xs text-neutral-400 block">Increase</span>
                  <span className="font-bold text-emerald-400">+{Math.round((neg.targetSalary - neg.initialOffer) / neg.initialOffer * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {neg.strategy.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded ${
                    step.status === 'completed' ? 'bg-emerald-500/5' :
                    step.status === 'in_progress' ? 'bg-amber-500/5' :
                    dark ? 'bg-neutral-800/50' : 'bg-neutral-50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step.status === 'completed' ? 'bg-emerald-500 text-white' :
                      step.status === 'in_progress' ? 'bg-amber-500 text-white' :
                      dark ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.step}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm">{step.action}</span>
                      <p className="text-xs text-neutral-400">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-3 rounded-lg ${dark ? 'bg-cyan-500/5 border border-cyan-500/10' : 'bg-cyan-50 border border-cyan-100'}`}>
                <h5 className="text-xs font-medium text-cyan-400 mb-2">AI Tips</h5>
                <ul className="space-y-1">
                  {neg.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SmartNetworkingModule = () => {
    const suggestions = [
      {
        _id: '1',
        name: 'Sarah Chen',
        role: 'Engineering Manager at Google',
        connection: '2nd degree via John Smith',
        relevance: 92,
        reason: 'Similar background, same university',
        actions: ['Connect on LinkedIn', 'Request introduction', 'Send personalized message'],
      },
      {
        _id: '2',
        name: 'Michael Rodriguez',
        role: 'CTO at StartupX',
        connection: 'Alumni from MIT',
        relevance: 88,
        reason: 'Hiring for your target role',
        actions: ['Follow on Twitter', 'Engage with posts', 'Send connection request'],
      },
      {
        _id: '3',
        name: 'Emily Watson',
        role: 'Recruiter at Meta',
        connection: 'Worked at same company',
        relevance: 85,
        reason: 'Specializes in your industry',
        actions: ['Connect on LinkedIn', 'Share portfolio', 'Schedule coffee chat'],
      },
    ];

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Smart Networking Suggestions</h3>

        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/10`}>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Network Strength</h4>
              <p className="text-xs text-neutral-400">Your network is in the top 15% for your industry</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <span className="text-2xl font-bold block">247</span>
              <span className="text-xs text-neutral-400">Connections</span>
            </div>
            <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <span className="text-2xl font-bold block text-cyan-400">42</span>
              <span className="text-xs text-neutral-400">High-value</span>
            </div>
            <div className={`p-3 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <span className="text-2xl font-bold block text-emerald-400">8</span>
              <span className="text-xs text-neutral-400">Interviews</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((person) => (
            <div key={person._id} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    dark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium">{person.name}</h4>
                    <p className="text-xs text-neutral-400">{person.role}</p>
                    <p className="text-xs text-cyan-400 mt-0.5">{person.connection}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-cyan-400">{person.relevance}</span>
                  <span className="text-xs text-neutral-400 block">% match</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mb-3">{person.reason}</p>
              <div className="flex flex-wrap gap-2">
                {person.actions.map((action, i) => (
                  <button key={i}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      i === 0
                        ? 'bg-cyan-500 text-neutral-900 hover:bg-cyan-400'
                        : (dark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')
                    }`}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SmartSchedulingModule = () => {
    const upcomingTasks = [
      { _id: '1', task: 'Follow up with Tech Corp', deadline: '2026-07-28', priority: 'high', autoScheduled: true },
      { _id: '2', task: 'Prepare for Google interview', deadline: '2026-07-30', priority: 'high', autoScheduled: true },
      { _id: '3', task: 'Send thank you note to Meta', deadline: '2026-07-26', priority: 'medium', autoScheduled: false },
    ];

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Smart Task Scheduling</h3>

        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10`}>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">AI-Optimized Schedule</h4>
              <p className="text-xs text-neutral-400">Tasks arranged for maximum productivity</p>
            </div>
          </div>

          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div key={task._id} className={`flex items-center gap-3 p-3 rounded-lg ${
                dark ? 'bg-neutral-800/50' : 'bg-neutral-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === 'high' ? 'bg-red-400' :
                  task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div className="flex-1">
                  <span className="text-sm">{task.task}</span>
                  <p className="text-xs text-neutral-400">Due: {task.deadline}</p>
                </div>
                {task.autoScheduled && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">AI Scheduled</span>
                )}
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModule = () => {
    switch (activeTab) {
      case 'follow-ups': return <AutoFollowUpModule />;
      case 'negotiation': return <SalaryNegotiationModule />;
      case 'networking': return <SmartNetworkingModule />;
      case 'scheduling': return <SmartSchedulingModule />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Smart Automation
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Intelligent workflows for your job search</p>
        </div>
        {stats && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-400">{stats.completed || 0} completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-400">{stats.pending || 0} pending</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50')
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Loading automation rules...</p>
        </div>
      ) : (
        renderModule()
      )}
    </div>
  );
};

export default SmartAutomation;
