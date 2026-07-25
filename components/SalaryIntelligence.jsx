'use client';

import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, MapPin, BarChart3, ArrowUpDown, Filter, Building2, Globe } from 'lucide-react';

const SALARY_DATA = {
  'Software Engineer': {
    'United States': { min: 95000, max: 180000, median: 135000, currency: 'USD', costIndex: 100 },
    'Germany': { min: 55000, max: 95000, median: 72000, currency: 'EUR', costIndex: 72 },
    'Netherlands': { min: 50000, max: 85000, median: 65000, currency: 'EUR', costIndex: 78 },
    'United Kingdom': { min: 45000, max: 90000, median: 62000, currency: 'GBP', costIndex: 82 },
    'Switzerland': { min: 90000, max: 150000, median: 115000, currency: 'CHF', costIndex: 130 },
    'Canada': { min: 65000, max: 120000, median: 85000, currency: 'CAD', costIndex: 75 },
    'Australia': { min: 70000, max: 130000, median: 95000, currency: 'AUD', costIndex: 80 },
    'Singapore': { min: 60000, max: 110000, median: 80000, currency: 'SGD', costIndex: 85 },
    'Japan': { min: 40000, max: 80000, median: 55000, currency: 'JPY', costIndex: 70 },
    'India': { min: 15000, max: 45000, median: 25000, currency: 'INR', costIndex: 30 },
  },
  'ML Engineer': {
    'United States': { min: 120000, max: 220000, median: 165000, currency: 'USD', costIndex: 100 },
    'Germany': { min: 70000, max: 120000, median: 90000, currency: 'EUR', costIndex: 72 },
    'United Kingdom': { min: 60000, max: 110000, median: 80000, currency: 'GBP', costIndex: 82 },
    'Canada': { min: 85000, max: 150000, median: 110000, currency: 'CAD', costIndex: 75 },
    'Singapore': { min: 80000, max: 140000, median: 105000, currency: 'SGD', costIndex: 85 },
  },
  'Data Scientist': {
    'United States': { min: 90000, max: 170000, median: 125000, currency: 'USD', costIndex: 100 },
    'Germany': { min: 55000, max: 95000, median: 70000, currency: 'EUR', costIndex: 72 },
    'Netherlands': { min: 50000, max: 80000, median: 62000, currency: 'EUR', costIndex: 78 },
    'United Kingdom': { min: 45000, max: 85000, median: 60000, currency: 'GBP', costIndex: 82 },
    'Canada': { min: 70000, max: 120000, median: 90000, currency: 'CAD', costIndex: 75 },
  },
  'DevOps Engineer': {
    'United States': { min: 100000, max: 180000, median: 140000, currency: 'USD', costIndex: 100 },
    'Germany': { min: 60000, max: 100000, median: 78000, currency: 'EUR', costIndex: 72 },
    'Netherlands': { min: 55000, max: 90000, median: 70000, currency: 'EUR', costIndex: 78 },
    'United Kingdom': { min: 50000, max: 95000, median: 68000, currency: 'GBP', costIndex: 82 },
  },
  'Product Designer': {
    'United States': { min: 80000, max: 150000, median: 110000, currency: 'USD', costIndex: 100 },
    'Germany': { min: 45000, max: 80000, median: 60000, currency: 'EUR', costIndex: 72 },
    'Netherlands': { min: 42000, max: 72000, median: 55000, currency: 'EUR', costIndex: 78 },
    'United Kingdom': { min: 38000, max: 75000, median: 52000, currency: 'GBP', costIndex: 82 },
  },
  'Engineering Manager': {
    'United States': { min: 140000, max: 250000, median: 185000, currency: 'USD', costIndex: 100 },
    'Germany': { min: 80000, max: 130000, median: 100000, currency: 'EUR', costIndex: 72 },
    'Netherlands': { min: 70000, max: 120000, median: 90000, currency: 'EUR', costIndex: 78 },
    'United Kingdom': { min: 65000, max: 120000, median: 85000, currency: 'GBP', costIndex: 82 },
  },
};

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', CHF: 'CHF ', CAD: 'C$', AUD: 'A$', SGD: 'S$', JPY: '¥', INR: '₹' };

function formatSalary(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency + ' ';
  return `${sym}${(amount / 1000).toFixed(0)}K`;
}

