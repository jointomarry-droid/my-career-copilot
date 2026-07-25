'use client';

import { useState, useMemo } from 'react';
import { Plane, DollarSign, MapPin, ArrowRight, TrendingDown, TrendingUp, Info, Calculator } from 'lucide-react';

const RELOCATION_DATA = {
  'Germany': { avgRent: 1200, utilities: 250, groceries: 350, transport: 80, internet: 35, healthInsurance: 450, taxRate: 35, visaFee: 75, flightCost: 400, depositMultiplier: 3, miscSetup: 500 },
  'Netherlands': { avgRent: 1400, utilities: 200, groceries: 320, transport: 90, internet: 40, healthInsurance: 120, taxRate: 37, visaFee: 200, flightCost: 350, depositMultiplier: 2, miscSetup: 450 },
  'United Kingdom': { avgRent: 1500, utilities: 180, groceries: 300, transport: 150, internet: 35, healthInsurance: 0, taxRate: 30, visaFee: 259, flightCost: 300, depositMultiplier: 6, miscSetup: 600 },
  'Switzerland': { avgRent: 2200, utilities: 150, groceries: 500, transport: 100, internet: 50, healthInsurance: 400, taxRate: 22, visaFee: 100, flightCost: 500, depositMultiplier: 3, miscSetup: 800 },
  'United States': { avgRent: 1800, utilities: 150, groceries: 400, transport: 120, internet: 60, healthInsurance: 600, taxRate: 28, visaFee: 190, flightCost: 800, depositMultiplier: 2, miscSetup: 700 },
  'Canada': { avgRent: 1300, utilities: 120, groceries: 350, transport: 100, internet: 50, healthInsurance: 0, taxRate: 25, visaFee: 150, flightCost: 600, depositMultiplier: 2, miscSetup: 500 },
  'Australia': { avgRent: 1500, utilities: 180, groceries: 380, transport: 100, internet: 55, healthInsurance: 200, taxRate: 30, visaFee: 310, flightCost: 900, depositMultiplier: 4, miscSetup: 600 },
  'Singapore': { avgRent: 2000, utilities: 120, groceries: 350, transport: 80, internet: 40, healthInsurance: 150, taxRate: 15, visaFee: 200, flightCost: 700, depositMultiplier: 2, miscSetup: 500 },
  'Japan': { avgRent: 800, utilities: 100, groceries: 300, transport: 100, internet: 40, healthInsurance: 150, taxRate: 20, visaFee: 30, flightCost: 700, depositMultiplier: 2, miscSetup: 400 },
  'India': { avgRent: 400, utilities: 50, groceries: 120, transport: 30, internet: 10, healthInsurance: 50, taxRate: 20, visaFee: 80, flightCost: 500, depositMultiplier: 2, miscSetup: 200 },
};

const COST_CATEGORIES = [
  { key: 'oneTime', label: 'One-Time Costs', color: 'text-red-400' },
  { key: 'monthly', label: 'Monthly Recurring', color: 'text-amber-400' },
  { key: 'annual', label: 'Annual Total', color: 'text-emerald-400' },
];

