'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Trash2, Bell, ArrowUpRight } from 'lucide-react';

const DEFAULT_DEADLINES = [
  { id: '1', title: 'DAAD Scholarship', institution: 'DAAD', deadline: '2026-10-15', type: 'scholarship', priority: 'high', status: 'pending' },
  { id: '2', title: 'Chevening Fellowship', institution: 'UK Government', deadline: '2026-11-01', type: 'scholarship', priority: 'high', status: 'pending' },
  { id: '3', title: 'ASML Software Engineer', institution: 'ASML', deadline: '2026-08-30', type: 'job', priority: 'medium', status: 'applied' },
  { id: '4', title: 'German Blue Card', institution: 'Auslanderbehorde', deadline: '2026-12-01', type: 'permit', priority: 'high', status: 'pending' },
];

function getDaysRemaining(deadline) {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getUrgencyColor(days) {
  if (days < 0) return { bg: 'bg-neutral-800', text: 'text-neutral-500', label: 'Expired' };
  if (days <= 3) return { bg: 'bg-red-500/10', text: 'text-red-400', label: `${days}d left` };
  if (days <= 7) return { bg: 'bg-amber-500/10', text: 'text-amber-400', label: `${days}d left` };
  if (days <= 30) return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', label: `${days}d left` };
  return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: `${days}d left` };
}

function getPriorityColor(p) {
  if (p === 'high') return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (p === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20';
}

function getTypeIcon(t) {
  if (t === 'scholarship') return '🎓';
  if (t === 'job') return '💼';
  if (t === 'permit') return '🛂';
  return '📋';
}

export default function DeadlineTracker({ dark }) {
  const [deadlines, setDeadlines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newDeadline, setNewDeadline] = useState({ title: '', institution: '', deadline: '', type: 'job', priority: 'medium' });

  useEffect(() => {
    const stored = localStorage.getItem('copilot_deadlines');
    if (stored) {
      setDeadlines(JSON.parse(stored));
    } else {
      setDeadlines(DEFAULT_DEADLINES);
      localStorage.setItem('copilot_deadlines', JSON.stringify(DEFAULT_DEADLINES));
    }
  }, []);

  const saveDeadlines = useCallback((dl) => {
    setDeadlines(dl);
    localStorage.setItem('copilot_deadlines', JSON.stringify(dl));
  }, []);

  const addDeadline = () => {
    if (!newDeadline.title || !newDeadline.deadline) return;
    const updated = [...deadlines, { ...newDeadline, id: Date.now().toString(), status: 'pending' }];
    saveDeadlines(updated);
    setNewDeadline({ title: '', institution: '', deadline: '', type: 'job', priority: 'medium' });
    setShowForm(false);
  };

  const deleteDeadline = (id) => {
    saveDeadlines(deadlines.filter(d => d.id !== id));
  };

  const toggleStatus = (id) => {
    const updated = deadlines.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'pending' ? 'applied' : d.status === 'applied' ? 'accepted' : 'pending';
        return { ...d, status: nextStatus };
      }
      return d;
    });
    saveDeadlines(updated);
  };

  const filtered = deadlines.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return getDaysRemaining(d.deadline) <= 7 && getDaysRemaining(d.deadline) >= 0;
    if (filter === 'pending') return d.status === 'pending';
    return d.type === filter;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const stats = {
    total: deadlines.length,
    pending: deadlines.filter(d => d.status === 'pending').length,
    urgent: deadlines.filter(d => { const days = getDaysRemaining(d.deadline); return days >= 0 && days <= 7; }).length,
    applied: deadlines.filter(d => d.status === 'applied').length,
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-amber-500/10' : 'bg-amber-500/10'}`}>
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Deadline Tracker</h2>
            <p className="text-xs text-neutral-400">Never miss an application deadline</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'}`}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} icon="📋" dark={dark} />
        <StatCard label="Pending" value={stats.pending} icon="⏳" dark={dark} />
        <StatCard label="Urgent (≤7d)" value={stats.urgent} icon="🔥" highlight={stats.urgent > 0} dark={dark} />
        <StatCard label="Applied" value={stats.applied} icon="✅" dark={dark} />
      </div>

      {showForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Title" value={newDeadline.title} onChange={e => setNewDeadline(p => ({ ...p, title: e.target.value }))} className={inputClass} />
            <input placeholder="Institution" value={newDeadline.institution} onChange={e => setNewDeadline(p => ({ ...p, institution: e.target.value }))} className={inputClass} />
            <input type="date" value={newDeadline.deadline} onChange={e => setNewDeadline(p => ({ ...p, deadline: e.target.value }))} className={inputClass} />
            <div className="flex gap-2">
              <select value={newDeadline.type} onChange={e => setNewDeadline(p => ({ ...p, type: e.target.value }))} className={inputClass}>
                <option value="job">Job</option>
                <option value="scholarship">Scholarship</option>
                <option value="permit">Work Permit</option>
              </select>
              <select value={newDeadline.priority} onChange={e => setNewDeadline(p => ({ ...p, priority: e.target.value }))} className={inputClass}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addDeadline} className="px-4 py-2 rounded text-xs font-mono font-bold bg-amber-500 text-neutral-900 hover:bg-amber-400 transition-colors">
              Save Deadline
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'urgent', 'pending', 'job', 'scholarship', 'permit'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filter === f
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : dark ? 'text-neutral-500 hover:text-neutral-300 border border-neutral-800' : 'text-neutral-500 hover:text-neutral-700 border border-neutral-200'
            }`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`text-center py-8 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
            <p className="text-sm text-neutral-500">No deadlines found.</p>
          </div>
        )}
        {filtered.map(d => {
          const days = getDaysRemaining(d.deadline);
          const urgency = getUrgencyColor(days);
          return (
            <div key={d.id} className={`flex items-center gap-4 p-4 rounded border transition-colors ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
              <span className="text-xl">{getTypeIcon(d.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold truncate">{d.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getPriorityColor(d.priority)}`}>{d.priority}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{d.institution}</p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xs font-mono px-2 py-1 rounded ${urgency.bg} ${urgency.text}`}>{urgency.label}</div>
                <p className="text-[10px] text-neutral-500 mt-1">{new Date(d.deadline).toLocaleDateString()}</p>
              </div>
              <button onClick={() => toggleStatus(d.id)}
                className={`shrink-0 p-2 rounded transition-colors ${
                  d.status === 'applied' ? 'text-emerald-400' : d.status === 'accepted' ? 'text-cyan-400' : 'text-neutral-500 hover:text-amber-400'
                }`}>
                {d.status === 'applied' ? <CheckCircle className="w-4 h-4" /> : d.status === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </button>
              <button onClick={() => deleteDeadline(d.id)} className="shrink-0 p-2 rounded text-neutral-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight, dark }) {
  return (
    <div className={`p-3 rounded border text-center ${highlight ? 'border-amber-500/30 bg-amber-500/5' : dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
      <span className="text-lg">{icon}</span>
      <span className={`text-xl font-bold block ${highlight ? 'text-amber-400' : ''}`}>{value}</span>
      <span className="text-[10px] font-mono uppercase text-neutral-400">{label}</span>
    </div>
  );
}
