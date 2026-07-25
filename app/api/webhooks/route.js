import { NextResponse } from 'next/server';
import { webhooks } from '../../../lib/webhooks.js';
import { auditTrail } from '../../../lib/audit-trail.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/webhooks
 * Get webhook configuration status
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: webhooks.getConfig(),
  });
}

/**
 * POST /api/webhooks
 * Send a test webhook
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type = 'test', details = {} } = body;

    const event = {
      type: type.startsWith('webhook.') ? type : `webhook.${type}`,
      details: {
        title: details.title || 'Test Webhook',
        institution: details.institution || 'AI Career Copilot',
        country: details.country || 'Global',
        ...details,
      },
      metadata: { source: 'api' },
    };

    const results = await webhooks.notify(event);

    await auditTrail.log({
      category: 'notification',
      action: 'sent',
      targetType: 'webhook',
      targetId: type,
      details: { results },
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook sent',
      results,
    });
  } catch (error) {
    console.error('[Webhooks] Error:', error);
    return NextResponse.json({ error: 'Webhook failed', details: error.message }, { status: 500 });
  }
}
