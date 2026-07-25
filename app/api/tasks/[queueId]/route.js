import { NextResponse } from 'next/server';
import { orchestrator } from '../../../../lib/orchestrator.js';

/**
 * GET  /api/tasks/[queueId]  — Check task status from orchestrator
 * POST /api/tasks/[queueId]  — Cancel or update task
 */

export async function GET(request, { params }) {
  const { queueId } = params;

  const jobStatus = orchestrator.getJobStatus(queueId);

  if (!jobStatus) {
    return NextResponse.json({
      queueId,
      status: 'unknown',
      message: 'Task not found in active jobs. It may have completed or not been started.',
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    queueId,
    status: jobStatus.status,
    result: jobStatus.result || null,
    error: jobStatus.error || null,
    startTime: jobStatus.startTime,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(request, { params }) {
  const { queueId } = params;
  const body = await request.json().catch(() => ({}));

  if (body.action === 'cancel') {
    const job = orchestrator.getJobStatus(queueId);
    if (job && job.status === 'processing') {
      orchestrator.activeJobs.set(queueId, { ...job, status: 'cancelled' });
      return NextResponse.json({ success: true, message: 'Task cancellation requested', queueId });
    }
    return NextResponse.json({ success: false, message: 'Task not cancellable' }, { status: 400 });
  }

  return NextResponse.json({ success: true, queueId });
}
