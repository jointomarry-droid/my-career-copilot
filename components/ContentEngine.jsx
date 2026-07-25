'use client';

import React, { useState, useCallback } from 'react';
import { FileText, Mail, MessageSquare, Copy, Download, RefreshCw, Sparkles, Edit3, CheckCircle, Target, Wand2 } from 'lucide-react';

const ContentEngine = ({ dark, profile, applications }) => {
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [inputData, setInputData] = useState({
    jobDescription: '',
    companyName: '',
    position: '',
    tone: 'professional',
    focus: 'technical',
  });

  const tabs = [
    { id: 'resume', label: 'Resume Tailor', icon: FileText, desc: 'AI-optimized resume for specific roles' },
    { id: 'coverletter', label: 'Cover Letter', icon: Mail, desc: 'Personalized cover letter generation' },
    { id: 'interview', label: 'Interview Answers', icon: MessageSquare, desc: 'STAR method answer coaching' },
    { id: 'email', label: 'Follow-up Email', icon: Mail, desc: 'Professional follow-up templates' },
  ];

  const tones = [
    { id: 'professional', label: 'Professional' },
    { id: 'enthusiastic', label: 'Enthusiastic' },
    { id: 'confident', label: 'Confident' },
    { id: 'humble', label: 'Humble' },
  ];

  const focusAreas = [
    { id: 'technical', label: 'Technical Skills' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'impact', label: 'Impact & Results' },
    { id: 'culture', label: 'Culture Fit' },
  ];

  const generateContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          profile,
          ...inputData,
        }),
      });
      const data = await res.json();
      if (data.success) setGeneratedContent(data.data);
    } catch (e) {
      console.error('Content generation failed:', e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, profile, inputData]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadContent = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const ResumeTailor = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-medium text-sm mb-3">Target Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Job Title</label>
            <input type="text" value={inputData.position} onChange={(e) => setInputData({...inputData, position: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
              placeholder="e.g., Senior Software Engineer" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Company</label>
            <input type="text" value={inputData.companyName} onChange={(e) => setInputData({...inputData, companyName: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
              placeholder="e.g., Google" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-neutral-400 mb-1 block">Job Description</label>
          <textarea value={inputData.jobDescription} onChange={(e) => setInputData({...inputData, jobDescription: e.target.value})}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg text-sm border resize-none ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
            placeholder="Paste the job description here..." />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Tone</label>
            <select value={inputData.tone} onChange={(e) => setInputData({...inputData, tone: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
              {tones.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Focus Area</label>
            <select value={inputData.focus} onChange={(e) => setInputData({...inputData, focus: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
              {focusAreas.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const CoverLetterGenerator = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-medium text-sm mb-3">Cover Letter Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Position</label>
            <input type="text" value={inputData.position} onChange={(e) => setInputData({...inputData, position: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
              placeholder="e.g., Product Manager" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Company</label>
            <input type="text" value={inputData.companyName} onChange={(e) => setInputData({...inputData, companyName: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
              placeholder="e.g., Microsoft" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-neutral-400 mb-1 block">Why this company? (optional)</label>
          <textarea value={inputData.jobDescription} onChange={(e) => setInputData({...inputData, jobDescription: e.target.value})}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg text-sm border resize-none ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
            placeholder="What attracted you to this company?" />
        </div>
        <div className="mt-4">
          <label className="text-xs text-neutral-400 mb-1 block">Tone</label>
          <div className="flex gap-2">
            {tones.map(t => (
              <button key={t.id} onClick={() => setInputData({...inputData, tone: t.id})}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inputData.tone === t.id
                    ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                    : (dark ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-neutral-100 text-neutral-600 border border-neutral-200')
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const InterviewCoach = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-medium text-sm mb-3">Interview Preparation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Question Type</label>
            <select value={inputData.focus} onChange={(e) => setInputData({...inputData, focus: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
              <option value="behavioral">Behavioral (STAR Method)</option>
              <option value="technical">Technical</option>
              <option value="situational">Situational</option>
              <option value="leadership">Leadership</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Experience Level</label>
            <select value={inputData.tone} onChange={(e) => setInputData({...inputData, tone: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead/Principal</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-neutral-400 mb-1 block">Specific Question (optional)</label>
          <input type="text" value={inputData.jobDescription} onChange={(e) => setInputData({...inputData, jobDescription: e.target.value})}
            className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
            placeholder="e.g., Tell me about a time you failed" />
        </div>
      </div>
    </div>
  );

  const EmailTemplates = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-medium text-sm mb-3">Email Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Email Type</label>
            <select value={inputData.focus} onChange={(e) => setInputData({...inputData, focus: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
              <option value="followup">Follow-up After Interview</option>
              <option value="thankyou">Thank You Note</option>
              <option value="networking">Networking Outreach</option>
              <option value="status">Status Check</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Tone</label>
            <select value={inputData.tone} onChange={(e) => setInputData({...inputData, tone: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
              {tones.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-neutral-400 mb-1 block">Additional Context</label>
          <textarea value={inputData.jobDescription} onChange={(e) => setInputData({...inputData, jobDescription: e.target.value})}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg text-sm border resize-none ${dark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}
            placeholder="Any specific details to include..." />
        </div>
      </div>
    </div>
  );

  const renderInputForm = () => {
    switch (activeTab) {
      case 'resume': return <ResumeTailor />;
      case 'coverletter': return <CoverLetterGenerator />;
      case 'interview': return <InterviewCoach />;
      case 'email': return <EmailTemplates />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-cyan-400" />
            Content Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-1">AI-powered personalized content generation</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setGeneratedContent(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? (dark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                  : (dark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50')
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderInputForm()}

      <button onClick={generateContent} disabled={loading || !inputData.position}
        className={`w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
          loading || !inputData.position
            ? (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
            : (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
        }`}>
        <Sparkles className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        {loading ? 'Generating...' : 'Generate Content'}
      </button>

      {generatedContent && (
        <div className={`p-5 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Generated Content
            </h3>
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(generatedContent.text)}
                className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => downloadContent(generatedContent.text, `${activeTab}-${inputData.companyName || 'content'}.txt`)}
                className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${dark ? 'bg-neutral-800/50' : 'bg-neutral-50'} whitespace-pre-wrap text-sm leading-relaxed`}>
            {generatedContent.text}
          </div>

          {generatedContent.tips && generatedContent.tips.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-400 mb-2">Pro Tips</h4>
              <ul className="space-y-1">
                {generatedContent.tips.map((tip, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {generatedContent.keywords && generatedContent.keywords.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-400 mb-2">Suggested Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {generatedContent.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentEngine;
