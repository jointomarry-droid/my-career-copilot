import { NextResponse } from 'next/server';
import { getHealthStatus } from '../../../lib/health-check.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
