'use client';

import { useState, useEffect, useCallback } from 'react';
import { StickyNote, Plus, Trash2, Search, Tag, Clock, Edit3, Check, X, Hash, Lightbulb, AlertCircle, Bookmark } from 'lucide-react';

const TAG_TYPES = [
  { id: 'idea', label: 'Idea', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Lightbulb },
  { id: 'todo', label: 'To-Do', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle },
  { id: 'insight', label: 'Insight', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: Bookmark },
  { id: 'contact', label: 'Contact', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Hash },
  { id: 'question', label: 'Question', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: Edit3 },
];

const DEFAULT_NOTES = [
  { id: '1', title: 'Research EURES portal', content: 'Check the European Employment Services portal for job listings in Germany and Netherlands. They have a matching system.', tag: 'todo', pinned: true, createdAt: '2026-07-22T10:00:00' },
  { id: '2', title: 'DAAD application strategy', content: 'Focus on research proposal related to AI ethics in autonomous systems. Need to contact potential supervisor at TU Munich.', tag: 'idea', pinned: false, createdAt: '2026-07-20T14:30:00' },
  { id: '3', title: 'Spotify interview prep notes', content: 'Research their microservices architecture. Study React performance optimization patterns. Prepare system design for audio streaming.', tag: 'todo', pinned: true, createdAt: '2026-07-19T09:15:00' },
  { id: '4', title: '30% ruling in NL', content: 'The 30% tax ruling for expats in Netherlands saves significant money. Need to apply within 4 months of starting work. Employer must be a recognized sponsor.', tag: 'insight', pinned: false, createdAt: '2026-07-18T16:45:00' },
  { id: '5', title: 'Ask Priya about referral process', content: 'Priya at DeepMind offered to refer me. Need to send her updated CV and the specific job ID for ML Engineer position.', tag: 'contact', pinned: false, createdAt: '2026-07-15T11:20:00' },
];

export default function QuickNotes({ dark }) {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [newNote, setNewNote] = useState({ title: '', content: '', tag: 'idea', pinned: false });

  useEffect(() => {
    const stored = localStorage.getItem('copilot_notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    } else {
      setNotes(DEFAULT_NOTES);
      localStorage.setItem('copilot_notes', JSON.stringify(DEFAULT_NOTES));
    }
  }, []);

  const saveNotes = useCallback((n) => {
    setNotes(n);
    localStorage.setItem('copilot_notes', JSON.stringify(n));
  }, []);

  const addNote = () => {
    if (!newNote.title && !newNote.content) return;
    const note = {
      ...newNote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    setNewNote({ title: '', content: '', tag: 'idea', pinned: false });
    setShowForm(false);
  };

  const deleteNote = (id) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  const togglePin = (id) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const startEdit = (n) => {
    setEditing(n.id);
    setNewNote({ title: n.title, content: n.content, tag: n.tag, pinned: n.pinned });
  };

  const saveEdit = () => {
    saveNotes(notes.map(n => n.id === editing ? { ...n, ...newNote } : n));
    setEditing(null);
    setNewNote({ title: '', content: '', tag: 'idea', pinned: false });
  };

  const filtered = notes.filter(n => {
    if (filterTag !== 'all' && n.tag !== filterTag) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.pinned).length,
    byTag: TAG_TYPES.reduce((acc, t) => { acc[t.id] = notes.filter(n => n.tag === t.id).length; return acc; }, {}),
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-yellow-500/10' : 'bg-yellow-500/10'}`}>
            <StickyNote className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Quick Notes</h2>
            <p className="text-xs text-neutral-400">Capture ideas, tasks, and insights on the fly</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}>
          <Plus className="w-3.5 h-3.5" /> New Note
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TAG_TYPES.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setFilterTag(filterTag === t.id ? 'all' : t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
                filterTag === t.id ? t.color : 'text-neutral-500 border-neutral-800 hover:border-neutral-700'
              }`}>
              <Icon className="w-3 h-3" /> {t.label} ({stats.byTag[t.id] || 0})
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`} />
        </div>
        <span className="text-[10px] font-mono text-neutral-500">{filtered.length} notes</span>
      </div>

      {showForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="space-y-3 mb-3">
            <input placeholder="Title" value={newNote.title} onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} className={inputClass} />
            <textarea placeholder="Content..." rows={3} value={newNote.content} onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))} className={`${inputClass} resize-none`} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400">Tag:</span>
              {TAG_TYPES.map(t => (
                <button key={t.id} onClick={() => setNewNote(p => ({ ...p, tag: t.id }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${newNote.tag === t.id ? t.color : 'text-neutral-500 border-neutral-800'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addNote} className="px-4 py-2 rounded text-xs font-mono font-bold bg-yellow-500 text-neutral-900 hover:bg-yellow-400 transition-colors">Save Note</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`text-center py-12 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
            <StickyNote className="w-8 h-8 mx-auto mb-3 text-neutral-500" />
            <p className="text-sm text-neutral-500">No notes found.</p>
          </div>
        )}
        {filtered.map(n => {
          const tagInfo = TAG_TYPES.find(t => t.id === n.tag) || TAG_TYPES[0];
          const TagIcon = tagInfo.icon;
          return (
            <div key={n.id} className={`p-4 rounded border transition-all ${n.pinned ? 'border-amber-500/20 bg-amber-500/5' : dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
              {editing === n.id ? (
                <div className="space-y-3">
                  <input value={newNote.title} onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} className={inputClass} />
                  <textarea value={newNote.content} onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))} rows={3} className={`${inputClass} resize-none`} />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono font-bold bg-emerald-500 text-white"><Check className="w-3 h-3" /> Save</button>
                    <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-neutral-400"><X className="w-3 h-3" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {n.pinned && <span className="text-amber-400 text-xs">📌</span>}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${tagInfo.color}`}><TagIcon className="w-2.5 h-2.5 inline mr-1" />{tagInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePin(n.id)} className={`p-1.5 rounded transition-colors ${n.pinned ? 'text-amber-400' : 'text-neutral-500 hover:text-amber-400'}`}>📌</button>
                      <button onClick={() => startEdit(n)} className="p-1.5 rounded text-neutral-500 hover:text-cyan-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteNote(n.id)} className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {n.title && <h4 className="text-sm font-bold mb-1">{n.title}</h4>}
                  <p className="text-xs text-neutral-400 whitespace-pre-wrap">{n.content}</p>
                  <p className="text-[10px] text-neutral-600 mt-2">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
