import { NextResponse } from 'next/server';
import { orchestrator } from '../../../lib/orchestrator.js';
import { statusChecker } from '../../../lib/status-checker.js';

export async function GET() {
  try {
    const results = statusChecker.getAllResults(50);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('[Status Check API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { applicationIds } = body;

    let results;
    if (applicationIds && applicationIds.length > 0) {
      const { getApplications } = await import('../../../lib/mongodb.js');
      const apps = await getApplications({ _id: { $in: applicationIds } });
      results = await statusChecker.checkBatch(apps, 2);
    } else {
      results = await orchestrator.checkApplicationStatuses();
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('[Status Check API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}