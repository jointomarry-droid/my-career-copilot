'use client';

import { useEffect, useRef } from 'react';
import { Terminal, RotateCw } from 'lucide-react';

export default function TerminalLog({ logs, dark, streaming }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const logTypeColors = {
    success: 'text-emerald-400',
    sys: 'text-cyan-300',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-neutral-300',
  };

  return (
    <div className={`col-span-1 lg:col-span-2 border rounded-lg p-6 flex flex-col justify-between transition-colors ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm uppercase text-neutral-400 tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
            Agent Command Sequence Log
          </h3>
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
        </div>

        <div ref={scrollRef} className={`font-mono text-xs p-4 rounded h-64 overflow-y-auto space-y-2 border transition-colors ${dark ? 'bg-neutral-950 border-neutral-900 text-cyan-400/90' : 'bg-neutral-950 border-neutral-200 text-neutral-200'}`}>
          {logs.map((log, i) => (
            <div key={log.id || log._id || i} className="flex items-start space-x-2">
              <span className="text-neutral-600 select-none">[{log.time || new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={logTypeColors[log.type] || 'text-neutral-300'}>
                {log.msg || log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-neutral-600 text-center py-8">
              Waiting for agent telemetry...
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-900 text-xs text-neutral-500 font-mono">
        <span>{logs.length} entries loaded</span>
        <span className="flex items-center gap-1.5 text-cyan-500">
          {streaming ? (
            <>
              <RotateCw className="w-3 h-3 animate-spin" /> SSE Stream Active
            </>
          ) : (
            <span className="text-yellow-500">Connecting...</span>
          )}
        </span>
      </div>
    </div>
  );
}
