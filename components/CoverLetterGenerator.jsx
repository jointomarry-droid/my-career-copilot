'use client';

import { useState } from 'react';
import { Mail, Copy, Download, RefreshCw, Sparkles, Check, FileText, Briefcase, GraduationCap, Heart } from 'lucide-react';

const TEMPLATES = [
  { id: 'professional', name: 'Professional', icon: Briefcase, desc: 'Formal, corporate tone for traditional industries' },
  { id: 'creative', name: 'Creative', icon: Sparkles, desc: 'Engaging, personality-driven for startups and creative roles' },
  { id: 'academic', name: 'Academic', icon: GraduationCap, desc: 'Research-focused, scholarly tone for academic positions' },
  { id: 'passionate', name: 'Passionate', icon: Heart, desc: 'Enthusiastic, mission-driven for non-profits and social impact' },
];

const MOCK_LETTERS = {
  professional: {
    opening: `Dear Hiring Manager,

I am writing to express my strong interest in the {position} position at {company}. With my background in full-stack development and AI engineering, I am confident in my ability to make meaningful contributions to your team.`,
    body: `In my previous roles, I have consistently delivered high-impact solutions that bridge technical complexity with business objectives. My experience spans building scalable web applications, implementing machine learning pipelines, and leading cross-functional engineering initiatives.

Key qualifications I would bring to this role include:
- Expertise in React, TypeScript, Node.js, and Python ecosystems
- Proven track record of shipping production systems at scale
- Strong communication skills and collaborative approach to problem-solving
- Passion for continuous learning and staying current with emerging technologies

I am particularly drawn to {company} because of your commitment to innovation and excellence in the {industry} space. The opportunity to work on challenging problems alongside talented engineers is exactly the kind of environment where I thrive.`,
    closing: `I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Thank you for considering my application. I look forward to the possibility of contributing to {company}'s continued success.

Sincerely,
{firstName} {lastName}`,
  },
  creative: {
    opening: `Hi there!

I stumbled across the {position} role at {company} and had that rare moment of thinking: "This is exactly what I've been looking for." Let me tell you why.`,
    body: `I'm not just another developer who writes code. I'm someone who thinks about the user experience, obsesses over clean architecture, and genuinely enjoys turning complex problems into elegant solutions.

Here's what I bring to the table:
- A creative approach to engineering challenges that goes beyond "just make it work"
- Experience building products that real users love (and actually use)
- The ability to communicate technical concepts to non-technical stakeholders
- A genuine enthusiasm for {industry} and what {company} is building

What excites me most about this opportunity is the chance to be part of a team that's pushing boundaries. I've been following {company}'s journey, and your recent work on {recentProject} really resonated with my own interests in innovative technology.`,
    closing: `I'd love to chat more about how I can bring my unique perspective to your team. Whether it's over coffee or a quick video call, I'm available whenever works for you.

Cheers,
{firstName} {lastName}`,
  },
  academic: {
    opening: `Dear Professor/Dr. {hiringManager},

I am writing to apply for the {position} position at {company}. With a strong foundation in research methodology and published work in relevant fields, I believe I am well-suited for this opportunity.`,
    body: `My academic and professional journey has been driven by a deep curiosity for solving complex problems through rigorous research and systematic inquiry. I have published {pubCount} papers in peer-reviewed conferences and journals, with a focus on machine learning applications and distributed systems.

Relevant qualifications include:
- Ph.D./M.S. in Computer Science with specialization in AI/ML
- {pubCount} publications in top-tier venues (NeurIPS, ICML, ACL)
- Experience mentoring junior researchers and teaching graduate courses
- Strong methodological foundation in experimental design and statistical analysis

I am particularly interested in {company}'s research agenda in {researchArea}, and see significant potential for collaboration between my expertise and your team's ongoing projects.`,
    closing: `I have attached my full CV and publication list for your review. I would be delighted to discuss potential research directions and how I might contribute to your team's objectives.

Respectfully,
{firstName} {lastName}`,
  },
  passionate: {
    opening: `Dear {company} Team,

When I discovered the {position} role at {company}, I felt an immediate connection to your mission. The work you're doing in {industry} isn't just innovative — it's genuinely making a difference in people's lives.`,
    body: `I believe technology should serve humanity, and I've built my career around that principle. From developing accessible web applications to volunteering as a coding mentor, I've always sought ways to use my skills for positive impact.

What I would bring to {company}:
- Technical expertise combined with a deep commitment to social impact
- Experience working with diverse, mission-driven teams
- A holistic approach that considers both technical excellence and human outcomes
- Passion for {industry} that goes beyond just a job — it's a calling

Your recent initiative {recentInitiative} particularly resonated with me. The intersection of technology and social good is exactly where I want to focus my career, and {company} represents the perfect environment for that.`,
    closing: `I would be honored to join your team and contribute to the important work you're doing. Let's discuss how my passion and skills can help advance {company}'s mission.

With enthusiasm,
{firstName} {lastName}`,
  },
};

