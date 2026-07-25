'use client';

import { useState } from 'react';
import { Search, Globe, FileText, Terminal, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SearchPanel({ dark }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState('all');

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      toast.error('Enter at least 2 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&scope=${scope}`);
      const data = await res.json();
      if (data.success) setResults(data);
    } catch (e) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const sourceIcons = {
    applications: <FileText className="w-3.5 h-3.5 text-indigo-400" />,
    discoveries: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
    logs: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
  };

  const sourceColors = {
    applications: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    discoveries: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    logs: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Universal Search</h2>
        <p className="text-xs text-neutral-400 mt-1">Search across applications, discoveries, and agent logs.</p>
      </div>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search applications, discoveries, logs..."
              className={`w-full pl-10 pr-4 py-3 rounded border text-sm outline-none transition-colors ${dark ? 'bg-neutral-950 border-neutral-800 focus:border-cyan-500 text-white' : 'bg-neutral-50 border-neutral-200 focus:border-blue-500'}`}
            />
          </div>
          <select value={scope} onChange={(e) => setScope(e.target.value)}
            className={`px-3 py-2 rounded border text-sm outline-none ${dark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
            <option value="all">All</option>
            <option value="applications">Applications</option>
            <option value="discoveries">Discoveries</option>
            <option value="logs">Logs</option>
          </select>
          <button onClick={handleSearch} disabled={loading}
            className={`px-6 py-2 rounded font-mono text-sm font-bold transition-all ${loading ? 'opacity-50' : ''} ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-neutral-400">
            Found {results.total} results for &quot;{results.query}&quot;
          </div>

          {results.data.applications?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Applications ({results.data.applications.length})
              </h3>
              <div className="space-y-2">
                {results.data.applications.map((app) => (
                  <div key={app._id} className={`border rounded-lg p-4 ${dark ? 'border-neutral-900 bg-[#0F0F11]/60' : 'border-neutral-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold mr-2 ${sourceColors.applications}`}>{app.type}</span>
                        <span className="text-sm font-bold">{app.title}</span>
                        <span className="text-xs text-neutral-500 ml-2">{app.institution}</span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${app.status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.data.discoveries?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" /> Discoveries ({results.data.discoveries.length})
              </h3>
              <div className="space-y-2">
                {results.data.discoveries.map((disc) => (
                  <div key={disc._id} className={`border rounded-lg p-4 ${dark ? 'border-neutral-900 bg-[#0F0F11]/60' : 'border-neutral-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold mr-2 ${sourceColors.discoveries}`}>{disc.type}</span>
                        <a href={disc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-cyan-400">{disc.title}</a>
                        <span className="text-xs text-neutral-500 ml-2">{disc.country}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.data.logs?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Logs ({results.data.logs.length})
              </h3>
              <div className="space-y-1 font-mono text-xs">
                {results.data.logs.slice(0, 20).map((log) => (
                  <div key={log._id} className={`p-2 rounded ${dark ? 'bg-neutral-950' : 'bg-neutral-100'}`}>
                    <span className="text-neutral-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className={log.status === 'error' ? 'text-red-400' : log.status === 'completed' ? 'text-emerald-400' : 'text-neutral-300'}>
                      {log.msg || log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.total === 0 && (
            <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <p className="text-sm text-neutral-500">No results found for &quot;{results.query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
