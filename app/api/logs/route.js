import { NextResponse } from 'next/server';
import { getRecentAgentLogs } from '../../../lib/mongodb.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/logs
 * Returns latest telemetry logs from the agents.
 */
export async function GET(request) {
  try {
    const logs = await getRecentAgentLogs(50);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
