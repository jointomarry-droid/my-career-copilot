'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  Cpu, Moon, Sun, Layers, Terminal, Play, Pause,
  BarChart3, Compass, FileText, Menu, X, ChevronRight,
  Settings, Bell, Zap, Download, Search, Globe, Shield,
  Activity, ClipboardList, TrendingUp, Heart, MessageSquare, RefreshCw, Target,
  Sparkles, Calendar, DollarSign, Clock, Scale, GraduationCap,
  Building2, StickyNote, Plane, Mail, Users, Brain, Bot, Workflow, LineChart,
  BookOpen, AlertTriangle, Network
} from 'lucide-react';
import PipelineCard from '../components/PipelineCard';
import AgentCard from '../components/AgentCard';
import TerminalLog from '../components/TerminalLog';
import AnalyticsCharts from '../components/AnalyticsCharts';
import CampaignManager from '../components/CampaignManager';
import DiscoveryFeed from '../components/DiscoveryFeed';
import ProfileForm from '../components/ProfileForm';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import OnboardingWizard from '../components/OnboardingWizard';
import NotificationSettings from '../components/NotificationSettings';
import SearchPanel from '../components/SearchPanel';
import VisaScorer from '../components/VisaScorer';
import AuditTrail from '../components/AuditTrail';
import HealthDashboard from '../components/HealthDashboard';
import InterviewPrep from '../components/InterviewPrep';
import InterviewQuestionBank from '../components/InterviewQuestionBank';
import StatusCheck from '../components/StatusCheck';
import SEOAnalyzer from '../components/SEOAnalyzer';
import LinkedInOptimizer from '../components/LinkedInOptimizer';
import ResumeOptimizer from '../components/ResumeOptimizer';
import DeadlineTracker from '../components/DeadlineTracker';
import SmartRecommendations from '../components/SmartRecommendations';
import ResumeVersionManager from '../components/ResumeVersionManager';
import SalaryIntelligence from '../components/SalaryIntelligence';
import ApplicationTimeline from '../components/ApplicationTimeline';
import DocumentChecklist from '../components/DocumentChecklist';
import OfferComparator from '../components/OfferComparator';
import SkillLearningRoadmap from '../components/SkillLearningRoadmap';
import RelocationCostCalculator from '../components/RelocationCostCalculator';
import CoverLetterGenerator from '../components/CoverLetterGenerator';
import NetworkingTracker from '../components/NetworkingTracker';
import CompanyResearchHub from '../components/CompanyResearchHub';
import QuickNotes from '../components/QuickNotes';
import DeepAnalysisEngine from '../components/DeepAnalysisEngine';
import AIChatAssistant from '../components/AIChatAssistant';
import SmartAutomation from '../components/SmartAutomation';
import MarketIntelligence from '../components/MarketIntelligence';
import ChainOfThought from '../components/ChainOfThought';
import SynthesisEngine from '../components/SynthesisEngine';
import AdaptivePlanner from '../components/AdaptivePlanner';
import OutcomeAnalyzer from '../components/OutcomeAnalyzer';
import ConfidenceDashboard from '../components/ConfidenceDashboard';
import ContentEngine from '../components/ContentEngine';
import CausalReasoningEngine from '../components/CausalReasoningEngine';
import SelfCritiqueEngine from '../components/SelfCritiqueEngine';
import TemporalTrajectoryMapper from '../components/TemporalTrajectoryMapper';
import DecisionMatrixPro from '../components/DecisionMatrixPro';
import InterviewSimulationEngine from '../components/InterviewSimulationEngine';
import CalibrationTracker from '../components/CalibrationTracker';
import CommunicationSentimentAnalyzer from '../components/CommunicationSentimentAnalyzer';
import StrategicNarrativeBuilder from '../components/StrategicNarrativeBuilder';
import AnomalyDetectionSystem from '../components/AnomalyDetectionSystem';
import KnowledgeGraphVisualizer from '../components/KnowledgeGraphVisualizer';
import SecurityDashboard from '../components/SecurityDashboard';
import AutoSEOOptimizer from '../components/AutoSEOOptimizer';

