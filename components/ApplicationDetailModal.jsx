'use client';

import { X, Globe, ExternalLink, Zap, Clock, User, Target, FileText, Send } from 'lucide-react';

export default function ApplicationDetailModal({ app, dark, onClose, onAutoApply }) {
  if (!app) return null;

  const statusColors = {
    'Submitted': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'In Progress': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    'Queued': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    'Document Check': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'Tailoring CV': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    'Failed': 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  const timeline = [
    { step: 'Discovered', time: app.date || 'Today', done: true },
    { step: 'Match Scored', time: `${app.matchScore}%`, done: true },
    { step: 'CV Tailored', time: app.status !== 'Queued' ? 'Done' : 'Pending', done: app.status !== 'Queued' },
    { step: 'Auto-Applied', time: app.status === 'Submitted' ? 'Done' : app.status === 'Failed' ? 'Failed' : 'Pending', done: app.status === 'Submitted' },
    { step: 'Confirmed', time: app.status === 'Submitted' ? 'Done' : 'Pending', done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${dark ? 'border-neutral-800 bg-[#0A0A0B]' : 'border-neutral-200 bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-6 border-b ${dark ? 'border-neutral-900' : 'border-neutral-200'}`}>
          <div>
            <h2 className="text-lg font-bold">{app.title}</h2>
            <p className="text-xs text-neutral-400 mt-1">{app.institution} — {app.country}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1.5 rounded text-xs font-mono font-bold ${statusColors[app.status] || 'bg-neutral-500/10 text-neutral-400'}`}>
              {app.status}
            </span>
            <span className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Match: {app.matchScore}%
            </span>
            <span className="px-3 py-1.5 rounded text-xs font-mono bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
              {app.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-900 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2"><User className="w-3.5 h-3.5" /> Agent</div>
              <p className="text-sm font-semibold">{app.agent}</p>
            </div>
            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-900 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2"><Target className="w-3.5 h-3.5" /> Progress</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all" style={{ width: `${app.progress}%` }} />
                </div>
                <span className="text-sm font-bold">{app.progress}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase text-neutral-400 mb-3">Application Timeline</h3>
            <div className="space-y-2">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 ${item.done ? 'bg-cyan-400 border-cyan-400' : 'border-neutral-600'}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-xs font-medium ${item.done ? (dark ? 'text-white' : 'text-black') : 'text-neutral-500'}`}>{item.step}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded font-mono text-sm font-bold transition-all ${dark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'}`}>
                <ExternalLink className="w-4 h-4" /> View Portal
              </a>
            )}
            {(app.status === 'Queued' || app.status === 'Failed' || app.status === 'In Progress') && onAutoApply && (
              <button onClick={() => { onAutoApply(app); onClose(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded font-mono text-sm font-bold transition-all ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                <Zap className="w-4 h-4" /> Auto-Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
