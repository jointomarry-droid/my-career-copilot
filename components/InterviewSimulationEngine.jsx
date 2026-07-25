'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Clock, CheckCircle, AlertTriangle, RefreshCw, Play, Pause, RotateCcw, BarChart3 } from 'lucide-react';

const InterviewSimulationEngine = ({ dark, profile, applications }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const questionTypes = [
    { id: 'behavioral', label: 'Behavioral', desc: 'STAR method questions' },
    { id: 'technical', label: 'Technical', desc: 'Coding & system design' },
    { id: 'situational', label: 'Situational', desc: 'Hypothetical scenarios' },
    { id: 'leadership', label: 'Leadership', desc: 'Management & team questions' },
  ];

  const startSession = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/interview-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, profile, action: 'start' }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.data);
        setMessages([{ role: 'interviewer', content: data.data.welcomeMessage }]);
        setCurrentQuestion(data.data.firstQuestion);
        setIsTimerRunning(true);
      }
    } catch (e) {
      console.error('Failed to start interview session:', e);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submitAnswer = useCallback(async () => {
    if (!input.trim() || !currentQuestion) return;

    const userMessage = { role: 'candidate', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTimerRunning(false);

    try {
      const res = await fetch('/api/reasoning/interview-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          question: currentQuestion,
          answer: input.trim(),
          profile,
          timeSpent: timer,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvaluation(data.data.evaluation);
        setMessages(prev => [...prev, 
          { role: 'interviewer', content: data.data.feedback },
          { role: 'system', content: `Score: ${data.data.evaluation.score}/100` }
        ]);
        if (data.data.nextQuestion) {
          setCurrentQuestion(data.data.nextQuestion);
          setTimer(0);
          setIsTimerRunning(true);
        }
      }
    } catch (e) {
      console.error('Failed to evaluate answer:', e);
    }
  }, [input, currentQuestion, profile, timer]);

  const endSession = () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const resetSession = () => {
    setSession(null);
    setMessages([]);
    setCurrentQuestion(null);
    setEvaluation(null);
    setTimer(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Interview Simulation Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Structured interview practice with real-time scoring</p>
        </div>
        {session && (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-mono">{formatTime(timer)}</span>
            </div>
            <button onClick={endSession}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20">
              End Session
            </button>
          </div>
        )}
      </div>

      {!session && !loading && (
        <div className={`p-6 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
          <h3 className="font-medium text-sm mb-4">Select Interview Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {questionTypes.map((type) => (
              <button key={type.id} onClick={() => startSession(type.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  dark ? 'border-neutral-800 hover:border-cyan-500/30 bg-neutral-900/50' : 'border-neutral-200 hover:border-blue-300 bg-white'
                }`}>
                <h4 className="font-medium text-sm">{type.label}</h4>
                <p className="text-xs text-neutral-400 mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Preparing interview questions...</p>
        </div>
      )}

      {session && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <div className={`p-4 border-b ${dark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Interview Chat</h3>
                  <span className="text-xs text-neutral-400">Question {(session.questionCount || 0) + 1} of {session.totalQuestions || 10}</span>
                </div>
              </div>
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'candidate'
                        ? (dark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-blue-50 border border-blue-200')
                        : msg.role === 'system'
                        ? (dark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200')
                        : (dark ? 'bg-neutral-800 border border-neutral-700' : 'bg-neutral-100 border border-neutral-200')
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'interviewer' && <Bot className="w-3 h-3 text-cyan-400" />}
                        {msg.role === 'candidate' && <User className="w-3 h-3 text-blue-400" />}
                        <span className="text-[10px] text-neutral-400 capitalize">{msg.role}</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className={`p-4 border-t ${dark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <div className="flex gap-2">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitAnswer())}
                    placeholder="Type your answer..."
                    rows={2}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm border resize-none outline-none ${
                      dark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border-neutral-200 placeholder-neutral-400'
                    }`} />
                  <button onClick={submitAnswer} disabled={!input.trim()}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      input.trim()
                        ? (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
                        : (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
                    }`}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {currentQuestion && (
              <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                <h3 className="font-medium text-sm mb-2">Current Question</h3>
                <p className="text-sm text-neutral-300">{currentQuestion.text}</p>
                {currentQuestion.hints && (
                  <div className="mt-3 pt-3 border-t border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block mb-1">HINTS</span>
                    <ul className="space-y-1">
                      {currentQuestion.hints.map((hint, i) => (
                        <li key={i} className="text-xs text-neutral-400">• {hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {evaluation && (
              <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
                <h3 className="font-medium text-sm mb-3">Evaluation</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">Score</span>
                      <span className={`font-bold ${evaluation.score >= 80 ? 'text-emerald-400' : evaluation.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {evaluation.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${evaluation.score >= 80 ? 'bg-emerald-400' : evaluation.score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${evaluation.score}%` }} />
                    </div>
                  </div>
                  {evaluation.breakdown && Object.entries(evaluation.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{value}/10</span>
                    </div>
                  ))}
                  {evaluation.feedback && (
                    <div className={`p-2 rounded text-xs ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                      {evaluation.feedback}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button onClick={resetSession}
              className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}>
              <RotateCcw className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSimulationEngine;