const AGENTS = [
  { title: 'Scholarship Scout', desc: 'Searches DAAD, Chevening, Fulbright, University databases. Matches entry criteria and fills applications.', status: 'Scanning global scholarship sites...', color: 'indigo' },
  { title: 'Job Hunter', desc: 'Scrapes targeted global jobs, rewrites resume using AI to match job description exactly, applies via Playwright.', status: 'Drafting cover letter for ASML...', color: 'emerald' },
  { title: 'Permit Pathfinder', desc: 'Analyzes migration law. Builds visa-ready document packages and schedules biometrics on governmental portals.', status: 'Document checklist loaded...', color: 'amber' },
  { title: 'Interview Coach', desc: 'Researches companies, generates interview questions, creates prep materials, and provides salary intelligence.', status: 'Ready for interview prep...', color: 'purple' },
  { title: 'SEO Optimizer', desc: 'Optimizes resumes, LinkedIn profiles, and cover letters for ATS systems and recruiter search visibility.', status: 'Analyzing keywords...', color: 'cyan' },
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'agents', label: 'Agents', icon: Cpu },
  { id: 'profile', label: 'Profile', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'visa', label: 'Visa', icon: Globe },
  { id: 'intelligence', label: 'Analytics', icon: BarChart3 },
  { id: 'recommendations', label: 'For You', icon: Sparkles },
  { id: 'deadlines', label: 'Deadlines', icon: Calendar },
  { id: 'optimizer', label: 'ATS Score', icon: Target },
  { id: 'salary', label: 'Salary', icon: DollarSign },
  { id: 'relocation', label: 'Relocate', icon: Plane },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'compare', label: 'Compare', icon: Scale },
  { id: 'coverletter', label: 'Cover Letter', icon: Mail },
  { id: 'network', label: 'Network', icon: Users },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'documents', label: 'Docs', icon: ClipboardList },
  { id: 'campaigns', label: 'Campaigns', icon: Settings },
  { id: 'discoveries', label: 'Discoveries', icon: Compass },
  { id: 'interview', label: 'Interview', icon: MessageSquare },
  { id: 'seo', label: 'SEO', icon: Target },
  { id: 'status', label: 'Status', icon: RefreshCw },
  { id: 'audit', label: 'Audit', icon: ClipboardList },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'deep-analysis', label: 'Deep Analysis', icon: Brain },
  { id: 'ai-chat', label: 'AI Chat', icon: Bot },
  { id: 'automation', label: 'Automation', icon: Workflow },
  { id: 'market', label: 'Market Intel', icon: LineChart },
  { id: 'chain-of-thought', label: 'Chain of Thought', icon: Brain },
  { id: 'synthesis', label: 'Synthesis', icon: Layers },
  { id: 'planner', label: 'Planner', icon: Target },
  { id: 'outcomes', label: 'Outcomes', icon: BarChart3 },
  { id: 'confidence', label: 'Confidence', icon: Target },
  { id: 'content', label: 'Content Gen', icon: FileText },
  { id: 'causal', label: 'Causal', icon: Brain },
  { id: 'critique', label: 'Critique', icon: Shield },
  { id: 'trajectory', label: 'Trajectory', icon: TrendingUp },
  { id: 'decision', label: 'Decision', icon: Scale },
  { id: 'interview-sim', label: 'Interview Sim', icon: MessageSquare },
  { id: 'calibration', label: 'Calibration', icon: Target },
  { id: 'sentiment', label: 'Sentiment', icon: Activity },
  { id: 'narrative', label: 'Narrative', icon: BookOpen },
  { id: 'anomaly', label: 'Anomaly', icon: AlertTriangle },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'auto-seo', label: 'Auto SEO', icon: Search },
];