export default function CoverLetterGenerator({ dark }) {
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [formData, setFormData] = useState({
    position: '', company: '', industry: '', firstName: '', lastName: '',
    recentProject: '', researchArea: '', pubCount: '5', hiringManager: '', recentInitiative: '',
  });
  const [generated, setGenerated] = useState(false);
  const [letter, setLetter] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      const template = MOCK_LETTERS[selectedTemplate];
      const replace = (text) => text
        .replace(/{position}/g, formData.position || 'Software Engineer')
        .replace(/{company}/g, formData.company || 'your organization')
        .replace(/{industry}/g, formData.industry || 'technology')
        .replace(/{firstName}/g, formData.firstName || 'John')
        .replace(/{lastName}/g, formData.lastName || 'Doe')
        .replace(/{recentProject}/g, formData.recentProject || 'your latest product launch')
        .replace(/{researchArea}/g, formData.researchArea || 'artificial intelligence')
        .replace(/{pubCount}/g, formData.pubCount || '5')
        .replace(/{hiringManager}/g, formData.hiringManager || 'Hiring Manager')
        .replace(/{recentInitiative}/g, formData.recentInitiative || 'community outreach program');

      setLetter({
        opening: replace(template.opening),
        body: replace(template.body),
        closing: replace(template.closing),
      });
      setGenerated(true);
      setGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    if (!letter) return;
    const full = `${letter.opening}\n\n${letter.body}\n\n${letter.closing}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLetter = () => {
    if (!letter) return;
    const full = `${letter.opening}\n\n${letter.body}\n\n${letter.closing}`;
    const blob = new Blob([full], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover_letter_${formData.company || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${dark ? 'bg-blue-500/10' : 'bg-blue-500/10'}`}>
          <Mail className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Cover Letter Generator</h2>
          <p className="text-xs text-neutral-400">AI-powered cover letters tailored to each application</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TEMPLATES.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedTemplate === t.id
                  ? 'border-blue-500/30 bg-blue-500/5'
                  : dark ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <Icon className={`w-5 h-5 mb-2 ${selectedTemplate === t.id ? 'text-blue-400' : 'text-neutral-500'}`} />
              <h4 className="text-xs font-bold">{t.name}</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">{t.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <input placeholder="Your First Name" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} className={inputClass} />
        <input placeholder="Your Last Name" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} className={inputClass} />
        <input placeholder="Position Title" value={formData.position} onChange={e => setFormData(p => ({ ...p, position: e.target.value }))} className={inputClass} />
        <input placeholder="Company Name" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} className={inputClass} />
        <input placeholder="Industry" value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))} className={inputClass} />
        <input placeholder="Hiring Manager (optional)" value={formData.hiringManager} onChange={e => setFormData(p => ({ ...p, hiringManager: e.target.value }))} className={inputClass} />
        <input placeholder="Recent company project (optional)" value={formData.recentProject} onChange={e => setFormData(p => ({ ...p, recentProject: e.target.value }))} className={`${inputClass} sm:col-span-2`} />
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={generate} disabled={generating}
          className={`flex items-center gap-2 px-6 py-2.5 rounded font-mono text-sm font-bold transition-all ${
            generating ? 'bg-neutral-800 text-neutral-500' : 'bg-blue-500 hover:bg-blue-400 text-white'
          }`}>
          {generating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>}
        </button>
        {generated && (
          <>
            <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
            <button onClick={downloadLetter} className="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </>
        )}
      </div>

      {generated && letter && (
        <div className={`space-y-4 ${dark ? '' : ''}`}>
          <div className={`p-5 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400">Opening</span>
            </div>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{letter.opening}</p>
          </div>
          <div className={`p-5 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-400">Body</span>
            </div>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{letter.body}</p>
          </div>
          <div className={`p-5 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">Closing</span>
            </div>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{letter.closing}</p>
          </div>
          <p className="text-[10px] text-neutral-500 text-center">
            Word count: ~{letter.opening.split(/\s+/).length + letter.body.split(/\s+/).length + letter.closing.split(/\s+/).length} words
          </p>
        </div>
      )}
    </div>
  );
}
