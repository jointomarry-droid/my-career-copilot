'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Building2, MapPin, DollarSign, Users, Globe, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MarketIntelligence = ({ dark, profile }) => {
  const [activeSection, setActiveSection] = useState('trends');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRole, setSelectedRole] = useState(profile?.coreStack?.split(',')[0]?.trim() || 'Software Engineer');

  const sections = [
    { id: 'trends', label: 'Job Trends', icon: TrendingUp },
    { id: 'salary', label: 'Salary Benchmarks', icon: DollarSign },
    { id: 'companies', label: 'Company Intel', icon: Building2 },
    { id: 'skills', label: 'Skill Demand', icon: BarChart3 },
    { id: 'geography', label: 'Geography', icon: MapPin },
  ];

  const loadMarketData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry, role: selectedRole }),
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (e) {
      console.error('Failed to load market data:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedRole]);

  useEffect(() => { loadMarketData(); }, [loadMarketData]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const JobTrendsSection = () => (
    <div className="space-y-6">
      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium mb-4">Demand Trend - {selectedRole}</h4>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.trends?.timeline || []}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
              <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? '#171717' : '#ffffff',
                  border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="demand" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDemand)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data?.trends?.stats?.map((stat, i) => (
          <div key={i} className={`p-4 rounded-lg border text-center ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <span className={`text-2xl font-bold block ${stat.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.trend > 0 ? '+' : ''}{stat.trend}%
            </span>
            <span className="text-xs text-neutral-400">{stat.label}</span>
            <span className="text-[10px] text-neutral-500 block mt-1">vs last quarter</span>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium text-sm mb-3">Hot Skills This Month</h4>
        <div className="flex flex-wrap gap-2">
          {data?.trends?.hotSkills?.map((skill, i) => (
            <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              skill.growth > 20 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              skill.growth > 10 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
              'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
            }`}>
              {skill.name}
              <span className="ml-1 opacity-70">+{skill.growth}%</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const SalaryBenchmarksSection = () => (
    <div className="space-y-6">
      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium mb-4">Salary Range by Experience</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.salary?.byExperience || []}>
              <XAxis dataKey="level" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
              <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v/1000}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? '#171717' : '#ffffff',
                  border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="min" fill="#525252" name="Minimum" radius={[2, 2, 0, 0]} />
              <Bar dataKey="median" fill="#06b6d4" name="Median" radius={[2, 2, 0, 0]} />
              <Bar dataKey="max" fill="#10b981" name="Maximum" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h4 className="font-medium text-sm mb-3">Your Market Position</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Your Range</span>
                <span className="text-cyan-400">{data?.salary?.yourRange || '$85K - $110K'}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-cyan-400" style={{ width: '72%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Market Average</span>
                <span>{data?.salary?.marketAverage || '$92K'}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-neutral-500" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Top 10%</span>
                <span className="text-emerald-400">{data?.salary?.topTenPercent || '$145K+'}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-emerald-400" style={{ width: '90%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h4 className="font-medium text-sm mb-3">Total Compensation Breakdown</h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.salary?.compBreakdown || [
                    { name: 'Base Salary', value: 65 },
                    { name: 'Bonus', value: 15 },
                    { name: 'Equity', value: 12 },
                    { name: 'Benefits', value: 8 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(data?.salary?.compBreakdown || [65, 15, 12, 8]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: dark ? '#171717' : '#ffffff',
                    border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {(data?.salary?.compBreakdown || ['Base', 'Bonus', 'Equity', 'Benefits']).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-neutral-400">{typeof item === 'string' ? item : item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const CompanyIntelSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.companies || []).map((company, i) => (
          <div key={i} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                dark ? 'bg-neutral-800' : 'bg-neutral-100'
              }`}>
                {company.name[0]}
              </div>
              <div>
                <h4 className="font-medium">{company.name}</h4>
                <p className="text-xs text-neutral-400">{company.industry}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-xs text-neutral-400 block">Rating</span>
                <span className="font-bold text-amber-400">{company.rating}/5</span>
              </div>
              <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-xs text-neutral-400 block">Growth</span>
                <span className={`font-bold ${company.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {company.growth > 0 ? '+' : ''}{company.growth}%
                </span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Culture Score</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 bg-neutral-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${company.cultureScore}%` }} />
                  </div>
                  <span>{company.cultureScore}%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Work-Life Balance</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 bg-neutral-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${company.workLifeBalance}%` }} />
                  </div>
                  <span>{company.workLifeBalance}%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Compensation</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 bg-neutral-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${company.compensationScore}%` }} />
                  </div>
                  <span>{company.compensationScore}%</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-800">
              <div className="flex flex-wrap gap-1">
                {company.perks?.slice(0, 3).map((perk, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">{perk}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SkillDemandSection = () => (
    <div className="space-y-6">
      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium mb-4">Skill Demand Distribution</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.skills?.demand || []} layout="vertical">
              <XAxis type="number" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="skill" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? '#171717' : '#ffffff',
                  border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="demand" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
          <h4 className="font-medium text-sm text-emerald-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Rising Skills
          </h4>
          <div className="space-y-2">
            {data?.skills?.rising?.map((skill, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{skill.name}</span>
                <span className="text-xs text-emerald-400">+{skill.growth}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${dark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
          <h4 className="font-medium text-sm text-red-400 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Declining Skills
          </h4>
          <div className="space-y-2">
            {data?.skills?.declining?.map((skill, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{skill.name}</span>
                <span className="text-xs text-red-400">{skill.decline}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const GeographySection = () => (
    <div className="space-y-6">
      <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h4 className="font-medium mb-4">Job Distribution by Region</h4>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.geography?.distribution || []}>
              <XAxis dataKey="region" stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
              <YAxis stroke={dark ? '#525252' : '#d4d4d4'} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? '#171717' : '#ffffff',
                  border: `1px solid ${dark ? '#262626' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="jobs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(data?.geography?.topCities || []).map((city, i) => (
          <div key={i} className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="font-medium">{city.name}</h4>
                <p className="text-xs text-neutral-400">{city.country}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-lg font-bold block">{city.openings}</span>
                <span className="text-[10px] text-neutral-400">Openings</span>
              </div>
              <div className={`p-2 rounded text-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                <span className="text-lg font-bold block text-cyan-400">{city.avgSalary}</span>
                <span className="text-[10px] text-neutral-400">Avg Salary</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Demand Index</span>
              <span className={city.demand > 80 ? 'text-emerald-400' : 'text-amber-400'}>{city.demand}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'trends': return <JobTrendsSection />;
      case 'salary': return <SalaryBenchmarksSection />;
      case 'companies': return <CompanyIntelSection />;
      case 'skills': return <SkillDemandSection />;
      case 'geography': return <GeographySection />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Market Intelligence
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Real-time job market insights and benchmarks</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <option>Software Engineer</option>
            <option>Data Scientist</option>
            <option>Product Manager</option>
            <option>DevOps Engineer</option>
            <option>ML Engineer</option>
          </select>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <option value="all">All Countries</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="nl">Netherlands</option>
            <option value="ca">Canada</option>
          </select>
          <button onClick={loadMarketData}
            className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50')
              }`}>
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Fetching market intelligence...</p>
        </div>
      ) : (
        renderSection()
      )}
    </div>
  );
};

export default MarketIntelligence;