export default function AICareerCopilot() {
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark' || theme === undefined;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [agentRunning, setAgentRunning] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoApplying, setAutoApplying] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('copilot_onboarded');
    if (!hasOnboarded) setShowOnboarding(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('copilot_onboarded', 'true');
    setShowOnboarding(false);
    toast.success('Welcome to AI Career Copilot! Your agents are ready.');
  };

  // SSE real-time log streaming
  useEffect(() => {
    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/stream');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') setSseConnected(true);
            else if (data.type === 'log') {
              setTerminalLogs(prev => [{
                id: data._id || Date.now(),
                time: new Date(data.timestamp).toLocaleTimeString(),
                msg: data.msg || data.message,
                type: data.status || 'info',
              }, ...prev].slice(0, 50));
            }
          } catch (e) {}
        };
        eventSource.onerror = () => {
          setSseConnected(false);
          eventSource?.close();
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };
    connectSSE();
    return () => { eventSource?.close(); if (reconnectTimeout) clearTimeout(reconnectTimeout); };
  }, []);

  // Fetch real data from DB
  const loadApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setApplications(data.data);
      }
    } catch (e) { console.error('Failed to load applications:', e); }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) { console.error('Failed to load profile:', e); }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch (e) { console.error('Failed to load analytics:', e); }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) setTerminalLogs(data.logs.map(l => ({
        id: l._id || l.id, time: new Date(l.timestamp).toLocaleTimeString(),
        msg: l.msg || l.message, type: l.status || 'info',
      })));
    } catch (e) { console.error('Failed to load logs:', e); }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([loadApplications(), loadProfile(), loadAnalytics(), loadLogs()]);
      setLoading(false);
    };
    loadAll();
    const interval = setInterval(loadApplications, 30000);
    return () => clearInterval(interval);
  }, [loadApplications, loadAnalytics, loadLogs]);

  // Auto-apply to an application
  const triggerAutoApply = async (app, e) => {
    if (e) e.stopPropagation();
    setAutoApplying(prev => ({ ...prev, [app._id]: true }));
    toast.info(`Launching auto-apply for ${app.title}...`);

    try {
      const res = await fetch('/api/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'usr-fiaz-001',
          targetUrl: app.url,
          targetType: app.type?.toLowerCase().replace(' ', '_') || 'job',
          position: app.title,
          applicationId: app._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Auto-apply queued! Job ID: ${data.queueId}`);
        await loadApplications();
      } else {
        toast.error(data.error || 'Auto-apply failed');
      }
    } catch (e) {
      toast.error('Auto-apply request failed');
    } finally {
      setAutoApplying(prev => ({ ...prev, [app._id]: false }));
    }
  };

  const toggleTheme = () => {
    setTheme(dark ? 'light' : 'dark');
    toast.info(`Switched to ${dark ? 'light' : 'dark'} mode`);
  };

  const filteredApps = applications.filter(app => {
    const countryMatch = selectedCountry === 'All' || app.country === selectedCountry;
    const typeMatch = selectedType === 'All' || app.type === selectedType;
    const searchMatch = !searchQuery || app.title?.toLowerCase().includes(searchQuery.toLowerCase()) || app.institution?.toLowerCase().includes(searchQuery.toLowerCase());
    return countryMatch && typeMatch && searchMatch;
  });

  const countries = [...new Set(applications.map(a => a.country).filter(Boolean))];

  if (showOnboarding) return <OnboardingWizard dark={dark} onComplete={completeOnboarding} />;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${dark ? 'bg-[#0A0A0B] text-white' : 'bg-[#F8F9FA] text-[#0A0A0B]'}`}>
      {/* HEADER */}
      <header className={`border-b transition-colors duration-300 ${dark ? 'border-neutral-900 bg-[#0A0A0B]/80' : 'border-neutral-200 bg-[#F8F9FA]/80'} sticky top-0 z-40 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded transition-colors ${dark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-600/10 text-blue-600'}`}>
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className={`text-xs tracking-[0.2em] font-bold block ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>GLOBAL APPLICATOR</span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">AI CAREER COPILOT</h1>
            </div>
            <h1 className="sm:hidden text-lg font-bold">Copilot</h1>
          </div>

          <nav className="hidden md:flex space-x-1 text-xs bg-neutral-900/10 dark:bg-neutral-800/40 p-1 rounded-lg">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? (dark ? 'bg-cyan-500 text-[#0A0A0B] shadow-lg shadow-cyan-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20')
                    : (dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900')
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-500 animate-ping' : 'bg-yellow-500'}`} />
              <span className="text-neutral-500 dark:text-neutral-400">{sseConnected ? 'Live' : 'Connecting...'}</span>
            </div>
            <button onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors ${dark ? 'border-neutral-800 bg-[#0F0F11] hover:bg-neutral-800 text-yellow-400' : 'border-neutral-200 bg-white hover:bg-neutral-100 text-indigo-900'}`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-neutral-800">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-inherit">
            <div className="p-2 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? (dark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-600')
                        : (dark ? 'text-neutral-400 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100')
                    }`}>
                    <Icon className="w-4 h-4" /> {tab.label}
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* TELEMETRY BAR */}
      <section className={`border-b transition-colors ${dark ? 'border-neutral-900 bg-gradient-to-r from-neutral-950 via-[#0C0E14] to-neutral-950' : 'border-neutral-200 bg-gradient-to-r from-neutral-50 via-blue-50/20 to-neutral-50'} py-2 sm:py-3 px-4 sm:px-6 text-xs font-mono`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
            <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider hidden sm:inline">LIVE:</span>
            <span className={`${dark ? 'text-neutral-300' : 'text-neutral-600'} truncate`}>
              {terminalLogs[0]?.msg || 'Listening...'}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            <span>Global (210 Countries)</span>
            <span>{analytics?.total || applications.length} Tracked</span>
            <span>{applications.filter(a => a.status === 'Submitted').length} Submitted</span>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Stats */}
              <div className={`col-span-1 border rounded-lg p-5 sm:p-6 flex flex-col ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-mono text-sm uppercase text-neutral-400 tracking-wider">Campaign</h3>
                  <Layers className={dark ? 'text-cyan-400' : 'text-blue-600'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: analytics?.total || applications.length, l: 'Total', c: '' }, { v: `${analytics?.avgMatch || 0}%`, l: 'Avg Match', c: '' },
                    { v: analytics?.submitted || applications.filter(a => a.status === 'Submitted').length, l: 'Submitted', c: 'text-emerald-400' }, { v: `${analytics?.successRate || 0}%`, l: 'Success', c: 'text-cyan-400' }
                  ].map((s, i) => (
                    <div key={i} className={`p-3 sm:p-4 rounded border text-center ${dark ? 'border-neutral-900 bg-neutral-950/50' : 'border-neutral-200 bg-neutral-50'}`}>
                      <span className={`text-xl sm:text-2xl font-bold block ${s.c}`}>{s.v}</span>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase">{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-6 space-y-2">
                  <button onClick={() => {
                    setAgentRunning(!agentRunning);
                    toast(agentRunning ? 'Agents paused' : 'Agents activated');
                  }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded font-mono text-sm font-bold transition-all ${
                      agentRunning ? 'bg-amber-500 hover:bg-amber-600 text-neutral-900'
                        : (dark ? 'bg-cyan-400 hover:bg-cyan-500 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white')
                    }`}>
                    {agentRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Activate</>}
                  </button>
                  <button onClick={async () => {
                    toast.info('Running bulk auto-apply on all queued applications...');
                    for (const app of applications.filter(a => a.status === 'Queued')) {
                      await triggerAutoApply(app);
                    }
                  }}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded font-mono text-xs font-bold transition-all ${dark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
                    <Zap className="w-3.5 h-3.5" /> Auto-Apply All Queued
                  </button>
                </div>
              </div>

              <TerminalLog logs={terminalLogs} dark={dark} streaming={sseConnected} />
            </div>

            {/* Pipelines */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Active Pipelines</h2>
                  <p className="text-xs text-neutral-500 mt-1">Real-time application queues.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center border rounded bg-neutral-900/5 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-800">
                    {['All', 'Scholarship', 'Job', 'Work Permit'].map((type) => (
                      <button key={type} onClick={() => setSelectedType(type)}
                        className={`px-3 py-1.5 transition-colors ${type !== 'All' ? 'border-l border-neutral-200 dark:border-neutral-800' : 'rounded-l'} ${selectedType === type ? (dark ? 'bg-neutral-800 text-white' : 'bg-neutral-200') : ''}`}>
                        {type === 'Work Permit' ? 'Permits' : type === 'All' ? 'All' : type + 's'}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-7 pr-3 py-1.5 border rounded outline-none w-36 ${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                    />
                  </div>
                  <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                    className={`px-3 py-1.5 border rounded outline-none ${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                    <option value="All">All Countries</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredApps.map((app) => (
                  <div key={app._id || app.id} onClick={() => setSelectedApp(app)} className="cursor-pointer">
                    <PipelineCard
                      app={app}
                      dark={dark}
                      onAutoApply={triggerAutoApply}
                      isAutoApplying={autoApplying[app._id]}
                    />
                  </div>
                ))}
              </div>
              {filteredApps.length === 0 && !loading && (
                <div className={`text-center py-12 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
                  <p className="text-sm text-neutral-500">No applications match your filters.</p>
                </div>
              )}
            </div>

            {/* Agents */}
            <div className={`p-6 sm:p-8 border rounded-lg ${dark ? 'border-neutral-900 bg-[#0F0F11]/20' : 'border-neutral-200 bg-neutral-50/50'}`}>
              <h2 className="text-lg font-bold tracking-tight mb-6">Autonomous Workforce</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                {AGENTS.map((item, i) => <AgentCard key={i} agent={item} dark={dark} running={agentRunning} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">AI Agent Registry</h2>
            <div className="grid grid-cols-1 gap-6">
              {[
                { name: 'Scholarship Scout (v3.0)', actions: ['LLM-powered essay generation', 'Dynamic form filling', 'Browser pool reuse', 'Credential translation', 'Reference verification'], criteria: 'GPA > 3.5, IELTS > 7.5', territories: 'Europe, North America', status: 'Enhanced' },
                { name: 'Job Hunter (v4.0)', actions: ['AI cover letter generation', 'Smart field detection', 'Human-mimic typing', 'Resume auto-upload', 'Follow-up scheduling'], criteria: 'Software Dev, AI Scientist, Robotics', territories: 'NL, DE, UK, USA', status: 'Enhanced' },
                { name: 'Permit Pathfinder (v2.0)', actions: ['Visa eligibility scoring', 'Smart select option detection', 'Government portal automation', 'Document audit', 'Deadline tracking'], criteria: 'Skilled Migrant, Nomad, Fast-track', territories: 'Schengen, UK, Canada', status: 'Enhanced' },
                { name: 'Interview Coach (v1.0)', actions: ['Company research via web scraping', 'Interview question generation', 'Pre-interview briefing documents', 'Salary intelligence by region', 'Behavioral answer coaching'], criteria: 'All interview types', territories: 'Global', status: 'New' },
                { name: 'SEO Optimizer (v1.0)', actions: ['ATS compatibility scoring', 'Keyword extraction & matching', 'LinkedIn profile optimization', 'Resume keyword density analysis', 'Content readability scoring'], criteria: 'All application types', territories: 'Global', status: 'New' },
              ].map((agent, i) => (
                <div key={i} className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">{agent.name}</h3>
                    <span className="px-3 py-1 rounded text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{agent.status}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div><h4 className="font-mono text-xs uppercase text-neutral-400 mb-2">Actions</h4>
                      <ul className="space-y-1 text-xs">{agent.actions.map((a, j) => <li key={j} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400" />{a}</li>)}</ul>
                    </div>
                    <div><h4 className="font-mono text-xs uppercase text-neutral-400 mb-2">Parameters</h4>
                      <p className="text-xs bg-neutral-950 p-2 rounded font-mono border border-neutral-900">{agent.criteria}</p>
                    </div>
                    <div><h4 className="font-mono text-xs uppercase text-neutral-400 mb-2">Territories</h4>
                      <p className="text-xs bg-neutral-950 p-2 rounded font-mono border border-neutral-900">{agent.territories}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            <ProfileForm dark={dark} />
            <ResumeVersionManager dark={dark} />
            <SkillLearningRoadmap dark={dark} />
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Analytics Dashboard</h2>
              <button onClick={async () => {
                const csv = applications.map(a => `"${a.title}","${a.institution}","${a.type}","${a.country}","${a.status}","${a.matchScore}","${a.agent}"`).join('\n');
                const blob = new Blob(['"Title","Institution","Type","Country","Status","Match Score","Agent"\n' + csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click();
                toast.success('CSV exported!');
              }} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono ${dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
            <AnalyticsCharts stats={analytics || { total: applications.length, submitted: applications.filter(a => a.status === 'Submitted').length, inProgress: applications.filter(a => a.status !== 'Submitted').length, failed: 0, avgMatch: Math.round(applications.reduce((s, a) => s + (a.matchScore || 0), 0) / (applications.length || 1)), byType: applications.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {}), byCountry: applications.reduce((acc, a) => { acc[a.country] = (acc[a.country] || 0) + 1; return acc; }, {}), timeline: [], successRate: Math.round((applications.filter(a => a.status === 'Submitted').length / (applications.length || 1)) * 100) }} dark={dark} />
            <SalaryIntelligence dark={dark} />
          </div>
        )}

        {activeTab === 'search' && <SearchPanel dark={dark} />}
        {activeTab === 'visa' && (
          <div className="space-y-8">
            <VisaScorer dark={dark} />
            <DocumentChecklist dark={dark} />
          </div>
        )}
        {activeTab === 'campaigns' && <CampaignManager dark={dark} />}
        {activeTab === 'discoveries' && <DiscoveryFeed dark={dark} onAutoApply={triggerAutoApply} />}
        {activeTab === 'interview' && (
          <div className="space-y-8">
            <InterviewPrep dark={dark} />
            <InterviewQuestionBank dark={dark} />
          </div>
        )}
        {activeTab === 'recommendations' && <SmartRecommendations dark={dark} />}
        {activeTab === 'deadlines' && <DeadlineTracker dark={dark} />}
        {activeTab === 'optimizer' && <ResumeOptimizer dark={dark} />}
        {activeTab === 'salary' && <SalaryIntelligence dark={dark} />}
        {activeTab === 'relocation' && <RelocationCostCalculator dark={dark} />}
        {activeTab === 'timeline' && <ApplicationTimeline dark={dark} />}
        {activeTab === 'compare' && <OfferComparator dark={dark} />}
        {activeTab === 'coverletter' && <CoverLetterGenerator dark={dark} />}
        {activeTab === 'network' && <NetworkingTracker dark={dark} />}
        {activeTab === 'companies' && <CompanyResearchHub dark={dark} />}
        {activeTab === 'learn' && <SkillLearningRoadmap dark={dark} />}
        {activeTab === 'notes' && <QuickNotes dark={dark} />}
        {activeTab === 'documents' && <DocumentChecklist dark={dark} />}
        {activeTab === 'seo' && (
          <div className="space-y-8">
            <ResumeOptimizer dark={dark} />
            <SEOAnalyzer dark={dark} />
            <LinkedInOptimizer dark={dark} />
          </div>
        )}
        {activeTab === 'status' && <StatusCheck dark={dark} />}
        {activeTab === 'audit' && <AuditTrail dark={dark} />}
        {activeTab === 'health' && <HealthDashboard dark={dark} />}
        {activeTab === 'notifications' && <NotificationSettings dark={dark} />}
        {activeTab === 'deep-analysis' && <DeepAnalysisEngine dark={dark} applications={applications} profile={profile} />}
        {activeTab === 'ai-chat' && <AIChatAssistant dark={dark} profile={profile} applications={applications} />}
        {activeTab === 'automation' && <SmartAutomation dark={dark} applications={applications} profile={profile} />}
        {activeTab === 'market' && <MarketIntelligence dark={dark} profile={profile} />}
        {activeTab === 'chain-of-thought' && <ChainOfThought dark={dark} applications={applications} profile={profile} />}
        {activeTab === 'synthesis' && <SynthesisEngine dark={dark} applications={applications} profile={profile} />}
        {activeTab === 'planner' && <AdaptivePlanner dark={dark} applications={applications} profile={profile} />}
        {activeTab === 'outcomes' && <OutcomeAnalyzer dark={dark} applications={applications} />}
        {activeTab === 'confidence' && <ConfidenceDashboard dark={dark} applications={applications} />}
        {activeTab === 'content' && <ContentEngine dark={dark} profile={profile} applications={applications} />}
        {activeTab === 'causal' && <CausalReasoningEngine dark={dark} applications={applications} profile={profile} />}
        {activeTab === 'critique' && <SelfCritiqueEngine dark={dark} profile={profile} applications={applications} />}
        {activeTab === 'trajectory' && <TemporalTrajectoryMapper dark={dark} profile={profile} />}
        {activeTab === 'decision' && <DecisionMatrixPro dark={dark} profile={profile} />}
        {activeTab === 'interview-sim' && <InterviewSimulationEngine dark={dark} profile={profile} />}
        {activeTab === 'calibration' && <CalibrationTracker dark={dark} applications={applications} />}
        {activeTab === 'sentiment' && <CommunicationSentimentAnalyzer dark={dark} />}
        {activeTab === 'narrative' && <StrategicNarrativeBuilder dark={dark} profile={profile} applications={applications} />}
        {activeTab === 'anomaly' && <AnomalyDetectionSystem dark={dark} applications={applications} />}
        {activeTab === 'knowledge-graph' && <KnowledgeGraphVisualizer dark={dark} profile={profile} applications={applications} />}
        {activeTab === 'security' && <SecurityDashboard dark={dark} />}
        {activeTab === 'auto-seo' && <AutoSEOOptimizer dark={dark} />}
      </main>

      {selectedApp && <ApplicationDetailModal app={selectedApp} dark={dark} onClose={() => setSelectedApp(null)} onAutoApply={triggerAutoApply} />}

      <footer className={`border-t transition-colors ${dark ? 'border-neutral-900 bg-neutral-950/20 text-neutral-600' : 'border-neutral-200 bg-neutral-50 text-neutral-400'} mt-12 sm:mt-20 py-6 sm:py-8 px-4 sm:px-6 text-xs text-center font-mono`}>
        <div className="max-w-7xl mx-auto">
          <span>© 2026 AI Career Copilot. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}
