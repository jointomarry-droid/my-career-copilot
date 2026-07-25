'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Search, FileText, BarChart3, Target, CheckCircle2,
  AlertTriangle, XCircle, Loader2, Copy, ArrowRight
} from 'lucide-react';

const GRADE_COLORS = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  F: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const SEVERITY_ICONS = {
  high: <XCircle className="w-4 h-4 text-red-400" />,
  medium: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  low: <CheckCircle2 className="w-4 h-4 text-blue-400" />,
};

export default function SEOAnalyzer({ dark }) {
  const [mode, setMode] = useState('resume');
  const [content, setContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType: mode,
          targetKeywords: jobDescription ? undefined : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success('Analysis complete!');
      } else {
        toast.error(data.error || 'Analysis failed');
      }
    } catch (e) {
      toast.error('Failed to analyze content');
    } finally {
      setLoading(false);
    }
  };

  const optimizeProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'usr-fiaz-001',
          targetJobDescription: jobDescription || undefined,
          optimizationType: 'full',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success(`Optimization complete! Score: ${data.data.overallScore}/100`);
      } else {
        toast.error(data.error || 'Optimization failed');
      }
    } catch (e) {
      toast.error('Failed to optimize profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight">SEO Content Analyzer</h2>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex bg-neutral-900/10 dark:bg-neutral-800/40 p-1 rounded-lg">
            {['resume', 'linkedin', 'cover_letter'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  mode === m
                    ? dark ? 'bg-cyan-500 text-neutral-950' : 'bg-blue-600 text-white'
                    : dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600'
                }`}>
                {m === 'cover_letter' ? 'Cover Letter' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 mb-2 block">
              {mode === 'linkedin' ? 'LinkedIn Profile Content' : mode === 'cover_letter' ? 'Cover Letter Text' : 'Resume Text'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste your ${mode === 'linkedin' ? 'LinkedIn profile content' : mode === 'cover_letter' ? 'cover letter' : 'resume'} here...`}
              rows={10}
              className={`w-full px-4 py-3 rounded border text-sm font-mono resize-none ${dark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 placeholder-neutral-400'}`}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-neutral-400 mb-2 block">
              Target Job Description (Optional — for keyword matching)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description you're targeting..."
              rows={4}
              className={`w-full px-4 py-3 rounded border text-sm font-mono resize-none ${dark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 placeholder-neutral-400'}`}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={analyze} disabled={loading || !content.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
                loading || !content.trim() ? 'bg-neutral-600 cursor-not-allowed'
                  : dark ? 'bg-cyan-500 hover:bg-cyan-600 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Analyze
            </button>
            <button onClick={optimizeProfile} disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
                loading ? 'bg-neutral-600 cursor-not-allowed'
                  : dark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}>
              <Target className="w-4 h-4" />
              Optimize My Profile
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          {(result.overallScore !== undefined || result.atsScore) && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">SEO Score</h3>
                  <p className="text-xs text-neutral-500">Based on ATS compatibility, keyword density, and structure</p>
                </div>
                <div className={`text-5xl font-bold px-6 py-3 rounded-lg border ${GRADE_COLORS[result.grade || result.atsScore?.grade || 'F']}`}>
                  {result.overallScore || result.atsScore?.score || 0}
                </div>
              </div>
              {(result.recommendation || result.atsScore?.recommendation) && (
                <p className="text-sm mt-4 text-neutral-600 dark:text-neutral-400">
                  {result.recommendation || result.atsScore?.recommendation}
                </p>
              )}
            </div>
          )}

          {/* ATS Issues */}
          {result.atsScore?.issues?.length > 0 && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                ATS Compatibility Issues ({result.atsScore.issues.length})
              </h3>
              <div className="space-y-2">
                {result.atsScore.issues.map((issue, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded ${dark ? 'bg-neutral-950/50' : 'bg-neutral-50'}`}>
                    {SEVERITY_ICONS[issue.severity]}
                    <div className="flex-1">
                      <p className="text-sm">{issue.message}</p>
                      <span className="text-xs text-neutral-500 capitalize">{issue.severity} priority</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {result.keywords && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Extracted Keywords
              </h3>
              {result.keywords.technical?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.technical.map((kw, i) => (
                      <span key={i} className={`px-2 py-1 rounded text-xs font-mono border ${dark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {kw.keyword} <span className="opacity-50">×{kw.frequency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.keywords.soft?.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.soft.map((kw, i) => (
                      <span key={i} className={`px-2 py-1 rounded text-xs font-mono border ${dark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {kw.keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Readability */}
          {result.readability && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4">Readability</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Words', value: result.readability.totalWords },
                  { label: 'Sentences', value: result.readability.totalSentences },
                  { label: 'Avg Words/Sentence', value: result.readability.avgWordsPerSentence },
                  { label: 'Reading Time', value: `${result.readability.readingTimeMinutes}m` },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded border text-center ${dark ? 'border-neutral-900 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
                    <span className="text-lg font-bold block">{s.value}</span>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.sections?.resume?.recommendations?.length > 0 && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4">Recommendations</h3>
              <div className="space-y-2">
                {result.sections.resume.recommendations.map((rec, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded ${dark ? 'bg-neutral-950/50' : 'bg-neutral-50'}`}>
                    <ArrowRight className={`w-4 h-4 mt-0.5 ${rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'}`} />
                    <div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${dark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                        {rec.category}
                      </span>
                      <p className="text-sm mt-1">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Match */}
          {result.sections?.resume?.keywordMatch && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4">Keyword Match Rate: {result.sections.resume.keywordMatch.matchRate}%</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase text-emerald-400 mb-2">Matched ({result.sections.resume.keywordMatch.matched.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.sections.resume.keywordMatch.matched.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-red-400 mb-2">Missing ({result.sections.resume.keywordMatch.missing.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.sections.resume.keywordMatch.missing.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
