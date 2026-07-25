/**
 * Audit Trail System
 *
 * Tracks every significant action in the system with full context.
 * Provides compliance-grade logging for SaaS operations.
 *
 * Events tracked:
 *   - application.created / updated / submitted / failed
 *   - discovery.found / applied / ignored
 *   - campaign.created / paused / resumed / executed
 *   - profile.updated / resume.uploaded
 *   - agent.launched / completed / errored
 *   - notification.sent / failed
 *   - export.requested
 *   - auth.login / logout
 */

import { insertAgentLog } from './mongodb.js';

const AUDIT_COLLECTION = 'audit_trail';

const EVENT_CATEGORIES = {
  application: ['created', 'updated', 'submitted', 'failed', 'auto_applied', 'duplicated'],
  discovery: ['found', 'applied', 'ignored', 'shortlisted', 'sweep_started', 'sweep_completed'],
  campaign: ['created', 'paused', 'resumed', 'executed', 'completed', 'failed'],
  profile: ['updated', 'resume_uploaded', 'resume_parsed', 'cover_letter_generated'],
  agent: ['launched', 'completed', 'errored', 'timeout'],
  notification: ['sent', 'queued', 'failed', 'preferences_updated'],
  export: ['requested', 'completed', 'failed'],
  system: ['health_check', 'scheduler_started', 'scheduler_stopped', 'error'],
};

class AuditTrail {
  constructor() {
    this.buffer = [];
    this.flushInterval = null;
  }

  /**
   * Log an audit event
   */
  async log(event) {
    const entry = {
      _id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: event.category || 'system',
      action: event.action || 'unknown',
      userId: event.userId || 'usr-fiaz-001',
      targetType: event.targetType || '',
      targetId: event.targetId || '',
      details: event.details || {},
      metadata: {
        ip: event.ip || '',
        userAgent: event.userAgent || '',
        source: event.source || 'api',
        ...event.metadata,
      },
      severity: event.severity || 'info',
    };

    // Validate category
    if (EVENT_CATEGORIES[entry.category] && !EVENT_CATEGORIES[entry.category].includes(entry.action)) {
      console.warn(`[Audit] Unknown action "${entry.action}" for category "${entry.category}"`);
    }

    // Store in MongoDB/memory
    try {
      await insertAgentLog({
        ...entry,
        type: 'audit',
        msg: `[AUDIT] ${entry.category}.${entry.action} — ${entry.targetType}:${entry.targetId}`,
      });
    } catch (err) {
      console.error('[Audit] Failed to persist:', err.message);
    }

    // Console output for development
    const severityIcon = { info: '📋', warning: '⚠️', error: '🔴', critical: '🚨' };
    console.log(`${severityIcon[entry.severity] || '📋'} [Audit] ${entry.category}.${entry.action} | ${entry.targetType}:${entry.targetId} | ${entry.userId}`);

    return entry;
  }

  /**
   * Convenience methods for common events
   */
  async applicationCreated(userId, app) {
    return this.log({
      category: 'application', action: 'created', userId,
      targetType: 'application', targetId: app._id,
      details: { title: app.title, type: app.type, country: app.country },
    });
  }

  async applicationSubmitted(userId, app) {
    return this.log({
      category: 'application', action: 'submitted', userId,
      targetType: 'application', targetId: app._id,
      details: { title: app.title, agent: app.agent },
    });
  }

  async applicationFailed(userId, app, error) {
    return this.log({
      category: 'application', action: 'failed', userId, severity: 'error',
      targetType: 'application', targetId: app._id,
      details: { title: app.title, error: error.message || error },
    });
  }

  async autoApplied(userId, app, jobId) {
    return this.log({
      category: 'application', action: 'auto_applied', userId,
      targetType: 'application', targetId: app._id,
      details: { title: app.title, jobId, url: app.url },
    });
  }

  async discoveryFound(userId, discovery) {
    return this.log({
      category: 'discovery', action: 'found', userId,
      targetType: 'discovery', targetId: discovery._id,
      details: { title: discovery.title, source: discovery.source, country: discovery.country },
    });
  }

  async campaignExecuted(userId, campaign, appsProcessed) {
    return this.log({
      category: 'campaign', action: 'executed', userId,
      targetType: 'campaign', targetId: campaign._id,
      details: { name: campaign.name, appsProcessed, preset: campaign.preset },
    });
  }

  async agentLaunched(userId, agentName, targetUrl) {
    return this.log({
      category: 'agent', action: 'launched', userId,
      targetType: 'agent', targetId: agentName,
      details: { url: targetUrl },
    });
  }

  async agentCompleted(userId, agentName, result) {
    return this.log({
      category: 'agent', action: 'completed', userId,
      targetType: 'agent', targetId: agentName,
      details: { fieldsProcessed: result.fieldsProcessed, success: result.success },
    });
  }

  async profileUpdated(userId, fields) {
    return this.log({
      category: 'profile', action: 'updated', userId,
      targetType: 'profile', targetId: userId,
      details: { fields: Object.keys(fields) },
    });
  }

  async exportRequested(userId, format, count) {
    return this.log({
      category: 'export', action: 'requested', userId,
      targetType: 'export', targetId: `${format}-${count}`,
      details: { format, recordCount: count },
    });
  }

  async systemError(error, context) {
    return this.log({
      category: 'system', action: 'error', severity: 'error',
      targetType: 'system', targetId: 'error',
      details: { message: error.message, stack: error.stack?.substring(0, 500), context },
    });
  }

  /**
   * Query audit trail
   */
  async getAuditLog(filters = {}) {
    const { userId, category, action, startDate, endDate, limit = 100 } = filters;

    // Query from agent_logs where type = 'audit'
    const { getRecentAgentLogs } = await import('./mongodb.js');
    const allLogs = await getRecentAgentLogs(1000);
    let auditLogs = allLogs.filter(l => l.type === 'audit');

    if (userId) auditLogs = auditLogs.filter(l => l.userId === userId);
    if (category) auditLogs = auditLogs.filter(l => l.category === category);
    if (action) auditLogs = auditLogs.filter(l => l.action === action);
    if (startDate) auditLogs = auditLogs.filter(l => l.timestamp >= startDate);
    if (endDate) auditLogs = auditLogs.filter(l => l.timestamp <= endDate);

    return auditLogs.slice(0, limit);
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(userId) {
    const logs = await this.getAuditLog({ userId, limit: 1000 });

    const byCategory = {};
    const byAction = {};
    const bySeverity = { info: 0, warning: 0, error: 0, critical: 0 };
    const timeline = {};

    for (const log of logs) {
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
      const actionKey = `${log.category}.${log.action}`;
      byAction[actionKey] = (byAction[actionKey] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

      const date = log.timestamp?.split('T')[0];
      if (date) timeline[date] = (timeline[date] || 0) + 1;
    }

    return { total: logs.length, byCategory, byAction, bySeverity, timeline };
  }
}

export const auditTrail = new AuditTrail();
export default auditTrail;
