'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, ExternalLink, MapPin, Building2, TrendingUp, Filter, Heart, Eye } from 'lucide-react';

const RECOMMENDATION_ENGINE = {
  skillKeywords: {
    'javascript': ['frontend', 'react', 'angular', 'vue', 'fullstack', 'web developer', 'software engineer'],
    'python': ['data scientist', 'machine learning', 'backend', 'ai engineer', 'automation', 'quantitative'],
    'react': ['frontend', 'ui engineer', 'web developer', 'fullstack'],
    'node.js': ['backend', 'fullstack', 'api developer', 'software engineer'],
    'machine learning': ['ml engineer', 'data scientist', 'ai researcher', 'deep learning'],
    'aws': ['cloud engineer', 'devops', 'solutions architect', 'infrastructure'],
    'docker': ['devops', 'platform engineer', 'sre', 'infrastructure'],
    'java': ['backend', 'enterprise', 'android', 'software engineer'],
    'typescript': ['frontend', 'fullstack', 'software engineer'],
    'postgresql': ['backend', 'data engineer', 'database administrator'],
  },

  generateRecommendations(profile, applications) {
    const recommendations = [];
    const userSkills = (profile.coreStack || '').toLowerCase().split(/[,;\s]+/).filter(Boolean);
    const appliedTitles = applications.map(a => (a.title || '').toLowerCase());

    const jobTitles = [
      { title: 'Senior Frontend Engineer', company: 'Spotify', country: 'Sweden', type: 'Job', matchSkills: ['javascript', 'react', 'typescript'], salary: '€75,000 - €95,000' },
      { title: 'ML Engineer', company: 'DeepMind', country: 'UK', type: 'Job', matchSkills: ['python', 'machine learning', 'pytorch'], salary: '£80,000 - £120,000' },
      { title: 'Full Stack Developer', company: 'Booking.com', country: 'Netherlands', type: 'Job', matchSkills: ['javascript', 'react', 'node.js'], salary: '€65,000 - €85,000' },
      { title: 'Cloud Solutions Architect', company: 'AWS', country: 'Germany', type: 'Job', matchSkills: ['aws', 'docker', 'kubernetes'], salary: '€90,000 - €120,000' },
      { title: 'DAAD Research Scholarship', company: 'DAAD', country: 'Germany', type: 'Scholarship', matchSkills: ['python', 'machine learning'], salary: '€1,200/month stipend' },
      { title: 'Chevening Leadership Fellowship', company: 'UK Government', country: 'UK', type: 'Scholarship', matchSkills: ['leadership', 'management'], salary: 'Full funding' },
      { title: 'AI Research Intern', company: 'Meta AI', country: 'Ireland', type: 'Job', matchSkills: ['python', 'machine learning', 'deep learning'], salary: '€4,000/month' },
      { title: 'DevOps Engineer', company: 'Shopify', country: 'Canada', type: 'Job', matchSkills: ['docker', 'aws', 'kubernetes'], salary: 'CAD 90,000 - 120,000' },
      { title: 'Software Engineer', company: 'Google', country: 'Switzerland', type: 'Job', matchSkills: ['python', 'java', 'javascript'], salary: 'CHF 120,000 - 160,000' },
      { title: 'Data Engineer', company: 'Snowflake', country: 'Netherlands', type: 'Job', matchSkills: ['python', 'postgresql', 'aws'], salary: '€70,000 - €90,000' },
      { title: 'DAAD Study Scholarship', company: 'DAAD', country: 'Germany', type: 'Scholarship', matchSkills: ['computer science'], salary: '€934/month' },
      { title: 'Fulbright Scholar Program', company: 'Fulbright', country: 'USA', type: 'Scholarship', matchSkills: ['research', 'academic'], salary: 'Full funding + travel' },
      { title: 'German Blue Card Application', company: 'Auslanderbehorde', country: 'Germany', type: 'Permit', matchSkills: ['software engineer', 'it specialist'], salary: 'Requires €45,300+ salary' },
      { title: 'UK Skilled Worker Visa', company: 'UKVI', country: 'UK', type: 'Permit', matchSkills: ['software engineer', 'data scientist'], salary: 'Requires sponsorship' },
      { title: 'Canada Express Entry', company: 'IRCC', country: 'Canada', type: 'Permit', matchSkills: ['noc 2123', 'software engineer'], salary: 'Points-based' },
    ];

    jobTitles.forEach(job => {
      if (appliedTitles.some(t => t.includes(job.title.toLowerCase().split(' ')[0]))) return;

      const matchCount = job.matchSkills.filter(s =>
        userSkills.some(us => us.includes(s) || s.includes(us))
      ).length;
      const matchScore = Math.round((matchCount / job.matchSkills.length) * 100);

      if (matchScore > 0) {
        recommendations.push({ ...job, matchScore });
      }
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    return recommendations.slice(0, 8);
  },
};

export default function SmartRecommendations({ dark }) {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState([]);
  const [viewed, setViewed] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          fetch('/api/resume'),
          fetch('/api/applications'),
        ]);
        const profileData = await profileRes.json();
        const appsData = await appsRes.json();
        if (profileData.success) setProfile(profileData.data);
        if (appsData.success) setApplications(appsData.data);
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile && applications) {
      const recs = RECOMMENDATION_ENGINE.generateRecommendations(profile, applications);
      setRecommendations(recs);
    }
  }, [profile, applications]);

  const toggleSave = (idx) => {
    setSaved(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const toggleViewed = (idx) => {
    setViewed(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const filtered = recommendations.filter(r => {
    if (filter === 'all') return true;
    return r.type.toLowerCase() === filter;
  });

  const typeColors = {
    Job: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Scholarship: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Permit: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  if (loading) {
    return (
      <div className={`border rounded-lg p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <div className="text-center py-12 text-neutral-500 text-sm font-mono">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-pink-500/10' : 'bg-pink-500/10'}`}>
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Smart Recommendations</h2>
            <p className="text-xs text-neutral-400">AI-matched opportunities based on your profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500">{filtered.length} matches</span>
          <button onClick={() => {
            const recs = RECOMMENDATION_ENGINE.generateRecommendations(profile, applications);
            setRecommendations(recs);
          }} className={`p-2 rounded transition-colors ${dark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'job', 'scholarship', 'permit'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filter === f
                ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                : dark ? 'text-neutral-500 hover:text-neutral-300 border border-neutral-800' : 'text-neutral-500 hover:text-neutral-700 border border-neutral-200'
            }`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}
      </div>

      {profile && (
        <div className={`p-3 rounded border mb-6 flex flex-wrap gap-2 ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Your skills:</span>
          {(profile.coreStack || '').split(',').map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r, i) => (
          <div key={i} className={`relative p-4 rounded border transition-all ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${typeColors[r.type] || typeColors.Job}`}>{r.type}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-pink-400" />
                  <span className="text-xs font-mono text-pink-400 font-bold">{r.matchScore}% match</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleSave(i)} className={`p-1.5 rounded transition-colors ${saved.includes(i) ? 'text-pink-400' : 'text-neutral-500 hover:text-pink-400'}`}>
                  <Heart className={`w-3.5 h-3.5 ${saved.includes(i) ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => toggleViewed(i)} className={`p-1.5 rounded transition-colors ${viewed.includes(i) ? 'text-cyan-400' : 'text-neutral-500 hover:text-cyan-400'}`}>
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold mb-1">{r.title}</h3>
            <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {r.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.country}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">{r.salary}</span>
              <div className="flex flex-wrap gap-1">
                {r.matchSkills.slice(0, 3).map((s, j) => (
                  <span key={j} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-800 text-neutral-400">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-12 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-neutral-500" />
          <p className="text-sm text-neutral-500">No recommendations match this filter.</p>
        </div>
      )}
    </div>
  );
}
