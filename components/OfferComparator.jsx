'use client';

import { useState, useCallback } from 'react';
import { Scale, Plus, Trash2, Star, TrendingUp, MapPin, Building2, DollarSign, Heart, ArrowUpDown, Check, X } from 'lucide-react';

const DEFAULT_OFFERS = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'Spotify', country: 'Sweden', salary: 85000, currency: 'EUR', equity: 'Stock options', benefits: ['Remote hybrid', 'Unlimited PTO', 'Learning budget', 'Relocation package'], workLife: 4, growthOpportunity: 4, techStack: 'React, TypeScript, Node.js', visaSponsorship: true, commute: '20 min' },
  { id: '2', title: 'ML Engineer', company: 'DeepMind', country: 'UK', salary: 95000, currency: 'GBP', equity: 'RSUs', benefits: ['Research time', 'Conference budget', 'Health insurance', 'Pension'], workLife: 3, growthOpportunity: 5, techStack: 'Python, TensorFlow, JAX', visaSponsorship: true, commute: '35 min' },
  { id: '3', title: 'Full Stack Developer', company: 'Booking.com', country: 'Netherlands', salary: 72000, currency: 'EUR', equity: 'RSUs', benefits: ['30 days PTO', 'Travel credits', 'Gym', '30% ruling tax benefit'], workLife: 4, growthOpportunity: 3, techStack: 'React, Java, Kubernetes', visaSponsorship: true, commute: '15 min' },
];

const CURRENCY_RATES = { EUR: 1, GBP: 1.17, USD: 1.08, CHF: 1.05, CAD: 0.73, AUD: 0.65, SGD: 0.72, SEK: 0.09, NOK: 0.09, DKK: 0.14 };

function convertToEUR(amount, currency) {
  return Math.round(amount * (CURRENCY_RATES[currency] || 1));
}

