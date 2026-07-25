'use client';

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#00cc88', '#ff8800', '#00d4ff', '#ff4444', '#ffcc00'];

export default function AnalyticsCharts({ stats, dark }) {
  if (!stats) return null;

  const typeData = Object.entries(stats.byType || {}).map(([name, value]) => ({ name, value }));
  const countryData = Object.entries(stats.byCountry || {}).map(([name, value]) => ({ name, value }));
  const timelineData = stats.timeline || [];

  const statCards = [
    { label: 'Total Applications', value: stats.total, color: 'text-cyan-400' },
    { label: 'Submitted', value: stats.submitted, color: 'text-emerald-400' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-400' },
    { label: 'Success Rate', value: `${stats.successRate}%`, color: 'text-cyan-400' },
    { label: 'Avg Match', value: `${stats.avgMatch}%`, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`p-4 rounded border text-center transition-colors ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
            <span className={`text-2xl font-bold tracking-tight block ${card.color}`}>{card.value}</span>
            <span className="text-[10px] text-neutral-400 font-mono uppercase">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border rounded-lg p-4 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <h4 className="text-xs font-mono uppercase text-neutral-400 mb-4">By Type</h4>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-neutral-600 text-xs">No data</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {typeData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <h4 className="text-xs font-mono uppercase text-neutral-400 mb-4">By Country</h4>
          {countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={countryData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-neutral-600 text-xs">No data</div>
          )}
        </div>

        <div className={`border rounded-lg p-4 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <h4 className="text-xs font-mono uppercase text-neutral-400 mb-4">Timeline</h4>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-neutral-600 text-xs">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
