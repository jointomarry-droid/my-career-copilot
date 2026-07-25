'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare, Briefcase, DollarSign, CheckCircle2,
  Lightbulb, FileText, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

export default function InterviewPrep({ dark }) {
  const [loading, setLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [form, setForm] = useState({
    title: '',
    institution: '',
    country: '',
    type: 'job',
  });

  const generatePrep = async () => {
    if (!form.title) {
      toast.error('Please enter a position title');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'usr-fiaz-001',
          opportunity: form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInterviewData(data.data);
        toast.success('Interview prep package generated!');
      } else {
        toast.error(data.error || 'Failed to generate prep');
      }
    } catch (e) {
      toast.error('Failed to generate interview prep');
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    Introduction: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Technical: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Motivation: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Behavioral: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Salary: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Questions: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight">Interview Preparation</h2>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-mono text-sm uppercase text-neutral-400 mb-4">Generate Interview Package</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Position Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`px-4 py-2 rounded border text-sm ${dark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200'}`}
          />
          <input
            type="text"
            placeholder="Company / Institution"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            className={`px-4 py-2 rounded border text-sm ${dark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200'}`}
          />
          <input
            type="text"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={`px-4 py-2 rounded border text-sm ${dark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200'}`}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={`px-4 py-2 rounded border text-sm ${dark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200'}`}
          >
            <option value="job">Job</option>
            <option value="scholarship">Scholarship</option>
            <option value="work_permit">Work Permit</option>
          </select>
        </div>
        <button
          onClick={generatePrep}
          disabled={loading}
          className={`mt-4 flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
            loading
              ? 'bg-neutral-600 cursor-not-allowed'
              : dark
                ? 'bg-cyan-500 hover:bg-cyan-600 text-neutral-950'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Generate Prep Package'}
        </button>
      </div>

      {interviewData && (
        <div className="space-y-6">
          {/* Salary Estimate */}
          {interviewData.salary && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className={`w-5 h-5 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className="font-bold">Salary Estimate</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {interviewData.salary.range}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">{interviewData.salary.note}</p>
            </div>
          )}

          {/* Questions */}
          <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className={`w-5 h-5 ${dark ? 'text-amber-400' : 'text-amber-600'}`} />
              <h3 className="font-bold">Interview Questions ({interviewData.questions.length})</h3>
            </div>
            <div className="space-y-3">
              {interviewData.questions.map((q, i) => (
                <div key={i} className={`border rounded-lg overflow-hidden ${dark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                    className={`w-full flex items-center justify-between p-4 text-left ${dark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${categoryColors[q.category] || 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'}`}>
                        {q.category}
                      </span>
                      <span className="text-sm font-medium">{q.question}</span>
                    </div>
                    {expandedQuestion === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedQuestion === i && (
                    <div className={`p-4 border-t ${dark ? 'border-neutral-800 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
                      <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">Suggested Answer</h4>
                      <p className="text-sm whitespace-pre-wrap mb-4">{q.suggestedAnswer}</p>
                      <div className={`p-3 rounded ${dark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          <strong>Tip:</strong> {q.tips}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Briefing Document */}
          {interviewData.briefing && (
            <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <FileText className={`w-5 h-5 ${dark ? 'text-cyan-400' : 'text-blue-600'}`} />
                <h3 className="font-bold">{interviewData.briefing.title}</h3>
              </div>
              <div className="space-y-4">
                {Object.values(interviewData.briefing.sections).map((section, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-bold mb-2">{section.title}</h4>
                    {section.content && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{section.content}</p>
                    )}
                    {section.items && (
                      <ul className="space-y-1">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
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