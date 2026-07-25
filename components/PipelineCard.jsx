'use client';

import { Globe, ExternalLink, Zap } from 'lucide-react';

export default function PipelineCard({ app, dark, onAutoApply, isAutoApplying }) {
  const statusColors = {
    'Submitted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'In Progress': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Queued': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Document Check': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Tailoring CV': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Failed': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const typeColors = {
    'Scholarship': 'bg-indigo-500/10 text-indigo-400',
    'Job': 'bg-emerald-500/10 text-emerald-400',
    'Work Permit': 'bg-amber-500/10 text-amber-400',
  };

  const progressColor = app.status === 'Submitted'
    ? 'bg-emerald-500'
    : dark ? 'bg-cyan-400' : 'bg-blue-600';

  const canAutoApply = app.status === 'Queued' || app.status === 'Failed' || app.status === 'In Progress';

  return (
    <div className={`border rounded-lg p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
      dark
        ? 'border-neutral-900 bg-[#0F0F11]/40 hover:bg-[#0F0F11]/80 hover:border-cyan-500/20'
        : 'border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-blue-600/20'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider uppercase ${typeColors[app.type] || 'bg-neutral-500/10 text-neutral-400'}`}>
            {app.type}
          </span>
          <div className="flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-400">{app.country}</span>
          </div>
        </div>

        <h3 className="font-bold text-sm tracking-tight line-clamp-2 min-h-[40px] mb-2">{app.title}</h3>
        <p className="text-xs text-neutral-400 mb-4">{app.institution}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-500">Autonomous Driver:</span>
            <span className={`font-semibold ${dark ? 'text-neutral-300' : 'text-neutral-700'}`}>{app.agent}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-500">Auto-Match Index:</span>
            <span className={`font-bold ${dark ? 'text-cyan-400' : 'text-blue-600'}`}>{app.matchScore}% Verified</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-neutral-500">State: {app.status}</span>
          <span>{app.progress}%</span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${progressColor}`} style={{ width: `${app.progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          {app.url && (
            <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-cyan-500 hover:underline font-mono">
              <ExternalLink className="w-3 h-3" /> View Portal
            </a>
          )}
          {canAutoApply && onAutoApply && (
            <button
              onClick={(e) => onAutoApply(app, e)}
              disabled={isAutoApplying}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                isAutoApplying ? 'opacity-50 cursor-not-allowed' : ''
              } ${dark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
              <Zap className="w-3 h-3" />
              {isAutoApplying ? 'Applying...' : 'Auto-Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
