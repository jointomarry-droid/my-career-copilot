import { NextResponse } from 'next/server';
import { auditTrail } from '../../../lib/audit-trail.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audit
 * Get audit trail logs
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';
    const category = searchParams.get('category');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const auditStats = await auditTrail.getAuditStats(userId);
      return NextResponse.json({ success: true, data: auditStats });
    }

    const logs = await auditTrail.getAuditLog({ userId, category, action, limit });

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('[Audit] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit trail', details: error.message }, { status: 500 });
  }
}
