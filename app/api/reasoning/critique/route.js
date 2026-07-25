import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { analysis, context } = await req.json();

    const issues = [];
    const recommendations = [];

    if (analysis) {
      const text = JSON.stringify(analysis).toLowerCase();

      if (text.includes('definitely') || text.includes('certainly') || text.includes('guaranteed')) {
        issues.push({ type: 'overconfidence', severity: 'high', message: 'Analysis uses absolute language. Consider hedging with probabilistic terms.' });
      }

      if (text.includes('always') || text.includes('never') || text.includes('all')) {
        issues.push({ type: 'generalization', severity: 'medium', message: 'Contains sweeping generalizations. Consider qualifying statements.' });
      }

      if (text.includes('i think') || text.includes('probably') || text.includes('maybe')) {
        issues.push({ type: 'weakness', severity: 'low', message: 'Some hedging detected. Strengthen language where confident.' });
      }

      const hasData = text.includes('%') || text.includes('score') || text.includes('metric');
      if (!hasData) {
        issues.push({ type: 'data_gap', severity: 'medium', message: 'Analysis lacks quantitative support. Add data points or metrics.' });
      }

      const hasSource = text.includes('based on') || text.includes('according to') || text.includes('data shows');
      if (!hasSource) {
        issues.push({ type: 'source_gap', severity: 'low', message: 'No sources cited. Reference data or research where possible.' });
      }
    }

    if (issues.length === 0) {
      issues.push({ type: 'clean', severity: 'none', message: 'Analysis passes basic quality checks.' });
    }

    recommendations.push('Cross-reference findings with external benchmarks.', 'Consider alternative interpretations of the data.', 'Review for confirmation bias—would someone disagree?', 'Ensure conclusions follow logically from the evidence presented.');

    return NextResponse.json({
      success: true,
      data: {
        issues,
        recommendations,
        qualityScore: Math.max(0, 100 - issues.filter(i => i.severity === 'high').length * 20 - issues.filter(i => i.severity === 'medium').length * 10 - issues.filter(i => i.severity === 'low').length * 5),
        issueCount: issues.filter(i => i.severity !== 'none').length,
      },
      critiquedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
