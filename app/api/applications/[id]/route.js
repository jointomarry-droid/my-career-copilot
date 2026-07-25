import { NextResponse } from 'next/server';
import { getUserApplications, updateApplicationStatus, insertAgentLog } from '../../../../lib/mongodb.js';

/**
 * GET /api/applications/[id]
 * Get a single application by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const apps = await getUserApplications('usr-fiaz-001');
    const app = apps.find(a => a._id === id);

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: app });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id]
 * Update a specific application
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, progress } = body;

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const updated = await updateApplicationStatus(id, status, progress);

    await insertAgentLog({
      type: 'application',
      userId: 'usr-fiaz-001',
      status: 'updated',
      msg: `Application ${id} updated to ${status}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
