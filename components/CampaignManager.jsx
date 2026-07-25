'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Plus, RotateCw, Clock, Zap } from 'lucide-react';

const PRESETS = {
  aggressive: { name: 'Aggressive', desc: 'Every 4 hours, 10 apps/run', icon: Zap, color: 'text-red-400' },
  moderate: { name: 'Moderate', desc: 'Twice daily, 5 apps/run', icon: Play, color: 'text-cyan-400' },
  conservative: { name: 'Conservative', desc: 'Weekdays 10AM, 3 apps/run', icon: Clock, color: 'text-emerald-400' },
  discovery: { name: 'Discovery Only', desc: 'Daily scan, no applications', icon: RotateCw, color: 'text-yellow-400' },
  weekly: { name: 'Weekly Sweep', desc: 'Mondays at 9AM, 15 apps/run', icon: Play, color: 'text-indigo-400' },
};

export default function CampaignManager({ dark }) {
  const [campaigns, setCampaigns] = useState([]);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('moderate');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const [campRes, statusRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/campaigns?action=status'),
      ]);
      const campData = await campRes.json();
      const statusData = await statusRes.json();
      setCampaigns(campData.data || []);
      setSchedulerStatus(statusData.scheduler || null);
    } catch (e) {
      console.error('Failed to fetch campaigns:', e);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    setCreating(true);
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: selectedPreset }),
      });
      await fetchCampaigns();
    } catch (e) {
      console.error('Failed to create campaign:', e);
    } finally {
      setCreating(false);
    }
  };

  const toggleCampaign = async (campaignId, action) => {
    try {
      await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action }),
      });
      await fetchCampaigns();
    } catch (e) {
      console.error('Failed to toggle campaign:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Campaign Scheduler</h2>
          <p className="text-xs text-neutral-400 mt-1">Set-and-forget application campaigns with cron scheduling.</p>
        </div>
        {schedulerStatus && (
          <div className={`px-3 py-1.5 rounded text-xs font-mono ${schedulerStatus.running ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {schedulerStatus.running ? `Running (${schedulerStatus.activeJobs} jobs)` : 'Stopped'}
          </div>
        )}
      </div>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-mono text-xs uppercase text-neutral-400 mb-4">Quick Create from Preset</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const Icon = preset.icon;
            return (
              <button key={key} onClick={() => setSelectedPreset(key)}
                className={`p-3 rounded border text-left transition-all ${selectedPreset === key
                  ? `border-cyan-500/50 ${dark ? 'bg-cyan-500/5' : 'bg-cyan-50'}`
                  : dark ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                <Icon className={`w-4 h-4 mb-2 ${preset.color}`} />
                <div className="text-xs font-bold">{preset.name}</div>
                <div className="text-[10px] text-neutral-500 mt-1">{preset.desc}</div>
              </button>
            );
          })}
        </div>
        <button onClick={createCampaign} disabled={creating}
          className={`px-4 py-2 rounded text-sm font-mono font-bold transition-all ${creating ? 'opacity-50 cursor-not-allowed' : ''} ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          {creating ? 'Creating...' : 'Create Campaign'}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-mono text-xs uppercase text-neutral-400">Active Campaigns</h3>
        {loading ? (
          <div className="text-center py-8 text-neutral-600 text-xs font-mono">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8 text-neutral-600 text-xs font-mono">No campaigns yet. Create one above.</div>
        ) : (
          campaigns.map((camp) => (
            <div key={camp._id} className={`border rounded-lg p-4 flex items-center justify-between ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-bold">{camp.name}</div>
                  <div className="text-[10px] font-mono text-neutral-500">Cron: {camp.cron} | Runs: {camp.runCount || 0}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {camp.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {camp.status === 'active' ? (
                  <button onClick={() => toggleCampaign(camp._id, 'pause')}
                    className="p-1.5 rounded border border-neutral-800 hover:bg-neutral-800 transition-colors">
                    <Pause className="w-3.5 h-3.5 text-yellow-400" />
                  </button>
                ) : (
                  <button onClick={() => toggleCampaign(camp._id, 'resume')}
                    className="p-1.5 rounded border border-neutral-800 hover:bg-neutral-800 transition-colors">
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
