/**
 * Health Check System
 *
 * Monitors system health across all components:
 *   - Database connectivity
 *   - Browser pool status
 *   - Scheduler status
 *   - LLM API availability
 *   - SMTP availability
 *   - Memory usage
 *   - Uptime
 */

import mongodb from './mongodb.js';
import { BrowserPool } from './browser-pool.js';
import { getSchedulerStatus } from './scheduler.js';

const startTime = Date.now();

export async function getHealthStatus() {
  const checks = {};

  // Database
  try {
    const apps = await mongodb.getUserApplications('usr-fiaz-001');
    checks.database = {
      status: 'healthy',
      type: apps.length > 0 ? 'mongodb' : 'in-memory',
      records: apps.length,
      message: `Connected — ${apps.length} applications loaded`,
    };
  } catch (err) {
    checks.database = { status: 'unhealthy', error: err.message };
  }

  // Browser Pool
  try {
    const pool = BrowserPool.getInstance();
    const stats = pool.getStats();
    checks.browserPool = {
      status: 'healthy',
      ...stats,
      message: `${stats.available} available, ${stats.inUse} in use, ${stats.pending} pending`,
    };
  } catch (err) {
    checks.browserPool = { status: 'unhealthy', error: err.message };
  }

  // Scheduler
  try {
    const status = getSchedulerStatus();
    checks.scheduler = {
      status: status.running ? 'healthy' : 'idle',
      ...status,
      message: status.running ? `${status.activeJobs} active jobs` : 'Not running',
    };
  } catch (err) {
    checks.scheduler = { status: 'unhealthy', error: err.message };
  }

  // LLM API
  const llmKey = process.env.LLM_API_KEY || '';
  checks.llmApi = {
    status: llmKey ? 'configured' : 'not-configured',
    configured: !!llmKey,
    model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
    message: llmKey ? 'API key configured' : 'No API key set — using mock responses',
  };

  // SMTP
  const smtpUser = process.env.SMTP_USER || '';
  checks.smtp = {
    status: smtpUser ? 'configured' : 'not-configured',
    configured: !!smtpUser,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    message: smtpUser ? 'SMTP configured' : 'No SMTP credentials — emails logged to console',
  };

  // Memory
  const memUsage = process.memoryUsage();
  checks.memory = {
    status: memUsage.heapUsed / memUsage.heapTotal < 0.85 ? 'healthy' : 'warning',
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    usagePercent: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
  };

  // Uptime
  checks.uptime = {
    status: 'healthy',
    seconds: Math.floor((Date.now() - startTime) / 1000),
    humanReadable: formatUptime(Date.now() - startTime),
  };

  // Overall status
  const statuses = Object.values(checks).map(c => c.status);
  const overallStatus = statuses.includes('unhealthy') ? 'unhealthy'
    : statuses.includes('degraded') ? 'degraded'
      : statuses.includes('warning') ? 'warning'
        : 'healthy';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
  };
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default { getHealthStatus };
