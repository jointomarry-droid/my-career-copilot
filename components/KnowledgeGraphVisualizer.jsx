'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Network, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const KnowledgeGraphVisualizer = ({ dark, profile, applications }) => {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reasoning/knowledge-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, applications }),
      });
      const data = await res.json();
      if (data.success) setGraph(data.data);
    } catch (e) {
      console.error('Failed to load knowledge graph:', e);
    } finally {
      setLoading(false);
    }
  }, [profile, applications]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  useEffect(() => {
    if (!graph || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = dark ? '#0A0A0B' : '#F8F9FA';
    ctx.fillRect(0, 0, width, height);

    const nodeColors = {
      skill: '#06b6d4',
      company: '#8b5cf6',
      role: '#10b981',
      application: '#f59e0b',
      connection: '#ec4899',
    };

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    graph.nodes?.forEach((node, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * (node.level || 1);
      const y = centerY + Math.sin(angle) * radius * (node.level || 1);
      
      node.x = x;
      node.y = y;

      const size = 8 + (node.importance || 1) * 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = nodeColors[node.type] || '#06b6d4';
      ctx.fill();
      ctx.strokeStyle = dark ? '#262626' : '#e5e5e5';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = dark ? '#a3a3a3' : '#525252';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x, y + size + 12);
    });

    graph.edges?.forEach((edge) => {
      const source = graph.nodes?.find(n => n.id === edge.source);
      const target = graph.nodes?.find(n => n.id === edge.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = dark ? '#404040' : '#d4d4d4';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [graph, dark]);

  const nodeTypes = [
    { type: 'skill', color: 'bg-cyan-500', label: 'Skills' },
    { type: 'company', color: 'bg-purple-500', label: 'Companies' },
    { type: 'role', color: 'bg-emerald-500', label: 'Roles' },
    { type: 'application', color: 'bg-amber-500', label: 'Applications' },
    { type: 'connection', color: 'bg-pink-500', label: 'Connections' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Knowledge Graph Explorer
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Visualize relationships between skills, companies, and opportunities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))}
            className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
            className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={loadGraph}
            className={`p-2 rounded-lg ${dark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-400">Building knowledge graph...</p>
        </div>
      )}

      {!loading && graph && (
        <>
          <div className={`rounded-lg border overflow-hidden ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {nodeTypes.map((type) => (
              <div key={type.type} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <span className="text-neutral-400">{type.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Graph Statistics</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Nodes</span>
                  <span>{graph.nodes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Connections</span>
                  <span>{graph.edges?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Skill Coverage</span>
                  <span className="text-cyan-400">{graph.stats?.skillCoverage || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Network Density</span>
                  <span>{graph.stats?.density || 0}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}>
              <h3 className="font-medium text-sm mb-3">Key Insights</h3>
              <div className="space-y-2">
                {graph.insights?.slice(0, 4).map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span className="text-neutral-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KnowledgeGraphVisualizer;
