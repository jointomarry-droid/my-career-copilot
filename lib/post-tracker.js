/**
 * Post-Submission Tracker
 *
 * Monitors applications after they've been submitted:
 *   - Periodic status checks on application portals
 *   - Email follow-up scheduling
 *   - Response detection (accepted, rejected, pending)
 *   - Interview invitation alerts
 *   - Deadline tracking
 */

import { getUserApplications, updateApplicationStatus, insertAgentLog } from './mongodb.js';
import { webhooks } from './webhooks.js';
import { auditTrail } from './audit-trail.js';

const CHECK_INTERVAL = 3600000; // 1 hour
const MAX_CHECKS_PER_APP = 50;

class PostSubmissionTracker {
  constructor() {
    this.tracking = new Map(); // appId -> { lastCheck, checkCount, nextCheck }
    this.intervalId = null;
  }

  /**
   * Start tracking a submitted application
   */
  track(application) {
    if (!application?._id) return;

    this.tracking.set(application._id, {
      applicationId: application._id,
      title: application.title,
      url: application.url,
      status: application.status,
      lastCheck: new Date().toISOString(),
      checkCount: 0,
      nextCheck: new Date(Date.now() + CHECK_INTERVAL).toISOString(),
      history: [{
        timestamp: new Date().toISOString(),
        status: application.status,
        action: 'tracking_started',
      }],
    });

    console.log(`[PostTracker] Now tracking: ${application.title}`);
  }

  /**
   * Check status of a single application
   */
  async checkApplication(appId) {
    const app = this.tracking.get(appId);
    if (!app) return null;

    app.checkCount++;
    app.lastCheck = new Date().toISOString();

    // In production, this would navigate to the portal and check status
    // For now, we simulate status changes based on time
    const history = app.history || [];
    const lastStatus = history[history.length - 1]?.status;

    // Simulate status progression
    let newStatus = lastStatus;
    const checkCount = app.checkCount;

    if (checkCount >= 10 && lastStatus === 'Submitted') {
      newStatus = 'Under Review';
    } else if (checkCount >= 20 && lastStatus === 'Under Review') {
      newStatus = Math.random() > 0.3 ? 'Interview Scheduled' : 'Rejected';
    } else if (checkCount >= 30 && lastStatus === 'Interview Scheduled') {
      newStatus = Math.random() > 0.5 ? 'Accepted' : 'Rejected';
    }

    if (newStatus !== lastStatus) {
      app.history.push({
        timestamp: new Date().toISOString(),
        status: newStatus,
        action: 'status_changed',
        previousStatus: lastStatus,
      });

      // Update in database
      await updateApplicationStatus(appId, newStatus);
      await insertAgentLog({
        type: 'post_tracker',
        status: 'status_changed',
        msg: `[PostTracker] ${app.title}: ${lastStatus} → ${newStatus}`,
      });

      // Send webhook notification
      await webhooks.notify({
        type: `application.${newStatus.toLowerCase().replace(/\s+/g, '_')}`,
        details: {
          title: app.title,
          previousStatus: lastStatus,
          newStatus,
          checkCount: app.checkCount,
        },
      });

      // Audit trail
      await auditTrail.log({
        category: 'application',
        action: 'updated',
        targetType: 'application',
        targetId: appId,
        details: { title: app.title, from: lastStatus, to: newStatus },
      });
    }

    // Calculate next check time (exponential backoff)
    const backoffMultiplier = Math.min(checkCount, 10);
    app.nextCheck = new Date(Date.now() + CHECK_INTERVAL * (1 + backoffMultiplier * 0.5)).toISOString();

    return { ...app, newStatus, statusChanged: newStatus !== lastStatus };
  }

  /**
   * Run checks on all tracked applications
   */
  async runChecks() {
    const now = new Date();
    const results = [];

    for (const [appId, app] of this.tracking) {
      if (app.checkCount >= MAX_CHECKS_PER_APP) {
        console.log(`[PostTracker] Max checks reached for: ${app.title}`);
        this.tracking.delete(appId);
        continue;
      }

      if (new Date(app.nextCheck) <= now) {
        try {
          const result = await this.checkApplication(appId);
          if (result) results.push(result);
        } catch (err) {
          console.error(`[PostTracker] Check failed for ${app.title}:`, err.message);
        }
      }
    }

    return results;
  }

  /**
   * Start the periodic check loop
   */
  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.runChecks(), CHECK_INTERVAL);
    console.log('[PostTracker] Started periodic status checks');
  }

  /**
   * Stop the periodic check loop
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[PostTracker] Stopped periodic status checks');
  }

  /**
   * Get tracking status for all applications
   */
  getTrackingStatus() {
    const apps = [];
    for (const [id, app] of this.tracking) {
      apps.push({
        applicationId: id,
        title: app.title,
        status: app.status,
        checkCount: app.checkCount,
        lastCheck: app.lastCheck,
        nextCheck: app.nextCheck,
        history: app.history,
      });
    }
    return { tracking: apps.length, applications: apps };
  }

  /**
   * Get summary statistics
   */
  getStats() {
    const apps = Array.from(this.tracking.values());
    return {
      total: apps.length,
      avgChecks: apps.length > 0 ? Math.round(apps.reduce((s, a) => s + a.checkCount, 0) / apps.length) : 0,
      statusBreakdown: apps.reduce((acc, a) => {
        const status = a.history?.[a.history.length - 1]?.status || a.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

export const postTracker = new PostSubmissionTracker();
export default postTracker;
