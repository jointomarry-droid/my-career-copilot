'use client';

import { useState, useCallback } from 'react';
import { ClipboardList, Check, Plus, Trash2, Download, ChevronDown, ChevronUp, FileText, AlertTriangle } from 'lucide-react';

const VISA_CHECKLISTS = {
  'German Blue Card': {
    category: 'Work Permit',
    country: 'Germany',
    documents: [
      { id: '1', name: 'Valid Passport', description: 'Must be valid for at least 6 months beyond planned stay', required: true, category: 'identity' },
      { id: '2', name: 'University Degree Certificate', description: 'Original or apostilled copy of your highest degree', required: true, category: 'education' },
      { id: '3', name: 'Degree Recognition (anabin)', description: 'Check if your university is recognized on anabin database', required: true, category: 'education' },
      { id: '4', name: 'Employment Contract', description: 'Signed job contract with salary meeting Blue Card threshold (€45,300 for shortage occupations)', required: true, category: 'employment' },
      { id: '5', name: 'CV / Resume', description: 'Updated Europass or standard format CV', required: true, category: 'personal' },
      { id: '6', name: 'Passport Photos', description: 'Biometric passport-size photos (35x45mm)', required: true, category: 'personal' },
      { id: '7', name: 'Health Insurance', description: 'Proof of health insurance coverage in Germany', required: true, category: 'health' },
      { id: '8', name: 'Proof of Address', description: 'Registration certificate (Anmeldung) or rental agreement', required: false, category: 'residence' },
      { id: '9', name: 'IELTS/English Certificate', description: 'English proficiency proof if required by employer', required: false, category: 'language' },
      { id: '10', name: 'German Language Certificate', description: 'A1/B1 certificate if applying for settlement permit later', required: false, category: 'language' },
    ],
  },
  'UK Skilled Worker Visa': {
    category: 'Work Permit',
    country: 'United Kingdom',
    documents: [
      { id: '1', name: 'Valid Passport', description: 'Must be valid for the duration of your stay', required: true, category: 'identity' },
      { id: '2', name: 'Certificate of Sponsorship (CoS)', description: 'Reference number from your UK employer/sponsor', required: true, category: 'employment' },
      { id: '3', name: 'Job Title & Salary Proof', description: 'Must meet minimum salary threshold for your occupation code', required: true, category: 'employment' },
      { id: '4', name: 'English Language Proof', description: 'IELTS (CEFR B1+) or equivalent qualification', required: true, category: 'language' },
      { id: '5', name: 'TB Test Certificate', description: 'Tuberculosis test if applying from listed countries', required: true, category: 'health' },
      { id: '6', name: 'Criminal Record Check', description: 'Police clearance certificate from countries lived in 12+ months', required: true, category: 'legal' },
      { id: '7', name: 'Bank Statements', description: 'Show sufficient funds to support yourself (usually 28 days)', required: true, category: 'financial' },
      { id: '8', name: 'ATAS Certificate', description: 'Academic Technology Approval Scheme for sensitive subjects', required: false, category: 'education' },
      { id: '9', name: 'Passport Photos', description: 'UK specification passport photos', required: true, category: 'personal' },
    ],
  },
  'Canada Express Entry': {
    category: 'Permanent Residency',
    country: 'Canada',
    documents: [
      { id: '1', name: 'Valid Passport', description: 'Valid for at least 2 years', required: true, category: 'identity' },
      { id: '2', name: 'Language Test (IELTS/CELPIP)', description: 'English test results less than 2 years old', required: true, category: 'language' },
      { id: '3', name: 'ECA Report', description: 'Educational Credential Assessment from WES or similar', required: true, category: 'education' },
      { id: '4', name: 'Work Reference Letters', description: 'Letters from employers confirming work experience', required: true, category: 'employment' },
      { id: '5', name: 'Proof of Funds', description: 'Bank statements showing settlement funds', required: true, category: 'financial' },
      { id: '6', name: 'Police Certificates', description: 'From every country lived in 6+ months since age 18', required: true, category: 'legal' },
      { id: '7', name: 'Medical Examination', description: 'From IRCC-designated panel physician', required: true, category: 'health' },
      { id: '8', name: 'Digital Photos', description: 'Meets IRCC specifications', required: true, category: 'personal' },
      { id: '9', name: 'Marriage Certificate', description: 'If applicable, for spouse accompanying', required: false, category: 'personal' },
    ],
  },
  'Netherlands MVV/Residence Permit': {
    category: 'Work Permit',
    country: 'Netherlands',
    documents: [
      { id: '1', name: 'Valid Passport', description: 'Must be valid for at least 3 months after planned departure', required: true, category: 'identity' },
      { id: '2', name: 'Employment Contract', description: 'Signed contract with recognized sponsor (IND approved)', required: true, category: 'employment' },
      { id: '3', name: 'BSN Number', description: 'Dutch citizen service number (applied for during registration)', required: false, category: 'identity' },
      { id: '4', name: 'IND Approval (TEV)', description: 'Entry and residence procedure approval from IND', required: true, category: 'legal' },
      { id: '5', name: 'Health Insurance', description: 'Dutch health insurance (basisverzekering)', required: true, category: 'health' },
      { id: '6', name: 'Proof of Accommodation', description: 'Rental agreement or employer-provided housing', required: true, category: 'residence' },
      { id: '7', name: 'Passport Photos', description: 'EU specification biometric photos', required: true, category: 'personal' },
      { id: '8', name: 'Degree Certificate', description: 'For Highly Skilled Migrant scheme verification', required: true, category: 'education' },
    ],
  },
};

