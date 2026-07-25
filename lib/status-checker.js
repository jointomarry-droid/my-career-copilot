/**
 * Real Portal Status Checker
 *
 * Replaces the simulated post-tracker with actual portal scraping.
 * Uses Playwright to check application status on real portals.
 *
 * Features:
 *   - Navigates to application portal URLs
 *   - Detects status page changes
 *   - Parses confirmation messages
 *   - Identifies rejection/acceptance notices
 *   - Tracks interview invitations
 */

import { BrowserPool } from './browser-pool.js';
import { getUserProfile, updateApplicationStatus, insertAgentLog } from './mongodb.js';
import { webhooks } from './webhooks.js';
import { auditTrail } from './audit-trail.js';

const STATUS_PATTERNS = {
  confirmed: [
    'thank you for applying',
    'application received',
    'application submitted',
    'successfully submitted',
    'confirmation',
    'we received your application',
  ],
  under_review: [
    'under review',
    'being reviewed',
    'reviewing your application',
    'in progress',
    'your application is being processed',
  ],
  interview: [
    'interview',
    'interview scheduled',
    'phone screen',
    'assessment',
    'next steps',
    'we would like to invite you',
  ],
  accepted: [
    'congratulations',
    'accepted',
    'offer',
    'welcome to',
    'you have been selected',
    'job offer',
  ],
  rejected: [
    'unfortunately',
    'not selected',
    'regret to inform',
    'we have decided',
    'not moving forward',
    'position has been filled',
  ],
};

class PortalStatusChecker {
  constructor() {
    this.checkResults = new Map();
  }

  /**
   * Check the status of a single application by visiting its portal
   */
  async checkStatus(application) {
    console.log(`[StatusChecker] Checking: ${application.title}`);

    const pool = BrowserPool.getInstance();
    let browser, context, page, poolEntry;

    try {
      const acquired = await pool.acquire();
      browser = acquired.browser;
      context = acquired.context;
      poolEntry = acquired.poolEntry;
      page = await context.newPage();

      await page.goto(application.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for content to load
      await page.waitForTimeout(3000);

      // Get page content
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          body: document.body?.innerText?.substring(0, 5000) || '',
          url: window.location.href,
        };
      });

      // Analyze content for status indicators
      const status = this.analyzePageContent(pageContent);

      const result = {
        applicationId: application._id,
        title: application.title,
        portalUrl: application.url,
        checkedAt: new Date().toISOString(),
        pageTitle: pageContent.title,
        detectedStatus: status.detected,
        confidence: status.confidence,
        matchedPatterns: status.matchedPatterns,
        pageSnippet: pageContent.body.substring(0, 300),
      };

      this.checkResults.set(application._id, result);

      // Update application status if changed
      if (status.detected && status.confidence > 0.5) {
        const newStatus = this.mapDetectedStatus(status.detected);
        if (newStatus && newStatus !== application.status) {
          await updateApplicationStatus(application._id, newStatus);

          await insertAgentLog({
            type: 'status_checker',
            status: 'status_changed',
            msg: `[StatusChecker] ${application.title}: ${application.status} → ${newStatus}`,
          });

          await webhooks.notify({
            type: `application.${newStatus.toLowerCase().replace(/\s+/g, '_')}`,
            details: {
              title: application.title,
              previousStatus: application.status,
              newStatus,
              portalUrl: application.url,
            },
          });

          await auditTrail.log({
            category: 'application',
            action: 'updated',
            targetType: 'application',
            targetId: application._id,
            details: { title: application.title, from: application.status, to: newStatus, source: 'portal_check' },
          });

          result.statusUpdated = true;
          result.previousStatus = application.status;
          result.newStatus = newStatus;
        }
      }

      console.log(`[StatusChecker] Result: ${status.detected || 'no change'} (${Math.round(status.confidence * 100)}% confidence)`);
      return result;

    } catch (error) {
      console.warn(`[StatusChecker] Check failed for ${application.title}:`, error.message);
      return {
        applicationId: application._id,
        title: application.title,
        checkedAt: new Date().toISOString(),
        error: error.message,
        detectedStatus: null,
        confidence: 0,
      };
    } finally {
      if (poolEntry) pool.release(poolEntry);
    }
  }

  /**
   * Analyze page content for status patterns
   */
  analyzePageContent(pageContent) {
    const text = pageContent.body.toLowerCase();
    const results = [];

    for (const [status, patterns] of Object.entries(STATUS_PATTERNS)) {
      const matched = patterns.filter(pattern => text.includes(pattern));
      if (matched.length > 0) {
        results.push({
          status,
          confidence: Math.min(1, matched.length * 0.3 + 0.2),
          matchedPatterns: matched,
        });
      }
    }

    if (results.length === 0) {
      return { detected: null, confidence: 0, matchedPatterns: [] };
    }

    // Return highest confidence match
    results.sort((a, b) => b.confidence - a.confidence);
    return results[0];
  }

  /**
   * Map detected status to application status
   */
  mapDetectedStatus(detected) {
    const mapping = {
      confirmed: 'Submitted',
      under_review: 'Under Review',
      interview: 'Interview Scheduled',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return mapping[detected] || null;
  }

  /**
   * Batch check multiple applications
   */
  async checkBatch(applications, concurrency = 2) {
    const results = [];
    const chunks = [];
    for (let i = 0; i < applications.length; i += concurrency) {
      chunks.push(applications.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(app => this.checkStatus(app))
      );
      results.push(...chunkResults.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }));
    }

    return results;
  }

  /**
   * Get check results for an application
   */
  getResult(applicationId) {
    return this.checkResults.get(applicationId) || null;
  }

  /**
   * Get all recent check results
   */
  getAllResults(limit = 50) {
    return Array.from(this.checkResults.values())
      .sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt))
      .slice(0, limit);
  }
}

export const statusChecker = new PortalStatusChecker();
export default statusChecker;
