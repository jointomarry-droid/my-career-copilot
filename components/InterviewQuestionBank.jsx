'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, Plus, Shuffle, Check, X, Lightbulb, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

const QUESTION_BANK = {
  technical: [
    { q: 'Explain the difference between var, let, and const in JavaScript.', tips: 'Discuss scope (function vs block), hoisting, and reassignment.', difficulty: 'easy' },
    { q: 'How does the virtual DOM work in React? Why is it used?', tips: 'Explain diffing algorithm, reconciliation, and performance benefits.', difficulty: 'medium' },
    { q: 'Describe the event loop in Node.js. How does async/await work under the hood?', tips: 'Microtask queue, macrotask queue, Promises, and callback resolution.', difficulty: 'hard' },
    { q: 'What is a closure? Give a practical example.', tips: 'Lexical scope, function factories, data privacy, event handlers.', difficulty: 'medium' },
    { q: 'Explain REST vs GraphQL. When would you choose one over the other?', tips: 'Over-fetching, under-fetching, caching, complexity tradeoffs.', difficulty: 'medium' },
    { q: 'What are microservices? What are the tradeoffs vs monoliths?', tips: 'Scalability, deployment, data consistency, service communication.', difficulty: 'hard' },
    { q: 'How does Docker differ from virtual machines?', tips: 'Containerization, kernel sharing, layers, orchestration with K8s.', difficulty: 'medium' },
    { q: 'Explain CAP theorem. Give examples of databases in each category.', tips: 'Consistency, Availability, Partition tolerance. CP vs AP systems.', difficulty: 'hard' },
    { q: 'What is the difference between SQL and NoSQL? When to use each?', tips: 'Schema flexibility, ACID, horizontal scaling, data modeling.', difficulty: 'easy' },
    { q: 'How would you design a URL shortener like bit.ly?', tips: 'Hashing, collision handling, analytics, caching, database design.', difficulty: 'hard' },
  ],
  behavioral: [
    { q: 'Tell me about a time you had to debug a difficult production issue.', tips: 'STAR method, systematic debugging, communication under pressure.', difficulty: 'medium' },
    { q: 'Describe a project where you had to learn a new technology quickly.', tips: 'Learning process, time management, applying knowledge.', difficulty: 'easy' },
    { q: 'How do you handle disagreements with team members about technical decisions?', tips: 'Communication, data-driven arguments, compromise, respect.', difficulty: 'medium' },
    { q: 'Tell me about a time you missed a deadline. What happened and what did you learn?', tips: 'Honesty, root cause analysis, prevention strategies.', difficulty: 'medium' },
    { q: 'Describe your approach to code reviews. How do you balance quality and speed?', tips: 'Constructive feedback, prioritization, automation, mentoring.', difficulty: 'easy' },
    { q: 'How do you prioritize tasks when everything seems urgent?', tips: 'Impact assessment, communication, delegation, timeboxing.', difficulty: 'medium' },
    { q: 'Tell me about a time you went above and beyond for a project.', tips: 'Initiative, impact, teamwork, measurable results.', difficulty: 'easy' },
    { q: 'Describe a situation where you had to simplify complex requirements.', tips: 'Requirements gathering, stakeholder communication, MVP thinking.', difficulty: 'hard' },
  ],
  systemDesign: [
    { q: 'Design a real-time chat application like WhatsApp.', tips: 'WebSocket, message queue, encryption, presence, scaling.', difficulty: 'hard' },
    { q: 'Design a notification system that handles millions of users.', tips: 'Message broker, delivery guarantees, preferences, rate limiting.', difficulty: 'hard' },
    { q: 'How would you design a CI/CD pipeline from scratch?', tips: 'Build, test, deploy stages, rollback, monitoring, security.', difficulty: 'medium' },
    { q: 'Design a data pipeline for processing 1TB of daily logs.', tips: 'ETL, streaming vs batch, storage, monitoring, fault tolerance.', difficulty: 'hard' },
    { q: 'Design a rate limiter for an API gateway.', tips: 'Token bucket, sliding window, distributed counters, Redis.', difficulty: 'medium' },
  ],
};