const DOC_CATEGORIES = {
  identity: { label: 'Identity', color: 'text-cyan-400 bg-cyan-500/10' },
  education: { label: 'Education', color: 'text-indigo-400 bg-indigo-500/10' },
  employment: { label: 'Employment', color: 'text-emerald-400 bg-emerald-500/10' },
  health: { label: 'Health', color: 'text-pink-400 bg-pink-500/10' },
  language: { label: 'Language', color: 'text-amber-400 bg-amber-500/10' },
  financial: { label: 'Financial', color: 'text-violet-400 bg-violet-500/10' },
  legal: { label: 'Legal', color: 'text-red-400 bg-red-500/10' },
  personal: { label: 'Personal', color: 'text-neutral-400 bg-neutral-500/10' },
  residence: { label: 'Residence', color: 'text-blue-400 bg-blue-500/10' },
};

export default function DocumentChecklist({ dark }) {
  const [selectedVisa, setSelectedVisa] = useState('German Blue Card');
  const [checkedItems, setCheckedItems] = useState({});
  const [customDocs, setCustomDocs] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', description: '', required: false, category: 'personal' });
  const [expandedCat, setExpandedCat] = useState({});

  const checklist = VISA_CHECKLISTS[selectedVisa];
  const allDocs = [...checklist.documents, ...(customDocs[selectedVisa] || [])];

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [`${selectedVisa}_${id}`]: !prev[`${selectedVisa}_${id}`] }));
  };

  const addCustomDoc = () => {
    if (!newDoc.name) return;
    const doc = { ...newDoc, id: `custom_${Date.now()}` };
    setCustomDocs(prev => ({
      ...prev,
      [selectedVisa]: [...(prev[selectedVisa] || []), doc],
    }));
    setNewDoc({ name: '', description: '', required: false, category: 'personal' });
    setShowAddForm(false);
  };

  const removeCustomDoc = (id) => {
    setCustomDocs(prev => ({
      ...prev,
      [selectedVisa]: (prev[selectedVisa] || []).filter(d => d.id !== id),
    }));
  };

  const groupedDocs = {};
  allDocs.forEach(doc => {
    if (!groupedDocs[doc.category]) groupedDocs[doc.category] = [];
    groupedDocs[doc.category].push(doc);
  });

  const progress = {
    total: allDocs.length,
    checked: allDocs.filter(d => checkedItems[`${selectedVisa}_${d.id}`]).length,
    required: allDocs.filter(d => d.required).length,
    requiredChecked: allDocs.filter(d => d.required && checkedItems[`${selectedVisa}_${d.id}`]).length,
  };
  progress.percentage = Math.round((progress.checked / progress.total) * 100);

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-pink-500/10' : 'bg-pink-500/10'}`}>
            <ClipboardList className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Document Checklist</h2>
            <p className="text-xs text-neutral-400">Visa-ready document packages for every destination</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20' : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'}`}>
          <Plus className="w-3.5 h-3.5" /> Add Doc
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(VISA_CHECKLISTS).map(v => (
          <button key={v} onClick={() => setSelectedVisa(v)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              selectedVisa === v
                ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                : dark ? 'text-neutral-500 hover:text-neutral-300 border border-neutral-800' : 'text-neutral-500 hover:text-neutral-700 border border-neutral-200'
            }`}>
            {v}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-neutral-400">Progress</span>
          <span className="text-xs font-mono text-pink-400 font-bold">{progress.percentage}%</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-neutral-500">
          <span>{progress.checked}/{progress.total} documents</span>
          <span>{progress.requiredChecked}/{progress.required} required</span>
        </div>
      </div>

      {showAddForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Document name" value={newDoc.name} onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            <select value={newDoc.category} onChange={e => setNewDoc(p => ({ ...p, category: e.target.value }))} className={inputClass}>
              {Object.entries(DOC_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input placeholder="Description" value={newDoc.description} onChange={e => setNewDoc(p => ({ ...p, description: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" checked={newDoc.required} onChange={e => setNewDoc(p => ({ ...p, required: e.target.checked }))} className="rounded" /> Required
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={addCustomDoc} className="px-4 py-2 rounded text-xs font-mono font-bold bg-pink-500 text-white hover:bg-pink-400 transition-colors">Add</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(groupedDocs).map(([cat, docs]) => {
          const catInfo = DOC_CATEGORIES[cat] || DOC_CATEGORIES.personal;
          const isExpanded = expandedCat[cat] !== false;
          const catChecked = docs.filter(d => checkedItems[`${selectedVisa}_${d.id}`]).length;
          return (
            <div key={cat} className={`rounded border overflow-hidden ${dark ? 'border-neutral-800' : 'border-neutral-200'}`}>
              <button onClick={() => setExpandedCat(prev => ({ ...prev, [cat]: !isExpanded }))}
                className={`w-full flex items-center justify-between p-3 transition-colors ${dark ? 'bg-neutral-950/30 hover:bg-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${catInfo.color}`}>{catInfo.label}</span>
                  <span className="text-xs text-neutral-400">{catChecked}/{docs.length}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
              </button>
              {isExpanded && (
                <div className="divide-y divide-neutral-800">
                  {docs.map(doc => {
                    const isChecked = checkedItems[`${selectedVisa}_${doc.id}`];
                    const isCustom = doc.id.startsWith('custom_');
                    return (
                      <div key={doc.id} className={`flex items-center gap-3 p-3 transition-colors ${isChecked ? 'bg-emerald-500/5' : ''}`}>
                        <button onClick={() => toggleCheck(doc.id)}
                          className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500' : dark ? 'border-neutral-700 hover:border-neutral-500' : 'border-neutral-300 hover:border-neutral-400'}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-medium ${isChecked ? 'line-through text-neutral-500' : ''}`}>{doc.name}</h4>
                            {doc.required && <span className="text-[9px] font-mono text-red-400">REQ</span>}
                            {isCustom && <span className="text-[9px] font-mono text-neutral-500">CUSTOM</span>}
                          </div>
                          <p className="text-xs text-neutral-500 truncate">{doc.description}</p>
                        </div>
                        {isCustom && (
                          <button onClick={() => removeCustomDoc(doc.id)} className="shrink-0 p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {progress.percentage === 100 && (
        <div className={`mt-6 p-4 rounded border text-center ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
          <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-bold text-emerald-400">All documents ready for {selectedVisa}!</p>
        </div>
      )}
    </div>
  );
}
