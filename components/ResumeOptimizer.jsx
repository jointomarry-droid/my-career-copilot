'use client';

import { useState, useCallback } from 'react';
import { Target, Zap, AlertTriangle, CheckCircle, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';

const SKILL_DATABASE = {
  javascript: { category: 'Frontend', demand: 95, aliases: ['js', 'ecmascript'] },
  typescript: { category: 'Frontend', demand: 92, aliases: ['ts'] },
  python: { category: 'Backend', demand: 94, aliases: ['py'] },
  java: { category: 'Backend', demand: 85, aliases: [] },
  react: { category: 'Frontend', demand: 93, aliases: ['reactjs', 'react.js'] },
  'next.js': { category: 'Frontend', demand: 88, aliases: ['nextjs', 'next'] },
  'node.js': { category: 'Backend', demand: 87, aliases: ['nodejs', 'node'] },
  django: { category: 'Backend', demand: 72, aliases: [] },
  postgresql: { category: 'Database', demand: 82, aliases: ['postgres', 'psql'] },
  mongodb: { category: 'Database', demand: 78, aliases: ['mongo'] },
  aws: { category: 'Cloud', demand: 91, aliases: ['amazon web services'] },
  gcp: { category: 'Cloud', demand: 79, aliases: ['google cloud'] },
  docker: { category: 'DevOps', demand: 88, aliases: ['containers'] },
  kubernetes: { category: 'DevOps', demand: 84, aliases: ['k8s'] },
  'machine learning': { category: 'AI/ML', demand: 90, aliases: ['ml'] },
  'deep learning': { category: 'AI/ML', demand: 86, aliases: ['dl'] },
  tensorflow: { category: 'AI/ML', demand: 80, aliases: ['tf'] },
  pytorch: { category: 'AI/ML', demand: 83, aliases: ['torch'] },
  git: { category: 'DevOps', demand: 90, aliases: ['github'] },
  playwright: { category: 'Testing', demand: 75, aliases: ['e2e', 'browser automation'] },
  graphql: { category: 'API', demand: 74, aliases: ['gql'] },
  rest: { category: 'API', demand: 88, aliases: ['restful', 'rest api'] },
};

export default function ResumeOptimizer({ dark }) {
  const [jobDescription, setJobDescription] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = useCallback(() => {
    if (!jobDescription.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      const jdLower = jobDescription.toLowerCase();
      const userSkillsList = userSkills.split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);

      const requiredSkills = [];
      const preferredSkills = [];

      Object.entries(SKILL_DATABASE).forEach(([skill, info]) => {
        const allNames = [skill, ...info.aliases];
        const found = allNames.some(name => jdLower.includes(name));
        if (found) {
          const isPreferred = jdLower.includes(`preferred`) && jdLower.includes(name) ||
                             jdLower.includes(`nice to have`) && jdLower.includes(name);
          if (isPreferred) {
            preferredSkills.push({ skill, ...info });
          } else {
            requiredSkills.push({ skill, ...info });
          }
        }
      });

      const matchedSkills = requiredSkills.filter(s =>
        userSkillsList.some(us => s.skill.includes(us) || us.includes(s.skill) || s.aliases.some(a => us.includes(a)))
      );
      const missingRequired = requiredSkills.filter(s =>
        !userSkillsList.some(us => s.skill.includes(us) || us.includes(s.skill) || s.aliases.some(a => us.includes(a)))
      );
      const matchedPreferred = preferredSkills.filter(s =>
        userSkillsList.some(us => s.skill.includes(us) || us.includes(s.skill) || s.aliases.some(a => us.includes(a)))
      );
      const missingPreferred = preferredSkills.filter(s =>
        !userSkillsList.some(us => s.skill.includes(us) || us.includes(s.skill) || s.aliases.some(a => us.includes(a)))
      );

      const totalRequired = requiredSkills.length || 1;
      const matchRate = Math.round((matchedSkills.length / totalRequired) * 100);
      const atsScore = Math.min(100, Math.round(
        (matchedSkills.length * 15) +
        (matchedPreferred.length * 8) +
        (userSkillsList.length * 2) +
        20
      ));

      const categories = {};
      requiredSkills.forEach(s => {
        if (!categories[s.category]) categories[s.category] = { total: 0, matched: 0 };
        categories[s.category].total++;
        if (matchedSkills.some(m => m.skill === s.skill)) categories[s.category].matched++;
      });

      setResult({
        atsScore,
        matchRate,
        requiredSkills,
        preferredSkills,
        matchedSkills,
        missingRequired,
        matchedPreferred,
        missingPreferred,
        categories,
        recommendations: generateRecommendations(missingRequired, missingPreferred, userSkillsList),
      });
      setAnalyzing(false);
    }, 1200);
  }, [jobDescription, userSkills]);

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${dark ? 'bg-violet-500/10' : 'bg-violet-500/10'}`}>
          <Target className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Resume ATS Optimizer</h2>
          <p className="text-xs text-neutral-400">Analyze your resume against job descriptions for ATS compatibility</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs font-mono uppercase font-bold text-neutral-400 block mb-2">Job Description</label>
          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className={`w-full px-4 py-3 text-sm rounded border transition-colors outline-none resize-none font-mono ${dark ? 'bg-neutral-900 border-neutral-800 text-white focus:border-violet-500' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B] focus:border-violet-500'}`}
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase font-bold text-neutral-400 block mb-2">Your Skills (comma separated)</label>
          <textarea
            rows={8}
            value={userSkills}
            onChange={(e) => setUserSkills(e.target.value)}
            placeholder="JavaScript, React, Node.js, Python, Docker..."
            className={`w-full px-4 py-3 text-sm rounded border transition-colors outline-none resize-none font-mono ${dark ? 'bg-neutral-900 border-neutral-800 text-white focus:border-violet-500' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B] focus:border-violet-500'}`}
          />
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={analyzing || !jobDescription.trim()}
        className={`flex items-center gap-2 px-6 py-2.5 rounded font-mono text-sm font-bold transition-all ${
          analyzing || !jobDescription.trim()
            ? 'opacity-50 cursor-not-allowed bg-neutral-800 text-neutral-500'
            : 'bg-violet-500 hover:bg-violet-400 text-white'
        }`}
      >
        {analyzing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Zap className="w-4 h-4" /> Analyze Resume</>}
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ScoreCard label="ATS Score" value={`${result.atsScore}%`} color={result.atsScore >= 80 ? 'emerald' : result.atsScore >= 50 ? 'amber' : 'red'} dark={dark} />
            <ScoreCard label="Skill Match" value={`${result.matchRate}%`} color={result.matchRate >= 70 ? 'emerald' : result.matchRate >= 40 ? 'amber' : 'red'} dark={dark} />
            <ScoreCard label="Required Found" value={`${result.matchedSkills.length}/${result.requiredSkills.length}`} color="cyan" dark={dark} />
            <ScoreCard label="Preferred Found" value={`${result.matchedPreferred.length}/${result.preferredSkills.length}`} color="indigo" dark={dark} />
          </div>

          {result.missingRequired.length > 0 && (
            <div className={`p-4 rounded border ${dark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
              <h4 className="text-xs font-bold font-mono text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing Required Skills ({result.missingRequired.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missingRequired.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                    {s.skill} <span className="text-neutral-500">({s.demand}% demand)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.matchedSkills.length > 0 && (
            <div className={`p-4 rounded border ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
              <h4 className="text-xs font-bold font-mono text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" /> Matched Skills ({result.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {s.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.recommendations.length > 0 && (
            <div className={`p-4 rounded border ${dark ? 'border-violet-500/20 bg-violet-500/5' : 'border-violet-200 bg-violet-50'}`}>
              <h4 className="text-xs font-bold font-mono text-violet-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                    <ArrowRight className="w-3 h-3 mt-0.5 text-violet-400 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(result.categories).length > 0 && (
            <div className={`p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
              <h4 className="text-xs font-bold font-mono text-neutral-400 mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(result.categories).map(([cat, data]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400 w-20">{cat}</span>
                    <div className="flex-1 bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${(data.matched / data.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-neutral-500 w-12 text-right">{data.matched}/{data.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, color, dark }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };
  return (
    <div className={`p-4 rounded border text-center ${colors[color] || colors.cyan}`}>
      <span className="text-2xl font-bold block">{value}</span>
      <span className="text-[10px] font-mono uppercase text-neutral-400">{label}</span>
    </div>
  );
}

function generateRecommendations(missingRequired, missingPreferred, userSkills) {
  const recs = [];
  if (missingRequired.length > 0) {
    recs.push(`Critical: Add these required skills to your resume or gain them — ${missingRequired.map(s => s.skill).join(', ')}`);
  }
  if (missingPreferred.length > 0) {
    recs.push(`Nice-to-have: Consider learning ${missingPreferred.map(s => s.skill).join(', ')} to stand out`);
  }
  if (userSkills.length < 5) {
    recs.push('Your skill list is thin. Add more relevant technical and soft skills to improve ATS scoring.');
  }
  const highDemandMissing = missingRequired.filter(s => s.demand >= 85);
  if (highDemandMissing.length > 0) {
    recs.push(`High-demand gap: ${highDemandMissing.map(s => s.skill).join(', ')} are in ${highDemandMissing[0].demand}%+ demand — prioritize these.`);
  }
  recs.push('Tailor your resume summary to include exact keywords from the job description.');
  return recs;
}