export default function InterviewQuestionBank({ dark }) {
  const [activeCategory, setActiveCategory] = useState('technical');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [showAnswer, setShowAnswer] = useState({});
  const [customQuestion, setCustomQuestion] = useState('');
  const [customQuestions, setCustomQuestions] = useState([]);
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const allQuestions = [...QUESTION_BANK[activeCategory], ...customQuestions.filter(q => q.category === activeCategory)];

  const filteredQuestions = allQuestions.filter(q => {
    if (filterDifficulty === 'all') return true;
    return q.difficulty === filterDifficulty;
  });

  const shuffleQuestions = useCallback(() => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setSelectedQuestions(shuffled.slice(0, 5));
  }, [filteredQuestions]);

  const toggleBookmark = (q) => {
    setBookmarked(prev => {
      const exists = prev.find(b => b.q === q.q);
      if (exists) return prev.filter(b => b.q !== q.q);
      return [...prev, { ...q, category: activeCategory }];
    });
  };

  const addCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    setCustomQuestions(prev => [...prev, {
      q: customQuestion,
      tips: 'Your custom question - add tips as you practice.',
      difficulty: 'medium',
      category: activeCategory,
      custom: true,
    }]);
    setCustomQuestion('');
  };

  const removeCustom = (idx) => {
    setCustomQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const categories = [
    { id: 'technical', label: 'Technical', icon: '💻' },
    { id: 'behavioral', label: 'Behavioral', icon: '🤝' },
    { id: 'systemDesign', label: 'System Design', icon: '🏗️' },
  ];

  const inputClass = `w-full px-3 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-emerald-500/10' : 'bg-emerald-500/10'}`}>
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Interview Question Bank</h2>
            <p className="text-xs text-neutral-400">Practice with curated questions by category</p>
          </div>
        </div>
        <button onClick={shuffleQuestions}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${dark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
          <Shuffle className="w-3.5 h-3.5" /> Shuffle 5
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold transition-all ${
              activeCategory === c.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : dark ? 'text-neutral-500 hover:text-neutral-300 border border-neutral-800' : 'text-neutral-500 hover:text-neutral-700 border border-neutral-200'
            }`}>
            <span>{c.icon}</span> {c.label}
            <span className="text-neutral-500">({QUESTION_BANK[c.id]?.length || 0})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'easy', 'medium', 'hard'].map(d => (
          <button key={d} onClick={() => setFilterDifficulty(d)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              filterDifficulty === d
                ? d === 'easy' ? 'bg-emerald-500/10 text-emerald-400' : d === 'medium' ? 'bg-amber-500/10 text-amber-400' : d === 'hard' ? 'bg-red-500/10 text-red-400' : 'bg-neutral-500/10 text-neutral-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}>
            {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <span className="text-[10px] font-mono text-neutral-500 self-center ml-2">{filteredQuestions.length} questions</span>
      </div>

      {selectedQuestions.length > 0 && (
        <div className={`p-4 rounded border mb-6 ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
          <h4 className="text-xs font-bold font-mono text-emerald-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" /> Practice Set ({selectedQuestions.length})
          </h4>
          <div className="space-y-3">
            {selectedQuestions.map((q, i) => (
              <div key={i} className={`p-3 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-white'}`}>
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium pr-4">{i + 1}. {q.q}</p>
                  <button onClick={() => setShowAnswer(prev => ({ ...prev, [`practice_${i}`]: !prev[`practice_${i}`] }))} className="shrink-0 text-neutral-500 hover:text-emerald-400">
                    {showAnswer[`practice_${i}`] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {showAnswer[`practice_${i}`] && (
                  <p className="text-xs text-neutral-400 mt-2 pl-4 border-l-2 border-emerald-500/30">{q.tips}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {filteredQuestions.map((q, i) => (
          <div key={i} className={`p-4 rounded border transition-colors ${dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${difficultyColors[q.difficulty]}`}>{q.difficulty}</span>
                  {q.custom && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">Custom</span>}
                </div>
                <p className="text-sm font-medium">{q.q}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleBookmark(q)} className={`p-1.5 rounded transition-colors ${bookmarked.find(b => b.q === q.q) ? 'text-amber-400' : 'text-neutral-500 hover:text-amber-400'}`}>
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked.find(b => b.q === q.q) ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => setShowAnswer(prev => ({ ...prev, [i]: !prev[i] }))} className="p-1.5 rounded text-neutral-500 hover:text-emerald-400 transition-colors">
                  {showAnswer[i] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {q.custom && (
                  <button onClick={() => removeCustom(i - QUESTION_BANK[activeCategory].length)} className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {showAnswer[i] && (
              <p className="text-xs text-neutral-400 mt-3 pl-4 border-l-2 border-emerald-500/30">{q.tips}</p>
            )}
          </div>
        ))}
      </div>

      <div className={`p-4 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
        <h4 className="text-xs font-bold font-mono text-neutral-400 mb-3">Add Custom Question</h4>
        <div className="flex gap-2">
          <input
            placeholder="Type your interview question..."
            value={customQuestion}
            onChange={e => setCustomQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomQuestion()}
            className={`${inputClass} flex-1`}
          />
          <button onClick={addCustomQuestion} className="px-4 py-2 rounded text-xs font-mono font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {bookmarked.length > 0 && (
        <div className={`mt-6 p-4 rounded border ${dark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
          <h4 className="text-xs font-bold font-mono text-amber-400 mb-2">Bookmarked ({bookmarked.length})</h4>
          <div className="space-y-1.5">
            {bookmarked.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-neutral-400">
                <span className="truncate flex-1">{b.q}</span>
                <button onClick={() => toggleBookmark(b)} className="ml-2 text-neutral-500 hover:text-red-400"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
