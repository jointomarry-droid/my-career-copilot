'use client';

import { useState, useEffect } from 'react';
import { Globe, ExternalLink, CheckCircle, XCircle, RefreshCw, Search, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscoveryFeed({ dark, onAutoApply }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const [filter, setFilter] = useState('all');
  const [autoApplyingId, setAutoApplyingId] = useState(null);

  useEffect(() => {
    fetchDiscoveries();
  }, []);

  const fetchDiscoveries = async () => {
    try {
      const res = await fetch('/api/discoveries');
      const data = await res.json();
      setDiscoveries(data.data || []);
    } catch (e) {
      console.error('Failed to fetch discoveries:', e);
    } finally {
      setLoading(false);
    }
  };

  const runSweep = async () => {
    setSweeping(true);
    try {
      await fetch('/api/discoveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApply: false }),
      });
      await fetchDiscoveries();
      toast.success('Discovery sweep completed!');
    } catch (e) {
      console.error('Discovery sweep failed:', e);
      toast.error('Sweep failed');
    } finally {
      setSweeping(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch('/api/discoveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discoveryId: id, status }),
      });
      await fetchDiscoveries();
    } catch (e) {
      console.error('Failed to update:', e);
    }
  };

  const autoApplyDiscovery = async (disc) => {
    setAutoApplyingId(disc._id);
    toast.info(`Auto-applying to: ${disc.title}`);

    try {
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: disc.title,
          institution: disc.source || '',
          type: disc.type || 'Job',
          country: disc.country || '',
          url: disc.url,
          matchScore: 75,
          agent: `${disc.type} Scout Agent`,
        }),
      });
      const appData = await appRes.json();

      if (appData.success && appData.data) {
        if (onAutoApply) {
          await onAutoApply({
            ...appData.data,
            url: disc.url,
            type: disc.type,
          });
        }
        await updateStatus(disc._id, 'applied');
        toast.success(`Applied to ${disc.title}!`);
      }
    } catch (e) {
      toast.error('Auto-apply failed');
    } finally {
      setAutoApplyingId(null);
    }
  };

  const filtered = discoveries.filter(d => filter === 'all' || d.status === filter);

  const typeColors = {
    Scholarship: 'bg-indigo-500/10 text-indigo-400',
    Job: 'bg-emerald-500/10 text-emerald-400',
    'Work Permit': 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Opportunity Discovery Feed</h2>
          <p className="text-xs text-neutral-400 mt-1">Auto-discovered scholarships, jobs, and permits from global sources.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runSweep} disabled={sweeping}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono font-bold transition-all ${sweeping ? 'opacity-50 cursor-not-allowed' : ''} ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            <RefreshCw className={`w-4 h-4 ${sweeping ? 'animate-spin' : ''}`} />
            {sweeping ? 'Scanning...' : 'Run Discovery Sweep'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 text-xs font-mono">
        {['all', 'new', 'applied', 'ignored'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded transition-colors ${filter === f ? (dark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-[#0A0A0B]') : 'text-neutral-400 hover:text-white'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600 text-xs font-mono">Loading discoveries...</div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <Search className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
          <p className="text-sm text-neutral-500">No discoveries yet. Run a sweep to find opportunities.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((disc) => (
            <div key={disc._id} className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${dark ? 'border-neutral-900 bg-[#0F0F11]/60 hover:bg-[#0F0F11]' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono shrink-0 ${typeColors[disc.type] || 'bg-neutral-500/10 text-neutral-400'}`}>
                  {disc.type}
                </span>
                <div className="min-w-0">
                  <a href={disc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-cyan-400 transition-colors truncate block">
                    {disc.title}
                  </a>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{disc.country}</span>
                    <span>{disc.source}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {disc.status === 'new' && (
                  <>
                    <button onClick={() => autoApplyDiscovery(disc)}
                      disabled={autoApplyingId === disc._id}
                      className={`p-1.5 rounded border transition-colors ${autoApplyingId === disc._id ? 'opacity-50' : ''} border-cyan-500/30 hover:bg-cyan-500/10`}
                      title="Auto-apply">
                      <Zap className={`w-3.5 h-3.5 text-cyan-400 ${autoApplyingId === disc._id ? 'animate-pulse' : ''}`} />
                    </button>
                    <button onClick={() => updateStatus(disc._id, 'applied')}
                      className="p-1.5 rounded border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors" title="Mark as applied">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button onClick={() => updateStatus(disc._id, 'ignored')}
                      className="p-1.5 rounded border border-neutral-700 hover:bg-neutral-800 transition-colors" title="Ignore">
                      <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  disc.status === 'applied' ? 'bg-emerald-500/10 text-emerald-400' :
                  disc.status === 'ignored' ? 'bg-neutral-500/10 text-neutral-500' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {disc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
