'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw, Download } from 'lucide-react';

const AIChatAssistant = ({ dark, profile, applications }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const modes = [
    { id: 'general', label: 'Career Advisor', desc: 'General career guidance' },
    { id: 'interview', label: 'Interview Prep', desc: 'Mock interviews & tips' },
    { id: 'resume', label: 'Resume Review', desc: 'CV optimization' },
    { id: 'negotiate', label: 'Negotiation', desc: 'Salary & offer strategy' },
    { id: 'networking', label: 'Networking', desc: 'Connection strategies' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        role: 'assistant',
        content: `Hello! I'm your AI Career Assistant. I can help you with:\n\n• **Career Strategy** - Plan your next move\n• **Interview Prep** - Practice with mock questions\n• **Resume Review** - Optimize your CV\n• **Salary Negotiation** - Get the best offer\n• **Networking** - Build meaningful connections\n\nWhat would you like to work on?`,
        timestamp: new Date(),
      }]);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          mode: selectedMode,
          profile,
          recentApplications: applications?.slice(0, 5),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions,
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, selectedMode, profile, applications, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: 'Chat cleared. How can I help you today?',
      timestamp: new Date(),
    }]);
  };

  const exportChat = () => {
    const chatText = messages.map(m => {
      const role = m.role === 'user' ? 'You' : 'AI Assistant';
      return `[${role}]\n${m.content}\n`;
    }).join('\n---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    const formatContent = (content) => {
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/• (.*?)(\n|$)/g, '<li class="ml-4">$1</li>')
        .replace(/\n/g, '<br />');
    };

    return (
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? (dark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600')
            : (dark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600')
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? (dark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-blue-50 border border-blue-200')
            : (dark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200')
        }`}>
          <div
            className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-800">
              <p className="text-xs text-neutral-400 mb-2">Suggested actions:</p>
              <div className="flex flex-wrap gap-2">
                {message.suggestions.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => copyMessage(message.content)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300">
              <Copy className="w-3 h-3" />
            </button>
            <button className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300">
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300">
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            AI Career Assistant
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Powered by advanced language models</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportChat}
            className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearChat}
            className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`flex gap-2 mb-4 p-1 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
        {modes.map((mode) => (
          <button key={mode.id} onClick={() => setSelectedMode(mode.id)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              selectedMode === mode.id
                ? (dark ? 'bg-cyan-500 text-neutral-900' : 'bg-white text-blue-600 shadow-sm')
                : (dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900')
            }`}>
            {mode.label}
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-y-auto rounded-xl border p-4 space-y-4 ${
        dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'
      }`}>
        {messages.map((msg) => (
          <div key={msg.id} className="group">
            <MessageBubble message={msg} />
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className={`px-4 py-3 rounded-2xl ${dark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'}`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className={`flex items-end gap-3 p-3 rounded-xl border ${
          dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'
        }`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about career advice, interview prep, resume tips..."
            rows={1}
            className={`flex-1 resize-none bg-transparent outline-none text-sm ${
              dark ? 'text-white placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'
            }`}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className={`p-2.5 rounded-lg transition-all ${
              input.trim() && !loading
                ? (dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900' : 'bg-blue-600 hover:bg-blue-500 text-white')
                : (dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400')
            }`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-neutral-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIChatAssistant;
