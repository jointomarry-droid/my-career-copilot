'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Linkedin, Target, Sparkles, Copy, CheckCircle2,
  AlertTriangle, XCircle, Loader2, RefreshCw
} from 'lucide-react';

const GRADE_COLORS = {
  A: 'text-emerald-400',
  B: 'text-blue-400',
  C: 'text-amber-400',
  D: 'text-orange-400',
  F: 'text-red-400',
};

export default function LinkedInOptimizer({ dark }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const analyzeProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'usr-fiaz-001',
          optimizationType: 'linkedin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success(`LinkedIn score: ${data.data.sections?.linkedin?.score?.score || 0}/100`);
      } else {
        toast.error(data.error || 'Analysis failed');
      }
    } catch (e) {
      toast.error('Failed to analyze LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">LinkedIn Profile Optimizer</h2>
        <button onClick={analyzeProfile} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
            loading ? 'bg-neutral-600 cursor-not-allowed'
              : dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Analyze My Profile'}
        </button>
      </div>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-bold mb-3">How LinkedIn SEO Works</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Recruiters search LinkedIn using specific keywords. Your profile needs to contain
          these keywords in strategic positions (headline, about, skills, experience) to appear
          in search results. This tool analyzes your profile and suggests optimizations.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {['Headline', 'About', 'Skills', 'Experience'].map((section) => (
            <div key={section} className={`p-2 rounded border text-center ${dark ? 'border-neutral-800 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
              {section}
            </div>
          ))}
        </div>
      </div>

      {result && result.sections?.linkedin && (
        <div className="space-y-6">
          {/* Score */}
          <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">LinkedIn SEO Score</h3>
                <p className="text-xs text-neutral-500 mt-1">Based on headline, about, skills, and experience optimization</p>
              </div>
              <div className={`text-5xl font-bold ${GRADE_COLORS[result.sections.linkedin.score.grade || 'F']}`}>
                {result.sections.linkedin.score.score || 0}
              </div>
            </div>
          </div>

          {/* Issues */}
          {result.sections.linkedin.score.issues?.length > 0 && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4">Issues Found ({result.sections.linkedin.score.issues.length})</h3>
              <div className="space-y-2">
                {result.sections.linkedin.score.issues.map((issue, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded ${dark ? 'bg-neutral-950/50' : 'bg-neutral-50'}`}>
                    {issue.severity === 'high' ? <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                      : issue.severity === 'medium' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        : <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />}
                    <div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${dark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>
                        {issue.section}
                      </span>
                      <p className="text-sm mt-1">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimized Headlines */}
          {result.sections.linkedin.optimizedHeadlines?.length > 0 && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Optimized Headline Suggestions
              </h3>
              <div className="space-y-2">
                {result.sections.linkedin.optimizedHeadlines.map((headline, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded ${dark ? 'bg-neutral-950/50 hover:bg-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100'} transition-colors`}>
                    <span className="text-sm flex-1 mr-3">{headline}</span>
                    <button onClick={() => copyToClipboard(headline, `h${i}`)}
                      className={`p-1.5 rounded ${copiedIdx === `h${i}` ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'}`}>
                      {copiedIdx === `h${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimized About */}
          {result.sections.linkedin.optimizedAbout && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Optimized About Section
                </h3>
                <button onClick={() => copyToClipboard(result.sections.linkedin.optimizedAbout, 'about')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono ${copiedIdx === 'about' ? 'text-emerald-400' : dark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'}`}>
                  {copiedIdx === 'about' ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <pre className={`text-sm whitespace-pre-wrap p-4 rounded ${dark ? 'bg-neutral-950 text-neutral-300' : 'bg-neutral-50 text-neutral-700'}`}>
                {result.sections.linkedin.optimizedAbout}
              </pre>
            </div>
          )}

          {/* Section Breakdown */}
          <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
            <h3 className="font-bold mb-4">Section Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(result.sections.linkedin.score.sections || {}).map(([section, info]) => (
                <div key={section} className={`p-3 rounded border text-center ${dark ? 'border-neutral-900 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
                  <span className={`text-lg font-bold block ${info.has ? 'text-emerald-400' : 'text-red-400'}`}>
                    {info.has ? '✓' : '✗'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono uppercase">{section}</span>
                  {info.length !== undefined && (
                    <span className="text-[10px] text-neutral-500 block">{info.length} chars</span>
                  )}
                  {info.count !== undefined && (
                    <span className="text-[10px] text-neutral-500 block">{info.count} skills</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