export default function SalaryIntelligence({ dark }) {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('median');
  const [showPurchasingPower, setShowPurchasingPower] = useState(false);

  const roles = Object.keys(SALARY_DATA);
  const countries = useMemo(() => {
    const set = new Set();
    Object.values(SALARY_DATA).forEach(r => Object.keys(r).forEach(c => set.add(c)));
    return [...set].sort();
  }, []);

  const roleData = SALARY_DATA[selectedRole] || {};

  const sortedCountries = useMemo(() => {
    const entries = Object.entries(roleData).map(([country, data]) => ({
      country,
      ...data,
      purchasingPower: Math.round((data.median / data.costIndex) * 100),
    }));
    entries.sort((a, b) => {
      if (sortBy === 'median') return b.median - a.median;
      if (sortBy === 'purchasingPower') return b.purchasingPower - a.purchasingPower;
      if (sortBy === 'country') return a.country.localeCompare(b.country);
      return 0;
    });
    return selectedCountry === 'all' ? entries : entries.filter(e => e.country === selectedCountry);
  }, [roleData, sortBy, selectedCountry]);

  const stats = useMemo(() => {
    const vals = sortedCountries.map(c => c.median);
    return {
      highest: vals.length ? Math.max(...vals) : 0,
      lowest: vals.length ? Math.min(...vals) : 0,
      avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
      count: vals.length,
    };
  }, [sortedCountries]);

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${dark ? 'bg-amber-500/10' : 'bg-amber-500/10'}`}>
          <DollarSign className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Salary Intelligence</h2>
          <p className="text-xs text-neutral-400">Compare compensation across roles and countries</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
          className={`px-3 py-2 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
          className={`px-3 py-2 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
          <option value="all">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex border rounded overflow-hidden">
          {['median', 'purchasingPower', 'country'].map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-[10px] font-mono transition-colors ${sortBy === s ? 'bg-amber-500/10 text-amber-400' : 'text-neutral-500 hover:text-neutral-300'}`}>
              {s === 'median' ? 'Median' : s === 'purchasingPower' ? 'Purchasing Power' : 'A-Z'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowPurchasingPower(!showPurchasingPower)}
          className={`px-3 py-1.5 rounded text-[10px] font-mono transition-colors ${showPurchasingPower ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-neutral-500 border border-neutral-800'}`}>
          Cost-Adjusted
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-lg font-bold text-emerald-400">{formatSalary(stats.highest, roleData[sortedCountries[0]?.country]?.currency || 'USD')}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Highest Median</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-lg font-bold text-amber-400">{formatSalary(stats.avg, 'USD')}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Global Average</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-lg font-bold text-red-400">{formatSalary(stats.lowest, roleData[sortedCountries[sortedCountries.length - 1]?.country]?.currency || 'USD')}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Lowest Median</span>
        </div>
        <div className={`p-3 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-lg font-bold text-cyan-400">{stats.count}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Countries</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedCountries.map((c, i) => {
          const barWidth = ((c.median - stats.lowest) / (stats.highest - stats.lowest || 1)) * 100;
          return (
            <div key={c.country} className={`p-4 rounded border transition-colors ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-neutral-300 w-6 text-right">#{i + 1}</span>
                  <div>
                    <h4 className="text-sm font-bold">{c.country}</h4>
                    <p className="text-[10px] text-neutral-500">Cost Index: {c.costIndex}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">{formatSalary(c.median, c.currency)}</span>
                  <p className="text-[10px] text-neutral-500">{formatSalary(c.min, c.currency)} - {formatSalary(c.max, c.currency)}</p>
                </div>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
              </div>
              {showPurchasingPower && (
                <p className="text-[10px] text-cyan-400 mt-2 font-mono">Purchasing Power Index: {c.purchasingPower}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className={`mt-6 p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
        <h4 className="text-xs font-bold font-mono text-neutral-400 mb-2">Key Insights</h4>
        <ul className="space-y-1 text-xs text-neutral-400">
          <li>- Switzerland offers the highest absolute salaries but has a 1.3x cost of living index</li>
          <li>- Germany and Netherlands have strong salaries with excellent work-life balance</li>
          <li>- US salaries are highest but vary significantly by state (data reflects national median)</li>
          <li>- Purchasing power adjusted: Switzerland and Germany often outperform US roles</li>
        </ul>
      </div>
    </div>
  );
}
