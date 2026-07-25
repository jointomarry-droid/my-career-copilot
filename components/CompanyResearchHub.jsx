'use client';

import { useState } from 'react';
import { Building2, Plus, Trash2, ExternalLink, Star, TrendingUp, Users, Globe, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_COMPANIES = [
  { id: '1', name: 'Spotify', industry: 'Music/Tech', hq: 'Stockholm, Sweden', size: '10,000+', rating: 4.3, pros: ['Great work-life balance', 'Strong engineering culture', 'Remote-friendly'], cons: ['Layoffs in 2024', 'Bureaucracy in some teams'], techStack: 'Java, Python, GCP, Kubernetes',Glassdoor: '4.3', url: 'spotify.com', notes: 'Leading music streaming platform. Strong focus on personalization and recommendation algorithms.' },
  { id: '2', name: 'DeepMind', industry: 'AI Research', hq: 'London, UK', size: '2,000+', rating: 4.6, pros: ['Cutting-edge research', 'Top talent', 'Google backing'], cons: ['High pressure', 'Publish or perish culture'], techStack: 'Python, TensorFlow, JAX, C++',Glassdoor: '4.6', url: 'deepmind.com', notes: 'World-leading AI research lab. Known for AlphaGo, AlphaFold, and Gemini models.' },
  { id: '3', name: 'ASML', industry: 'Semiconductor', hq: 'Veldhoven, Netherlands', size: '40,000+', rating: 4.1, pros: ['Market leader', 'Strong benefits', 'Innovation-driven'], cons: ['Dutch bureaucracy', 'Complex org structure'], techStack: 'C++, Python, Java, proprietary systems',Glassdoor: '4.1', url: 'asml.com', notes: 'Monopoly in EUV lithography machines. Critical player in global semiconductor supply chain.' },
];

export default function CompanyResearchHub({ dark }) {
  const [companies, setCompanies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_companies') || 'null') || DEFAULT_COMPANIES; } catch { return DEFAULT_COMPANIES; }
  });
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', hq: '', size: '', rating: 4, pros: '', cons: '', techStack: '', url: '', notes: '' });

  const saveCompanies = (c) => {
    setCompanies(c);
    localStorage.setItem('copilot_companies', JSON.stringify(c));
  };

  const addCompany = () => {
    if (!newCompany.name) return;
    const company = {
      ...newCompany,
      id: Date.now().toString(),
      rating: Number(newCompany.rating),
      pros: newCompany.pros.split(',').map(s => s.trim()).filter(Boolean),
      cons: newCompany.cons.split(',').map(s => s.trim()).filter(Boolean),
    };
    saveCompanies([...companies, company]);
    setNewCompany({ name: '', industry: '', hq: '', size: '', rating: 4, pros: '', cons: '', techStack: '', url: '', notes: '' });
    setShowForm(false);
  };

  const deleteCompany = (id) => {
    saveCompanies(companies.filter(c => c.id !== id));
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-indigo-500/10' : 'bg-indigo-500/10'}`}>
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Company Research Hub</h2>
            <p className="text-xs text-neutral-400">Deep-dive intelligence on target companies</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}>
          <Plus className="w-3.5 h-3.5" /> Add Company
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input placeholder="Company name *" value={newCompany.name} onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            <input placeholder="Industry" value={newCompany.industry} onChange={e => setNewCompany(p => ({ ...p, industry: e.target.value }))} className={inputClass} />
            <input placeholder="Headquarters" value={newCompany.hq} onChange={e => setNewCompany(p => ({ ...p, hq: e.target.value }))} className={inputClass} />
            <input placeholder="Company size" value={newCompany.size} onChange={e => setNewCompany(p => ({ ...p, size: e.target.value }))} className={inputClass} />
            <input placeholder="Website URL" value={newCompany.url} onChange={e => setNewCompany(p => ({ ...p, url: e.target.value }))} className={inputClass} />
            <input placeholder="Tech stack" value={newCompany.techStack} onChange={e => setNewCompany(p => ({ ...p, techStack: e.target.value }))} className={inputClass} />
            <input placeholder="Pros (comma separated)" value={newCompany.pros} onChange={e => setNewCompany(p => ({ ...p, pros: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
            <input placeholder="Cons (comma separated)" value={newCompany.cons} onChange={e => setNewCompany(p => ({ ...p, cons: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
            <textarea placeholder="Research notes" rows={2} value={newCompany.notes} onChange={e => setNewCompany(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} sm:col-span-3 resize-none`} />
          </div>
          <div className="flex gap-2">
            <button onClick={addCompany} className="px-4 py-2 rounded text-xs font-mono font-bold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {companies.map(c => {
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} className={`p-4 rounded border transition-all ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{c.name}</h3>
                    <span className="text-xs text-amber-400">★ {c.rating}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> {c.industry}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {c.hq}</span>
                    <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> {c.size}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`https://${c.url}`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} className="p-1.5 rounded text-neutral-500 hover:text-cyan-400 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                  <button onClick={(e) => { e.stopPropagation(); deleteCompany(c.id); }} className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </div>
              </div>
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                  {c.techStack && (
                    <div>
                      <h5 className="text-[10px] font-mono uppercase text-neutral-400 mb-1">Tech Stack</h5>
                      <p className="text-xs text-neutral-300">{c.techStack}</p>
                    </div>
                  )}
                  {c.pros?.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-mono uppercase text-emerald-400 mb-1">Pros</h5>
                      <ul className="space-y-0.5">{c.pros.map((p, i) => <li key={i} className="text-xs text-neutral-300 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />{p}</li>)}</ul>
                    </div>
                  )}
                  {c.cons?.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-mono uppercase text-red-400 mb-1">Cons</h5>
                      <ul className="space-y-0.5">{c.cons.map((p, i) => <li key={i} className="text-xs text-neutral-300 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{p}</li>)}</ul>
                    </div>
                  )}
                  {c.notes && <p className="text-xs text-neutral-400 italic">{c.notes}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
