import { NextResponse } from 'next/server';
import { orchestrator } from '../../../lib/orchestrator.js';
import { getUserProfile, insertApplication, insertAgentLog } from '../../../lib/mongodb.js';
import { deduplication } from '../../../lib/deduplication.js';
import { auditTrail } from '../../../lib/audit-trail.js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auto-apply
 *
 * Launches a Playwright workflow for a specific target.
 * Includes smart deduplication, audit trail, and webhook notifications.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { profileId, targetUrl, targetType, position, applicationId } = body;

    if (!targetUrl || !profileId || !targetType) {
      return NextResponse.json(
        { error: 'Missing required parameters: profileId, targetUrl, targetType' },
        { status: 400 }
      );
    }

    // Deduplication check
    const dupCheck = await deduplication.checkDuplicate({
      url: targetUrl,
      title: position,
      type: targetType,
    }, profileId);

    if (dupCheck.isDuplicate) {
      await auditTrail.log({
        category: 'application', action: 'duplicated',
        userId: profileId, targetType: 'application',
        targetId: applicationId || 'unknown',
        details: { reason: dupCheck.reason, url: targetUrl, confidence: dupCheck.confidence },
      });

      return NextResponse.json({
        success: false,
        duplicate: true,
        reason: dupCheck.reason,
        confidence: dupCheck.confidence,
        existingApp: dupCheck.existingApp,
      }, { status: 409 });
    }

    console.log(`[Auto-Apply] Target: ${targetType} | Position: ${position || 'N/A'} | URL: ${targetUrl}`);

    // Audit trail
    await auditTrail.autoApplied(profileId, {
      _id: applicationId || `temp-${Date.now()}`,
      title: position,
      url: targetUrl,
    }, null);

    // Offload application logic to the AI Orchestrator
    const result = await orchestrator.dispatchApply({
      userId: profileId,
      type: targetType,
      targetUrl,
      customData: { position, applicationId },
    });

    return NextResponse.json({
      success: true,
      message: result.status === 'deduplicated'
        ? `Duplicate detected: ${result.reason}`
        : `Auto-apply pipeline triggered for ${targetType}`,
      queueId: result.jobId,
      status: result.status,
      deduplicated: result.status === 'deduplicated',
    });
  } catch (error) {
    console.error('Auto-apply API error:', error);
    await auditTrail.systemError(error, 'auto-apply');
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
