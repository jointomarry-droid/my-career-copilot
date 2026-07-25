import { NextResponse } from 'next/server';
import { notifyApplicationStatus, notifyNewDiscoveries, notifyDailyDigest } from '../../../lib/notifier.js';
import { getUserProfile, getApplicationStats } from '../../../lib/mongodb.js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications
 *
 * Send notification emails.
 *
 * Actions:
 *   - status_change: Notify about application status change
 *   - new_discoveries: Notify about discovered opportunities
 *   - daily_digest: Send daily summary digest
 *   - test: Send a test email
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action,
      userId = 'usr-fiaz-001',
      application,
      oldStatus,
      newStatus,
      discoveries = [],
      email: customEmail,
    } = body;

    const profile = await getUserProfile(userId);
    const userEmail = customEmail || profile?.email || process.env.NOTIFICATION_EMAIL;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No email address configured for notifications' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'status_change':
        if (!application || !newStatus) {
          return NextResponse.json(
            { error: 'Missing application or newStatus' },
            { status: 400 }
          );
        }
        result = await notifyApplicationStatus(userEmail, application, oldStatus, newStatus);
        break;

      case 'new_discoveries':
        result = await notifyNewDiscoveries(userEmail, discoveries);
        break;

      case 'daily_digest':
        const stats = await getApplicationStats(userId);
        result = await notifyDailyDigest(userEmail, stats, []);
        break;

      case 'test':
        result = await notifyApplicationStatus(userEmail, {
          title: 'Test Application',
          institution: 'Test Institution',
          country: 'Test Country',
          type: 'Test',
          agent: 'Test Agent',
          progress: 50,
          matchScore: 85,
        }, 'Queued', 'In Progress');
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent: ${action}`,
      data: result,
    });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications
 *
 * Check notification configuration status.
 */
export async function GET() {
  const configured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  return NextResponse.json({
    success: true,
    configured,
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || '587',
    notificationEmail: process.env.NOTIFICATION_EMAIL || 'Not configured',
  });
}
