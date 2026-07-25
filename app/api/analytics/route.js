import { NextResponse } from 'next/server';
import { getApplicationStats } from '../../../lib/mongodb.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics
 *
 * Returns comprehensive dashboard analytics:
 *   - Total applications, submitted, in-progress, failed
 *   - Success rate percentage
 *   - Average match score
 *   - Applications by type (Scholarship, Job, Work Permit)
 *   - Applications by country
 *   - Timeline data for charts
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';

    const stats = await getApplicationStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error.message },
      { status: 500 }
    );
  }
}
