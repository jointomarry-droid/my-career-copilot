'use client';

import { useState, useEffect } from 'react';
import { Globe, TrendingUp, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const COUNTRIES = [
  { id: 'germany', name: 'Germany', flag: '🇩🇪' },
  { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱' },
  { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦' },
  { id: 'australia', name: 'Australia', flag: '🇦🇺' },
];

export default function VisaScorer({ dark }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visa');
      const data = await res.json();
      if (data.success) setScores(data.data);
    } catch (e) {
      console.error('Failed to load visa scores:', e);
    } finally {
      setLoading(false);
    }
  };

  const scoreCountry = async (countryId) => {
    setScoring(true);
    setSelectedCountry(countryId);
    try {
      const res = await fetch('/api/visa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryId }),
      });
      const data = await res.json();
      if (data.success) setDetailedResult(data.data);
    } catch (e) {
      toast.error('Scoring failed');
    } finally {
      setScoring(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      easy: 'bg-emerald-500/10 text-emerald-400',
      medium: 'bg-yellow-500/10 text-yellow-400',
      hard: 'bg-red-500/10 text-red-400',
    };
    return styles[difficulty] || 'bg-neutral-500/10 text-neutral-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Visa Probability Scorer</h2>
        <p className="text-xs text-neutral-400 mt-1">AI-powered assessment of your work visa probability across countries.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600 text-xs font-mono">Calculating visa probabilities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scores.map((score) => (
            <div key={score.country} onClick={() => scoreCountry(score.country)}
              className={`border rounded-lg p-5 cursor-pointer transition-all hover:scale-[1.01] ${selectedCountry === score.country
                ? 'border-cyan-500/50 ring-1 ring-cyan-500/20'
                : dark ? 'border-neutral-900 bg-[#0F0F11]/60 hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{COUNTRIES.find(c => c.id === score.country)?.flag}</span>
                  <span className="font-bold">{score.country?.charAt(0).toUpperCase() + score.country?.slice(1)}</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>{score.score}%</span>
              </div>

              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mb-4">
                <div className={`h-full transition-all ${getScoreBg(score.score)}`} style={{ width: `${score.score}%` }} />
              </div>

              <div className="space-y-1">
                {score.programs?.slice(0, 2).map((prog, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400 truncate">{prog.name}</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono ${getDifficultyBadge(prog.difficulty)}`}>{prog.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {detailedResult && (
        <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              {detailedResult.country} — Detailed Assessment
            </h3>
            <span className={`text-3xl font-bold ${getScoreColor(detailedResult.score)}`}>{detailedResult.score}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-mono text-xs uppercase text-neutral-400 mb-3">Factor Breakdown</h4>
              <div className="space-y-2">
                {detailedResult.factors?.map((factor, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400">{factor.name}</span>
                      <span className={`font-mono font-bold ${getScoreColor(factor.score)}`}>{factor.score}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBg(factor.score)}`} style={{ width: `${factor.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase text-neutral-400 mb-3">Recommended Programs</h4>
              <div className="space-y-2">
                {detailedResult.programs?.slice(0, 4).map((prog, i) => (
                  <div key={i} className={`p-3 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{prog.name}</span>
                      <span className={`text-xs font-mono font-bold ${getScoreColor(prog.probability)}`}>{prog.probability}%</span>
                    </div>
                    {prog.missing?.length > 0 && (
                      <div className="mt-1 text-[10px] text-yellow-400">
                        Missing: {prog.missing.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded border ${dark ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-cyan-200 bg-cyan-50'}`}>
            <h4 className="text-xs font-bold font-mono text-cyan-400 mb-2">Recommendation</h4>
            <p className="text-sm">{detailedResult.recommendation}</p>
            {detailedResult.nextSteps?.length > 0 && (
              <div className="mt-3 space-y-1">
                {detailedResult.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
