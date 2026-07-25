'use client';

export default function AgentCard({ agent, dark, running }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  };

  const colors = colorMap[agent.color] || colorMap.emerald;

  return (
    <div className={`border p-5 rounded-lg transition-colors ${dark ? 'bg-[#0A0A0B] border-neutral-900' : 'bg-white border-neutral-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold font-mono text-sm tracking-tight">{agent.title}</h3>
        <span className={`h-2.5 w-2.5 rounded-full ${running ? `${colors.dot} animate-pulse` : 'bg-red-400'}`} />
      </div>
      <p className="text-xs text-neutral-400 mb-6 leading-relaxed">{agent.desc}</p>
      <div className={`text-[10px] font-mono p-2.5 rounded ${dark ? 'bg-neutral-950 text-cyan-400' : 'bg-neutral-100 text-blue-800'}`}>
        {running ? agent.status : 'Idle'}
      </div>
    </div>
  );
}