export default function RelocationCostCalculator({ dark }) {
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('Germany');
  const [salary, setSalary] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const countries = Object.keys(RELOCATION_DATA);
  const target = RELOCATION_DATA[toCountry];

  const costs = useMemo(() => {
    if (!target) return null;

    const oneTime = {
      visaFee: target.visaFee,
      flight: target.flightCost,
      deposit: target.avgRent * target.depositMultiplier,
      setup: target.miscSetup,
    };
    const oneTimeTotal = Object.values(oneTime).reduce((a, b) => a + b, 0);

    const monthly = {
      rent: target.avgRent,
      utilities: target.utilities,
      groceries: target.groceries,
      transport: target.transport,
      internet: target.internet,
      healthInsurance: target.healthInsurance,
    };
    const monthlyTotal = Object.values(monthly).reduce((a, b) => a + b, 0);

    const annualTotal = monthlyTotal * 12;

    const grossSalary = Number(salary) || 0;
    const netSalary = grossSalary > 0 ? Math.round(grossSalary * (1 - target.taxRate / 100)) : 0;
    const monthlyNet = Math.round(netSalary / 12);
    const disposableIncome = monthlyNet - monthlyTotal;
    const savingsRate = monthlyNet > 0 ? Math.round((disposableIncome / monthlyNet) * 100) : 0;

    const monthsToRecoup = disposableIncome > 0 ? Math.ceil(oneTimeTotal / disposableIncome) : Infinity;

    return { oneTime, oneTimeTotal, monthly, monthlyTotal, annualTotal, grossSalary, netSalary, monthlyNet, disposableIncome, savingsRate, monthsToRecoup };
  }, [target, salary]);

  if (!costs) return null;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${dark ? 'bg-orange-500/10' : 'bg-orange-500/10'}`}>
          <Plane className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Relocation Cost Calculator</h2>
          <p className="text-xs text-neutral-400">Estimate total cost of moving to a new country</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="text-[10px] font-mono uppercase text-neutral-400 mb-1 block">From</label>
          <select value={fromCountry} onChange={e => setFromCountry(e.target.value)}
            className={`w-full px-3 py-2 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
            <option value="">Select origin</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-neutral-400 mb-1 block">To</label>
          <select value={toCountry} onChange={e => setToCountry(e.target.value)}
            className={`w-full px-3 py-2 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`}>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-neutral-400 mb-1 block">Annual Salary (EUR)</label>
          <input type="number" placeholder="e.g. 75000" value={salary} onChange={e => setSalary(e.target.value)}
            className={`w-full px-3 py-2 rounded text-xs font-mono border outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className={`p-4 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-red-400">€{costs.oneTimeTotal.toLocaleString()}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">One-Time Cost</span>
        </div>
        <div className={`p-4 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-amber-400">€{costs.monthlyTotal.toLocaleString()}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Monthly Cost</span>
        </div>
        <div className={`p-4 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-xl font-bold text-emerald-400">€{costs.monthlyNet.toLocaleString()}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Monthly Net</span>
        </div>
        <div className={`p-4 rounded border text-center ${costs.disposableIncome > 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
          <span className={`text-xl font-bold ${costs.disposableIncome > 0 ? 'text-emerald-400' : 'text-red-400'}`}>€{costs.disposableIncome.toLocaleString()}</span>
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Disposable/Month</span>
        </div>
      </div>

      {costs.grossSalary > 0 && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-cyan-200 bg-cyan-50'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-sm font-bold text-cyan-400">{target.taxRate}%</span>
              <span className="text-[10px] text-neutral-500 block">Tax Rate</span>
            </div>
            <div>
              <span className="text-sm font-bold text-emerald-400">{costs.savingsRate}%</span>
              <span className="text-[10px] text-neutral-500 block">Savings Rate</span>
            </div>
            <div>
              <span className="text-sm font-bold text-amber-400">{costs.monthsToRecoup === Infinity ? '∞' : costs.monthsToRecoup}</span>
              <span className="text-[10px] text-neutral-500 block">Months to Recoup</span>
            </div>
            <div>
              <span className="text-sm font-bold text-violet-400">€{costs.annualTotal.toLocaleString()}</span>
              <span className="text-[10px] text-neutral-500 block">Annual Living Cost</span>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono mb-4 ${dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'}`}>
        <Calculator className="w-3.5 h-3.5" /> {showDetails ? 'Hide' : 'Show'} Cost Breakdown
      </button>

      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-white'}`}>
            <h4 className="text-xs font-bold font-mono text-red-400 mb-3">One-Time Costs</h4>
            {Object.entries(costs.oneTime).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 text-xs border-b border-neutral-800 last:border-0">
                <span className="text-neutral-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono text-neutral-300">€{v.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-xs font-bold border-t border-neutral-700 mt-1">
              <span className="text-red-400">Total One-Time</span>
              <span className="font-mono text-red-400">€{costs.oneTimeTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className={`p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-white'}`}>
            <h4 className="text-xs font-bold font-mono text-amber-400 mb-3">Monthly Costs</h4>
            {Object.entries(costs.monthly).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 text-xs border-b border-neutral-800 last:border-0">
                <span className="text-neutral-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono text-neutral-300">€{v.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-xs font-bold border-t border-neutral-700 mt-1">
              <span className="text-amber-400">Total Monthly</span>
              <span className="font-mono text-amber-400">€{costs.monthlyTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
        <h4 className="text-xs font-bold font-mono text-neutral-400 mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> Key Factors</h4>
        <ul className="space-y-1 text-xs text-neutral-400">
          <li>- Security deposit: {target.depositMultiplier}x monthly rent (€{(target.avgRent * target.depositMultiplier).toLocaleString()})</li>
          <li>- Visa fee: €{target.visaFee} for {toCountry} work authorization</li>
          <li>- Flight estimate: €{target.flightCost} (origin-dependent)</li>
          <li>- Health insurance: {target.healthInsurance > 0 ? `€${target.healthInsurance}/month` : 'Included in taxes'}</li>
        </ul>
      </div>
    </div>
  );
}