function StarRating({ value, onChange, dark }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => onChange?.(star)}
          className={`transition-colors ${star <= value ? 'text-amber-400' : 'text-neutral-600 hover:text-neutral-400'}`}>
          <Star className={`w-3.5 h-3.5 ${star <= value ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );
}

export default function OfferComparator({ dark }) {
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('salary');
  const [newOffer, setNewOffer] = useState({
    title: '', company: '', country: '', salary: '', currency: 'EUR', equity: '',
    benefits: '', workLife: 3, growthOpportunity: 3, techStack: '', visaSponsorship: false, commute: '',
  });
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const addOffer = () => {
    if (!newOffer.title || !newOffer.salary) return;
    const offer = {
      ...newOffer,
      id: Date.now().toString(),
      salary: Number(newOffer.salary),
      benefits: newOffer.benefits.split(',').map(b => b.trim()).filter(Boolean),
    };
    setOffers(prev => [...prev, offer]);
    setNewOffer({ title: '', company: '', country: '', salary: '', currency: 'EUR', equity: '', benefits: '', workLife: 3, growthOpportunity: 3, techStack: '', visaSponsorship: false, commute: '' });
    setShowForm(false);
  };

  const removeOffer = (id) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    setSelectedForCompare(prev => prev.filter(i => i !== id));
  };

  const toggleCompare = (id) => {
    setSelectedForCompare(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 3));
  };

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'salary') return convertToEUR(b.salary, b.currency) - convertToEUR(a.salary, a.currency);
    if (sortBy === 'workLife') return b.workLife - a.workLife;
    if (sortBy === 'growth') return b.growthOpportunity - a.growthOpportunity;
    if (sortBy === 'company') return a.company.localeCompare(b.company);
    return 0;
  });

  const compareOffers = offers.filter(o => selectedForCompare.includes(o.id));

  const bestSalary = Math.max(...offers.map(o => convertToEUR(o.salary, o.currency)));
  const bestWorkLife = Math.max(...offers.map(o => o.workLife));

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-violet-500/10' : 'bg-violet-500/10'}`}>
            <Scale className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Offer Comparator</h2>
            <p className="text-xs text-neutral-400">Compare job offers side-by-side to make the right choice</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedForCompare.length >= 2 && (
            <button onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${compareMode ? 'bg-violet-500 text-white' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
              <Scale className="w-3.5 h-3.5" /> Compare ({selectedForCompare.length})
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20' : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'}`}>
            <Plus className="w-3.5 h-3.5" /> Add Offer
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input placeholder="Job title" value={newOffer.title} onChange={e => setNewOffer(p => ({ ...p, title: e.target.value }))} className={inputClass} />
            <input placeholder="Company" value={newOffer.company} onChange={e => setNewOffer(p => ({ ...p, company: e.target.value }))} className={inputClass} />
            <input placeholder="Country" value={newOffer.country} onChange={e => setNewOffer(p => ({ ...p, country: e.target.value }))} className={inputClass} />
            <input type="number" placeholder="Annual salary" value={newOffer.salary} onChange={e => setNewOffer(p => ({ ...p, salary: e.target.value }))} className={inputClass} />
            <select value={newOffer.currency} onChange={e => setNewOffer(p => ({ ...p, currency: e.target.value }))} className={inputClass}>
              {Object.keys(CURRENCY_RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Equity (RSUs, options...)" value={newOffer.equity} onChange={e => setNewOffer(p => ({ ...p, equity: e.target.value }))} className={inputClass} />
            <input placeholder="Benefits (comma separated)" value={newOffer.benefits} onChange={e => setNewOffer(p => ({ ...p, benefits: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
            <input placeholder="Tech stack" value={newOffer.techStack} onChange={e => setNewOffer(p => ({ ...p, techStack: e.target.value }))} className={inputClass} />
            <div className="flex gap-3 items-center">
              <label className="text-xs text-neutral-400">Work/Life:</label>
              <StarRating value={newOffer.workLife} onChange={v => setNewOffer(p => ({ ...p, workLife: v }))} dark={dark} />
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-xs text-neutral-400">Growth:</label>
              <StarRating value={newOffer.growthOpportunity} onChange={v => setNewOffer(p => ({ ...p, growthOpportunity: v }))} dark={dark} />
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" checked={newOffer.visaSponsorship} onChange={e => setNewOffer(p => ({ ...p, visaSponsorship: e.target.checked }))} className="rounded" /> Visa Sponsorship
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={addOffer} className="px-4 py-2 rounded text-xs font-mono font-bold bg-violet-500 text-white hover:bg-violet-400 transition-colors">Save Offer</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {['salary', 'workLife', 'growth', 'company'].map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              sortBy === s ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-neutral-500 border border-neutral-800'
            }`}>
            <ArrowUpDown className="w-3 h-3" />
            {s === 'salary' ? 'Salary' : s === 'workLife' ? 'Work/Life' : s === 'growth' ? 'Growth' : 'Company'}
          </button>
        ))}
      </div>

      {compareMode && compareOffers.length >= 2 ? (
        <div className={`rounded border overflow-hidden ${dark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`${dark ? 'bg-neutral-950/50' : 'bg-neutral-50'}`}>
                  <th className="p-3 text-left font-mono text-neutral-400">Criteria</th>
                  {compareOffers.map(o => (
                    <th key={o.id} className="p-3 text-left font-bold">{o.title} @ {o.company}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {[
                  { label: 'Salary (EUR)', render: o => `€${convertToEUR(o.salary, o.currency).toLocaleString()}`, highlight: o => convertToEUR(o.salary, o.currency) === bestSalary },
                  { label: 'Original Salary', render: o => `${o.currency} ${o.salary.toLocaleString()}` },
                  { label: 'Equity', render: o => o.equity || '-' },
                  { label: 'Country', render: o => o.country },
                  { label: 'Work/Life', render: o => <StarRating value={o.workLife} dark={dark} />, highlight: o => o.workLife === bestWorkLife },
                  { label: 'Growth', render: o => <StarRating value={o.growthOpportunity} dark={dark} /> },
                  { label: 'Tech Stack', render: o => o.techStack },
                  { label: 'Benefits', render: o => o.benefits?.join(', ') || '-' },
                  { label: 'Visa', render: o => o.visaSponsorship ? 'Yes' : 'No', highlight: o => o.visaSponsorship },
                  { label: 'Commute', render: o => o.commute || '-' },
                ].map(row => (
                  <tr key={row.label} className={`${dark ? 'hover:bg-neutral-900/30' : 'hover:bg-neutral-50'}`}>
                    <td className="p-3 font-mono text-neutral-400">{row.label}</td>
                    {compareOffers.map(o => (
                      <td key={o.id} className={`p-3 ${row.highlight?.(o) ? 'text-emerald-400 font-bold' : ''}`}>{row.render(o)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedOffers.map(offer => {
            const eurSalary = convertToEUR(offer.salary, offer.currency);
            const isBest = eurSalary === bestSalary;
            const isSelected = selectedForCompare.includes(offer.id);
            return (
              <div key={offer.id} className={`relative p-4 rounded border transition-all ${isSelected ? 'border-violet-500/30 bg-violet-500/5' : dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
                {isBest && <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500 text-white font-bold">BEST PAY</span>}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold">{offer.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <Building2 className="w-3 h-3" /> {offer.company}
                      <MapPin className="w-3 h-3" /> {offer.country}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleCompare(offer.id)} className={`p-1.5 rounded transition-colors ${isSelected ? 'text-violet-400' : 'text-neutral-500 hover:text-violet-400'}`}>
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeOffer(offer.id)} className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className={`p-3 rounded mb-3 ${dark ? 'bg-neutral-900/50' : 'bg-neutral-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-400">€{eurSalary.toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-500">{offer.currency} {offer.salary.toLocaleString()}</span>
                  </div>
                  {offer.equity && <p className="text-[10px] text-neutral-500 mt-1">+ {offer.equity}</p>}
                </div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-neutral-400">Work/Life</span>
                  <StarRating value={offer.workLife} dark={dark} />
                </div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-neutral-400">Growth</span>
                  <StarRating value={offer.growthOpportunity} dark={dark} />
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {offer.benefits?.slice(0, 3).map((b, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[9px] font-mono bg-neutral-800 text-neutral-400">{b}</span>
                  ))}
                  {offer.benefits?.length > 3 && <span className="text-[9px] text-neutral-500">+{offer.benefits.length - 3}</span>}
                </div>
                {offer.visaSponsorship && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Visa Sponsorship</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
