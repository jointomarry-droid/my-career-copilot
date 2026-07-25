'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, ExternalLink, MessageSquare, Calendar, Star, Edit3, Check, X, Linkedin, Mail, Phone } from 'lucide-react';

const RELATIONSHIP_TYPES = ['Recruiter', 'Hiring Manager', 'Engineer', 'Manager', 'HR', 'Referral', 'Mentor', 'Peer'];
const STATUS_TYPES = ['New', 'Contacted', 'Responded', 'Meeting Set', 'Referred', 'Follow Up', 'Inactive'];

const DEFAULT_CONTACTS = [
  { id: '1', name: 'Sarah Chen', company: 'Spotify', role: 'Engineering Manager', type: 'Hiring Manager', status: 'Responded', email: 'sarah.c@spotify.com', linkedin: 'linkedin.com/in/sarahchen', phone: '+31 6 1234 5678', notes: 'Met at TechConnect Berlin. Interested in frontend roles. Responded to follow-up email.', lastContact: '2026-07-20', strength: 4 },
  { id: '2', name: 'Marcus Weber', company: 'ASML', role: 'Senior Recruiter', type: 'Recruiter', status: 'Meeting Set', email: 'm.weber@asml.com', linkedin: 'linkedin.com/in/marcusweber', phone: '', notes: 'Handles all software engineering recruitment. Meeting scheduled for next Tuesday.', lastContact: '2026-07-22', strength: 3 },
  { id: '3', name: 'Priya Sharma', company: 'DeepMind', role: 'ML Engineer', type: 'Referral', status: 'Referred', email: 'p.sharma@deepmind.com', linkedin: 'linkedin.com/in/priyasharma', phone: '', notes: 'Former colleague. Has referred me internally for ML Engineer position.', lastContact: '2026-07-15', strength: 5 },
  { id: '4', name: 'Tom de Vries', company: 'Booking.com', role: 'Tech Lead', type: 'Engineer', status: 'Contacted', email: 'tom.dv@booking.com', linkedin: 'linkedin.com/in/tomdevries', phone: '+31 6 8765 4321', notes: 'Connected on LinkedIn. Shared insights about team culture.', lastContact: '2026-07-10', strength: 2 },
];

