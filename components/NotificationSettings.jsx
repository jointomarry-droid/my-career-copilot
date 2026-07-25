'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_PREFS = {
  emailStatusChanges: true,
  emailNewDiscoveries: true,
  emailDailyDigest: false,
  emailWeeklyReport: true,
  emailAddress: '',
};

export default function NotificationSettings({ dark }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('copilot_notification_prefs');
    if (stored) {
      try { setPrefs(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const savePrefs = () => {
    localStorage.setItem('copilot_notification_prefs', JSON.stringify(prefs));
    setSaved(true);
    toast.success('Notification preferences saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  const sendTestEmail = async () => {
    if (!prefs.emailAddress) {
      toast.error('Enter an email address first');
      return;
    }
    setTestSending(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', email: prefs.emailAddress }),
      });
      toast.success('Test email queued!');
    } catch (e) {
      toast.error('Failed to send test email');
    } finally {
      setTestSending(false);
    }
  };

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Notification Preferences</h2>
        <p className="text-xs text-neutral-400 mt-1">Configure how and when you receive alerts from your agents.</p>
      </div>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-mono text-xs uppercase text-neutral-400 mb-4">Email Address</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={prefs.emailAddress}
            onChange={(e) => setPrefs(prev => ({ ...prev, emailAddress: e.target.value }))}
            placeholder="your@email.com"
            className={`flex-1 px-4 py-2 rounded border text-sm outline-none ${dark ? 'bg-neutral-950 border-neutral-800 focus:border-cyan-500' : 'bg-neutral-50 border-neutral-200 focus:border-blue-500'}`}
          />
          <button onClick={sendTestEmail} disabled={testSending}
            className={`px-4 py-2 rounded text-sm font-mono font-bold transition-all ${dark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
            {testSending ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>

      <div className={`border rounded-lg p-6 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <h3 className="font-mono text-xs uppercase text-neutral-400 mb-4">Alert Types</h3>
        <div className="space-y-3">
          {[
            { key: 'emailStatusChanges', label: 'Application Status Changes', desc: 'Get notified when an application status updates' },
            { key: 'emailNewDiscoveries', label: 'New Discoveries', desc: 'Alert when new opportunities are found' },
            { key: 'emailDailyDigest', label: 'Daily Digest', desc: 'Summary of all agent activity each morning' },
            { key: 'emailWeeklyReport', label: 'Weekly Report', desc: 'Comprehensive weekly performance report' },
          ].map(({ key, label, desc }) => (
            <button key={key} onClick={() => toggle(key)}
              className={`w-full flex items-center justify-between p-3 rounded border transition-colors ${prefs[key]
                ? (dark ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-blue-500/30 bg-blue-50')
                : (dark ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200 hover:border-neutral-300')
              }`}>
              <div className="flex items-center gap-3">
                <Mail className={`w-4 h-4 ${prefs[key] ? 'text-cyan-400' : 'text-neutral-500'}`} />
                <div className="text-left">
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-[10px] text-neutral-500">{desc}</div>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${prefs[key] ? 'bg-cyan-500' : 'bg-neutral-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${prefs[key] ? 'left-5.5' : 'left-0.5'}`} style={{ left: prefs[key] ? '22px' : '2px' }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={savePrefs}
        className={`flex items-center gap-2 px-6 py-3 rounded font-mono text-sm font-bold transition-all ${saved ? 'bg-emerald-500 text-white' : dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Preferences</>}
      </button>
    </div>
  );
}
