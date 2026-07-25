import { NextResponse } from 'next/server';
import { getDiscoveries, updateDiscoveryStatus } from '../../../lib/mongodb.js';
import { DiscoveryEngine } from '../../../lib/discovery-engine.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/discoveries
 *
 * Returns discovered opportunities for a user.
 * Supports filtering by type and status.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';
    const limit = parseInt(searchParams.get('limit') || '50');

    const discoveries = await getDiscoveries(userId, limit);

    return NextResponse.json({
      success: true,
      data: discoveries,
      count: discoveries.length,
    });
  } catch (error) {
    console.error('[Discoveries] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discoveries', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discoveries
 *
 * Trigger a new discovery sweep.
 * Optionally save discovered opportunities.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'usr-fiaz-001', autoApply = false } = body;

    const engine = new DiscoveryEngine();
    const discoveries = await engine.discoverAll(userId);
    await engine.close();

    return NextResponse.json({
      success: true,
      message: `Discovery sweep complete. Found ${discoveries.length} opportunities.`,
      data: discoveries,
      count: discoveries.length,
    });
  } catch (error) {
    console.error('[Discoveries] Sweep error:', error);
    return NextResponse.json(
      { error: 'Discovery sweep failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/discoveries
 *
 * Update a discovery's status (e.g., mark as applied, ignored)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { discoveryId, status } = body;

    if (!discoveryId || !status) {
      return NextResponse.json(
        { error: 'Missing discoveryId or status' },
        { status: 400 }
      );
    }

    const updated = await updateDiscoveryStatus(discoveryId, status);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[Discoveries] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update discovery', details: error.message },
      { status: 500 }
    );
  }
}
