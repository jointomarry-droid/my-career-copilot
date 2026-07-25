import { NextResponse } from 'next/server';
import { getAllApplications, getDiscoveries, getCampaigns, getRecentAgentLogs } from '../../../lib/mongodb.js';
import { auditTrail } from '../../../lib/audit-trail.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export?format=csv|json&scope=applications|discoveries|campaigns|logs|all
 *
 * Export data in CSV or JSON format
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const scope = searchParams.get('scope') || 'applications';
    const userId = searchParams.get('userId') || 'usr-fiaz-001';

    let data = [];
    let filename = '';

    switch (scope) {
      case 'applications':
        data = await getAllApplications();
        filename = 'applications';
        break;
      case 'discoveries':
        data = await getDiscoveries(userId, 500);
        filename = 'discoveries';
        break;
      case 'campaigns':
        data = await getCampaigns(userId);
        filename = 'campaigns';
        break;
      case 'logs':
        data = await getRecentAgentLogs(500);
        filename = 'agent-logs';
        break;
      case 'all':
        const [apps, discs, camps, logs] = await Promise.all([
          getAllApplications(),
          getDiscoveries(userId, 500),
          getCampaigns(userId),
          getRecentAgentLogs(500),
        ]);
        data = { applications: apps, discoveries: discs, campaigns: camps, logs };
        filename = 'full-export';
        break;
      default:
        return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
    }

    await auditTrail.exportRequested(userId, format, Array.isArray(data) ? data.length : Object.values(data).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0));

    if (format === 'csv') {
      const csv = convertToCSV(Array.isArray(data) ? data : flattenForCSV(data));
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON format
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('[Export] Error:', error);
    return NextResponse.json({ error: 'Export failed', details: error.message }, { status: 500 });
  }
}

function convertToCSV(data) {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function flattenForCSV(data) {
  const result = [];
  for (const [key, items] of Object.entries(data)) {
    if (Array.isArray(items)) {
      items.forEach(item => result.push({ _collection: key, ...item }));
    }
  }
  return result;
}
