import { NextResponse } from 'next/server';
import { getUserApplications, insertApplication, updateApplicationStatus, insertAgentLog } from '../../../lib/mongodb.js';
import { auditTrail } from '../../../lib/audit-trail.js';
import { deduplication } from '../../../lib/deduplication.js';

/**
 * GET /api/applications
 * Returns all applications for the user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    let apps = await getUserApplications(userId);

    if (status) apps = apps.filter(a => a.status === status);
    if (type) apps = apps.filter(a => a.type === type);
    apps = apps.slice(0, limit);

    return NextResponse.json({ success: true, data: apps, count: apps.length });
  } catch (error) {
    console.error('[Applications API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications', details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/applications
 * Create a new application entry with deduplication
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'usr-fiaz-001', title, institution, type, country, url, matchScore, agent } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'title and type are required' }, { status: 400 });
    }

    // Deduplication check
    const dupCheck = await deduplication.checkDuplicate({ url, title, type }, userId);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({
        success: false,
        duplicate: true,
        reason: dupCheck.reason,
        existingApp: dupCheck.existingApp,
      }, { status: 409 });
    }

    const app = await insertApplication({
      userId,
      title,
      institution: institution || '',
      type,
      country: country || '',
      status: 'Queued',
      progress: 0,
      matchScore: matchScore || 0,
      agent: agent || 'Manual',
      url: url || '',
      date: new Date().toISOString().split('T')[0],
    });

    await auditTrail.applicationCreated(userId, app);

    await insertAgentLog({
      type: 'application',
      userId,
      status: 'created',
      msg: `New ${type} application created: ${title}`,
    });

    return NextResponse.json({ success: true, data: app }, { status: 201 });
  } catch (error) {
    console.error('[Applications API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create application', details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/applications
 * Update application status or trigger auto-apply
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { applicationId, status, progress, action } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
    }

    if (action === 'auto-apply') {
      const { orchestrator } = await import('../../../lib/orchestrator.js');
      const { getUserProfile } = await import('../../../lib/mongodb.js');

      const profile = await getUserProfile('usr-fiaz-001');
      if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

      const result = await orchestrator.dispatchApply({
        userId: profile._id,
        type: body.targetType || 'job',
        targetUrl: body.targetUrl || '',
        customData: { position: body.title, applicationId },
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (status) {
      const updated = await updateApplicationStatus(applicationId, status, progress);
      await auditTrail.applicationSubmitted('usr-fiaz-001', { _id: applicationId, title: body.title || '' });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'status or action is required' }, { status: 400 });
  } catch (error) {
    console.error('[Applications API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update application', details: error.message }, { status: 500 });
  }
}