export default function NetworkingTracker({ dark }) {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [newContact, setNewContact] = useState({
    name: '', company: '', role: '', type: 'Recruiter', status: 'New',
    email: '', linkedin: '', phone: '', notes: '', strength: 3,
  });

  useEffect(() => {
    const stored = localStorage.getItem('copilot_network');
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      setContacts(DEFAULT_CONTACTS);
      localStorage.setItem('copilot_network', JSON.stringify(DEFAULT_CONTACTS));
    }
  }, []);

  const saveContacts = useCallback((c) => {
    setContacts(c);
    localStorage.setItem('copilot_network', JSON.stringify(c));
  }, []);

  const addContact = () => {
    if (!newContact.name) return;
    const contact = {
      ...newContact,
      id: Date.now().toString(),
      lastContact: new Date().toISOString().split('T')[0],
    };
    saveContacts([...contacts, contact]);
    setNewContact({ name: '', company: '', role: '', type: 'Recruiter', status: 'New', email: '', linkedin: '', phone: '', notes: '', strength: 3 });
    setShowForm(false);
  };

  const deleteContact = (id) => {
    saveContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id, updates) => {
    saveContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const startEdit = (c) => {
    setEditing(c.id);
    setNewContact({ name: c.name, company: c.company, role: c.role, type: c.type, status: c.status, email: c.email, linkedin: c.linkedin, phone: c.phone, notes: c.notes, strength: c.strength });
  };

  const saveEdit = () => {
    updateContact(editing, newContact);
    setEditing(null);
    setNewContact({ name: '', company: '', role: '', type: 'Recruiter', status: 'New', email: '', linkedin: '', phone: '', notes: '', strength: 3 });
  };

  const filtered = contacts.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: contacts.length,
    active: contacts.filter(c => !['Inactive'].includes(c.status)).length,
    referrals: contacts.filter(c => c.type === 'Referral').length,
    meetings: contacts.filter(c => c.status === 'Meeting Set').length,
  };

  const statusColors = {
    'New': 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    'Contacted': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Responded': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Meeting Set': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Referred': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Follow Up': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Inactive': 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20',
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-teal-500/10' : 'bg-teal-500/10'}`}>
            <Users className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Networking Tracker</h2>
            <p className="text-xs text-neutral-400">Manage your professional connections and referrals</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'}`}>
          <Plus className="w-3.5 h-3.5" /> Add Contact
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold">{stats.total}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Total</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-cyan-400">{stats.active}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Active</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-emerald-400">{stats.referrals}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Referrals</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-violet-400">{stats.meetings}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Meetings</span>
        </div>
      </div>

      {showForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input placeholder="Name *" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            <input placeholder="Company" value={newContact.company} onChange={e => setNewContact(p => ({ ...p, company: e.target.value }))} className={inputClass} />
            <input placeholder="Role" value={newContact.role} onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))} className={inputClass} />
            <select value={newContact.type} onChange={e => setNewContact(p => ({ ...p, type: e.target.value }))} className={inputClass}>
              {RELATIONSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={newContact.status} onChange={e => setNewContact(p => ({ ...p, status: e.target.value }))} className={inputClass}>
              {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} className={inputClass} />
            <input placeholder="LinkedIn URL" value={newContact.linkedin} onChange={e => setNewContact(p => ({ ...p, linkedin: e.target.value }))} className={inputClass} />
            <input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">Strength:</label>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setNewContact(p => ({ ...p, strength: s }))}
                  className={`text-xs ${s <= newContact.strength ? 'text-amber-400' : 'text-neutral-600'}`}>★</button>
              ))}
            </div>
            <textarea placeholder="Notes" rows={2} value={newContact.notes} onChange={e => setNewContact(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} sm:col-span-3 resize-none`} />
          </div>
          <div className="flex gap-2">
            <button onClick={addContact} className="px-4 py-2 rounded text-xs font-mono font-bold bg-teal-500 text-white hover:bg-teal-400 transition-colors">Save Contact</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
          className={`px-3 py-1.5 rounded text-xs font-mono border outline-none w-48 ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className={`px-3 py-1.5 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
          <option value="all">All Types</option>
          {RELATIONSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className={`px-3 py-1.5 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
          <option value="all">All Status</option>
          {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`text-center py-12 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
            <Users className="w-8 h-8 mx-auto mb-3 text-neutral-500" />
            <p className="text-sm text-neutral-500">No contacts found.</p>
          </div>
        )}
        {filtered.map(c => (
          <div key={c.id} className={`p-4 rounded border transition-all ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
            {editing === c.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                <input value={newContact.company} onChange={e => setNewContact(p => ({ ...p, company: e.target.value }))} className={inputClass} />
                <input value={newContact.role} onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))} className={inputClass} />
                <select value={newContact.status} onChange={e => setNewContact(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                  {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea value={newContact.notes} onChange={e => setNewContact(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputClass} sm:col-span-2 resize-none`} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono font-bold bg-emerald-500 text-white"><Check className="w-3 h-3" /> Save</button>
                  <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-neutral-400"><X className="w-3 h-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold">{c.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-1">{c.role} at {c.company}</p>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 mb-2">
                    {c.email && <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {c.email}</span>}
                    {c.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-2.5 h-2.5" /> LinkedIn</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {c.phone}</span>}
                  </div>
                  {c.notes && <p className="text-xs text-neutral-500 line-clamp-2">{c.notes}</p>}
                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    <span className="text-neutral-500">{c.type}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-500">Last: {c.lastContact}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-amber-400">{'★'.repeat(c.strength)}{'☆'.repeat(5 - c.strength)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded text-neutral-500 hover:text-cyan-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteContact(c.id)} className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
