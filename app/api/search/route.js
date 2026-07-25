import { NextResponse } from 'next/server';
import { getUserApplications, getDiscoveries, getRecentAgentLogs, getAllApplications } from '../../../lib/mongodb.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=query&scope=applications|discoveries|logs|all
 *
 * Full-text search across all data
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const scope = searchParams.get('scope') || 'all';
    const userId = searchParams.get('userId') || 'usr-fiaz-001';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const q = query.toLowerCase();
    const results = { applications: [], discoveries: [], logs: [], total: 0 };

    if (scope === 'all' || scope === 'applications') {
      const apps = await getAllApplications();
      results.applications = apps
        .filter(app =>
          (app.title || '').toLowerCase().includes(q) ||
          (app.institution || '').toLowerCase().includes(q) ||
          (app.country || '').toLowerCase().includes(q) ||
          (app.type || '').toLowerCase().includes(q) ||
          (app.agent || '').toLowerCase().includes(q)
        )
        .slice(0, limit)
        .map(app => ({ ...app, _source: 'applications' }));
    }

    if (scope === 'all' || scope === 'discoveries') {
      const discs = await getDiscoveries(userId, 200);
      results.discoveries = discs
        .filter(d =>
          (d.title || '').toLowerCase().includes(q) ||
          (d.source || '').toLowerCase().includes(q) ||
          (d.country || '').toLowerCase().includes(q) ||
          (d.type || '').toLowerCase().includes(q)
        )
        .slice(0, limit)
        .map(d => ({ ...d, _source: 'discoveries' }));
    }

    if (scope === 'all' || scope === 'logs') {
      const logs = await getRecentAgentLogs(200);
      results.logs = logs
        .filter(l =>
          (l.msg || l.message || '').toLowerCase().includes(q) ||
          (l.type || '').toLowerCase().includes(q) ||
          (l.status || '').toLowerCase().includes(q)
        )
        .slice(0, limit)
        .map(l => ({ ...l, _source: 'logs' }));
    }

    results.total = results.applications.length + results.discoveries.length + results.logs.length;

    return NextResponse.json({
      success: true,
      query,
      scope,
      data: results,
      total: results.total,
    });
  } catch (error) {
    console.error('[Search] Error:', error);
    return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
  }
}
