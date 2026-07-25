'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Copy, Trash2, Edit3, Check, X, Download, Eye, GitBranch } from 'lucide-react';

const DEFAULT_VERSIONS = [
  {
    id: 'v1',
    name: 'General Software Engineer',
    description: 'Full-stack focused resume for general software engineering roles',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker'],
    summary: 'Full-stack software engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud infrastructure.',
    focus: 'fullstack',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'v2',
    name: 'AI/ML Engineer',
    description: 'Specialized for machine learning and AI positions',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'AWS', 'Docker'],
    summary: 'AI/ML engineer with expertise in deep learning, NLP, and computer vision. Published researcher with experience deploying ML models at scale.',
    focus: 'ai-ml',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ResumeVersionManager({ dark }) {
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newVersion, setNewVersion] = useState({ name: '', description: '', skills: '', summary: '', focus: 'fullstack' });

  useEffect(() => {
    const stored = localStorage.getItem('copilot_resume_versions');
    if (stored) {
      setVersions(JSON.parse(stored));
    } else {
      setVersions(DEFAULT_VERSIONS);
      localStorage.setItem('copilot_resume_versions', JSON.stringify(DEFAULT_VERSIONS));
    }
  }, []);

  const saveVersions = useCallback((v) => {
    setVersions(v);
    localStorage.setItem('copilot_resume_versions', JSON.stringify(v));
  }, []);

  const addVersion = () => {
    if (!newVersion.name) return;
    const version = {
      ...newVersion,
      id: Date.now().toString(),
      skills: newVersion.skills.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveVersions([...versions, version]);
    setNewVersion({ name: '', description: '', skills: '', summary: '', focus: 'fullstack' });
    setShowForm(false);
  };

  const deleteVersion = (id) => {
    saveVersions(versions.filter(v => v.id !== id));
    if (activeVersion === id) setActiveVersion(null);
  };

  const duplicateVersion = (v) => {
    const copy = {
      ...v,
      id: Date.now().toString(),
      name: v.name + ' (Copy)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveVersions([...versions, copy]);
  };

  const startEdit = (v) => {
    setEditing(v.id);
    setNewVersion({
      name: v.name,
      description: v.description,
      skills: v.skills.join(', '),
      summary: v.summary,
      focus: v.focus,
    });
  };

  const saveEdit = () => {
    const updated = versions.map(v => {
      if (v.id === editing) {
        return {
          ...v,
          name: newVersion.name,
          description: newVersion.description,
          skills: newVersion.skills.split(',').map(s => s.trim()).filter(Boolean),
          summary: newVersion.summary,
          focus: newVersion.focus,
          updatedAt: new Date().toISOString(),
        };
      }
      return v;
    });
    saveVersions(updated);
    setEditing(null);
    setNewVersion({ name: '', description: '', skills: '', summary: '', focus: 'fullstack' });
  };

  const exportVersion = (v) => {
    const content = `RESUME: ${v.name}\n${'='.repeat(40)}\n\nFocus: ${v.focus}\nDescription: ${v.description}\n\nSummary:\n${v.summary}\n\nSkills:\n${v.skills.map(s => `  - ${s}`).join('\n')}\n\nLast Updated: ${new Date(v.updatedAt).toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${v.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const focusColors = {
    fullstack: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'ai-ml': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    frontend: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    backend: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    devops: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    research: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-indigo-500/10' : 'bg-indigo-500/10'}`}>
            <GitBranch className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Resume Version Manager</h2>
            <p className="text-xs text-neutral-400">Create tailored resume versions for different job types</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}>
          <Plus className="w-3.5 h-3.5" /> New Version
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Version name" value={newVersion.name} onChange={e => setNewVersion(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            <select value={newVersion.focus} onChange={e => setNewVersion(p => ({ ...p, focus: e.target.value }))} className={inputClass}>
              <option value="fullstack">Full Stack</option>
              <option value="ai-ml">AI/ML</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="devops">DevOps</option>
              <option value="research">Research</option>
            </select>
            <input placeholder="Description" value={newVersion.description} onChange={e => setNewVersion(p => ({ ...p, description: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
            <input placeholder="Skills (comma separated)" value={newVersion.skills} onChange={e => setNewVersion(p => ({ ...p, skills: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
            <textarea placeholder="Professional summary" rows={3} value={newVersion.summary} onChange={e => setNewVersion(p => ({ ...p, summary: e.target.value }))} className={`${inputClass} sm:col-span-2 resize-none`} />
          </div>
          <div className="flex gap-2">
            <button onClick={addVersion} className="px-4 py-2 rounded text-xs font-mono font-bold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors">Save Version</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {versions.map(v => (
          <div key={v.id} className={`p-4 rounded border transition-all ${activeVersion === v.id ? 'border-indigo-500/30 bg-indigo-500/5' : dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
            {editing === v.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input placeholder="Name" value={newVersion.name} onChange={e => setNewVersion(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                  <select value={newVersion.focus} onChange={e => setNewVersion(p => ({ ...p, focus: e.target.value }))} className={inputClass}>
                    <option value="fullstack">Full Stack</option>
                    <option value="ai-ml">AI/ML</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="devops">DevOps</option>
                    <option value="research">Research</option>
                  </select>
                  <input placeholder="Description" value={newVersion.description} onChange={e => setNewVersion(p => ({ ...p, description: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
                  <input placeholder="Skills" value={newVersion.skills} onChange={e => setNewVersion(p => ({ ...p, skills: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
                  <textarea placeholder="Summary" rows={2} value={newVersion.summary} onChange={e => setNewVersion(p => ({ ...p, summary: e.target.value }))} className={`${inputClass} sm:col-span-2 resize-none`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono font-bold bg-emerald-500 text-white hover:bg-emerald-400"><Check className="w-3 h-3" /> Save</button>
                  <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-neutral-400 hover:text-white"><X className="w-3 h-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold">{v.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${focusColors[v.focus] || focusColors.fullstack}`}>{v.focus}</span>
                      {activeVersion === v.id && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>}
                    </div>
                    <p className="text-xs text-neutral-500">{v.description}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mb-3 line-clamp-2">{v.summary}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {v.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500">Updated {new Date(v.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setActiveVersion(v.id)} className={`p-1.5 rounded transition-colors ${activeVersion === v.id ? 'text-emerald-400' : 'text-neutral-500 hover:text-emerald-400'}`} title="Set as active">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(v)} className="p-1.5 rounded text-neutral-500 hover:text-cyan-400 transition-colors" title="Edit">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => duplicateVersion(v)} className="p-1.5 rounded text-neutral-500 hover:text-indigo-400 transition-colors" title="Duplicate">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => exportVersion(v)} className="p-1.5 rounded text-neutral-500 hover:text-amber-400 transition-colors" title="Export">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteVersion(v.id)} className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {versions.length === 0 && (
        <div className={`text-center py-12 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
          <FileText className="w-8 h-8 mx-auto mb-3 text-neutral-500" />
          <p className="text-sm text-neutral-500">No resume versions yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
