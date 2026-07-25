'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, Circle, CheckCircle, XCircle, AlertCircle, ArrowRight, Calendar, Filter, ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
  discovered: { color: 'bg-neutral-500', icon: Circle, label: 'Discovered' },
  queued: { color: 'bg-cyan-500', icon: Clock, label: 'Queued' },
  applying: { color: 'bg-amber-500', icon: AlertCircle, label: 'Applying' },
  submitted: { color: 'bg-emerald-500', icon: CheckCircle, label: 'Submitted' },
  interview: { color: 'bg-violet-500', icon: ArrowRight, label: 'Interview' },
  offered: { color: 'bg-pink-500', icon: CheckCircle, label: 'Offered' },
  rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
  withdrawn: { color: 'bg-neutral-400', icon: XCircle, label: 'Withdrawn' },
};

const MOCK_TIMELINE = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'Spotify', country: 'Sweden', status: 'interview', date: '2026-07-20', agent: 'Job Hunter', matchScore: 92 },
  { id: '2', title: 'DAAD Research Scholarship', company: 'DAAD', country: 'Germany', status: 'submitted', date: '2026-07-18', agent: 'Scholarship Scout', matchScore: 88 },
  { id: '3', title: 'ML Engineer', company: 'DeepMind', country: 'UK', status: 'queued', date: '2026-07-15', agent: 'Job Hunter', matchScore: 85 },
  { id: '4', title: 'German Blue Card', company: 'Auslanderbehorde', country: 'Germany', status: 'discovered', date: '2026-07-10', agent: 'Permit Pathfinder', matchScore: 78 },
  { id: '5', title: 'Full Stack Developer', company: 'Booking.com', country: 'Netherlands', status: 'submitted', date: '2026-07-08', agent: 'Job Hunter', matchScore: 90 },
  { id: '6', title: 'Chevening Fellowship', company: 'UK Government', country: 'UK', status: 'rejected', date: '2026-07-01', agent: 'Scholarship Scout', matchScore: 72 },
  { id: '7', title: 'Cloud Architect', company: 'AWS', country: 'Germany', status: 'offered', date: '2026-06-25', agent: 'Job Hunter', matchScore: 95 },
  { id: '8', title: 'Canada Express Entry', company: 'IRCC', country: 'Canada', status: 'applying', date: '2026-07-22', agent: 'Permit Pathfinder', matchScore: 80 },
];

export default function ApplicationTimeline({ dark }) {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState('timeline');

  useEffect(() => {
    const stored = localStorage.getItem('copilot_timeline');
    if (stored) {
      setApplications(JSON.parse(stored));
    } else {
      setApplications(MOCK_TIMELINE);
      localStorage.setItem('copilot_timeline', JSON.stringify(MOCK_TIMELINE));
    }
  }, []);

  const filtered = useMemo(() => {
    let result = applications;
    if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus);
    if (filterAgent !== 'all') result = result.filter(a => a.agent === filterAgent);
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [applications, filterStatus, filterAgent]);

  const agents = [...new Set(applications.map(a => a.agent))];
  const statuses = [...new Set(applications.map(a => a.status))];

  const stats = useMemo(() => ({
    total: applications.length,
    active: applications.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offered').length,
    successRate: applications.length > 0 ? Math.round((applications.filter(a => ['submitted', 'interview', 'offered'].includes(a.status)).length / applications.length) * 100) : 0,
  }), [applications]);

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-cyan-500/10' : 'bg-cyan-500/10'}`}>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Application Timeline</h2>
            <p className="text-xs text-neutral-400">Track every application from discovery to outcome</p>
          </div>
        </div>
        <div className="flex border rounded overflow-hidden">
          {['timeline', 'grid'].map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 text-[10px] font-mono transition-colors ${viewMode === v ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}>
              {v === 'timeline' ? 'Timeline' : 'Grid'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold">{stats.total}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Total</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-cyan-400">{stats.active}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Active</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-violet-400">{stats.interviews}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Interviews</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-pink-400">{stats.offers}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Offers</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-emerald-400">{stats.successRate}%</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Success</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className={`px-3 py-1.5 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
          <option value="all">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
        </select>
        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
          className={`px-3 py-1.5 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
          <option value="all">All Agents</option>
          {agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {viewMode === 'timeline' ? (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-800" />
          <div className="space-y-4">
            {filtered.map((app, i) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.discovered;
              const Icon = cfg.icon;
              const isExpanded = expandedId === app.id;
              return (
                <div key={app.id} className="relative pl-10">
                  <div className={`absolute left-2.5 w-3 h-3 rounded-full ${cfg.color} ring-2 ring-[#0A0A0B]`} />
                  <div className={`p-4 rounded border transition-all cursor-pointer ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold">{app.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${cfg.color}/10 text-${cfg.color.replace('bg-', '')}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-neutral-500">{app.company} · {app.country} · {app.agent}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-emerald-400">{app.matchScore}%</span>
                        <p className="text-[10px] text-neutral-500">{new Date(app.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
                        <p>Applied via: <span className="text-neutral-300">{app.agent}</span></p>
                        <p>Match Score: <span className="text-emerald-400">{app.matchScore}%</span></p>
                        <p>Status: <span className="text-neutral-300">{cfg.label}</span></p>
                        <p>Date: <span className="text-neutral-300">{new Date(app.date).toLocaleDateString()}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.discovered;
            return (
              <div key={app.id} className={`p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                  <span className="text-[10px] font-mono text-neutral-400">{cfg.label}</span>
                </div>
                <h4 className="text-sm font-bold mb-1">{app.title}</h4>
                <p className="text-xs text-neutral-500 mb-2">{app.company} · {app.country}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400">{app.matchScore}% match</span>
                  <span className="text-neutral-500">{new Date(app.date).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className={`text-center py-12 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
          <Clock className="w-8 h-8 mx-auto mb-3 text-neutral-500" />
          <p className="text-sm text-neutral-500">No applications match your filters.</p>
        </div>
      )}
    </div>
  );
}
