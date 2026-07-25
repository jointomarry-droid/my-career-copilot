const LOG_BUFFER = [];
const MAX_BUFFER_SIZE = 1000;
const SECURITY_EVENTS = [];

function createLogEntry(event, details, severity = 'info', ip = 'unknown') {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    event,
    details,
    severity,
    ip,
    userAgent: details?.userAgent || 'unknown',
    path: details?.path || 'unknown',
  };
}

function flushBuffer() {
  if (LOG_BUFFER.length === 0) return;
  const logs = [...LOG_BUFFER];
  LOG_BUFFER.length = 0;
  return logs;
}

export const SecurityLogger = {
  logAuthAttempt(email, success, ip, reason = '') {
    const entry = createLogEntry('AUTH_ATTEMPT', { email, success, reason }, success ? 'info' : 'warning', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.log(`[SECURITY-AUTH] ${success ? 'SUCCESS' : 'FAILED'} - ${email} from ${ip} ${reason ? `(${reason})` : ''}`);
    return entry;
  },

  logRateLimit(ip, path, limit) {
    const entry = createLogEntry('RATE_LIMIT_EXCEEDED', { path, limit }, 'warning', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.warn(`[SECURITY-RATE] Rate limit exceeded: ${ip} on ${path}`);
    return entry;
  },

  logSuspiciousActivity(ip, path, threats) {
    const entry = createLogEntry('SUSPICIOUS_ACTIVITY', { path, threats }, 'critical', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.error(`[SECURITY-THREAT] Suspicious activity from ${ip} on ${path}:`, threats);
    return entry;
  },

  logInputValidation(path, field, error, ip) {
    const entry = createLogEntry('INPUT_VALIDATION_FAILED', { path, field, error }, 'warning', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.warn(`[SECURITY-VALIDATION] Input rejected: ${field} on ${path} from ${ip}`);
    return entry;
  },

  logUnauthorizedAccess(path, userId, requiredRole, ip) {
    const entry = createLogEntry('UNAUTHORIZED_ACCESS', { path, userId, requiredRole }, 'critical', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.error(`[SECURITY-AUTHZ] Unauthorized access: ${userId} tried ${path} (needs ${requiredRole}) from ${ip}`);
    return entry;
  },

  logCORSViolation(origin, ip) {
    const entry = createLogEntry('CORS_VIOLATION', { origin }, 'warning', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.warn(`[SECURITY-CORS] CORS violation from ${ip}: origin ${origin}`);
    return entry;
  },

  logSQLInjectionAttempt(path, payload, ip) {
    const entry = createLogEntry('SQL_INJECTION_ATTEMPT', { path, payload }, 'critical', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.error(`[SECURITY-SQLI] SQL injection attempt from ${ip} on ${path}`);
    return entry;
  },

  logXSSAttempt(path, payload, ip) {
    const entry = createLogEntry('XSS_ATTEMPT', { path, payload }, 'critical', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.error(`[SECURITY-XSS] XSS attempt from ${ip} on ${path}`);
    return entry;
  },

  logPathTraversal(path, ip) {
    const entry = createLogEntry('PATH_TRAVERSAL', { path }, 'critical', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.error(`[SECURITY-PATH] Path traversal attempt from ${ip}: ${path}`);
    return entry;
  },

  logSecurityScan(results, ip) {
    const entry = createLogEntry('SECURITY_SCAN', { results }, 'info', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    return entry;
  },

  logDependencyVulnerability(pkg, severity, ip) {
    const entry = createLogEntry('DEPENDENCY_VULNERABILITY', { package: pkg, severity }, 'warning', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    console.warn(`[SECURITY-DEP] Vulnerability in ${pkg}: ${severity}`);
    return entry;
  },

  logFileUpload(filename, mimeType, size, ip) {
    const entry = createLogEvent('FILE_UPLOAD', { filename, mimeType, size }, 'info', ip);
    SECURITY_EVENTS.push(entry);
    if (SECURITY_EVENTS.length > MAX_BUFFER_SIZE) SECURITY_EVENTS.shift();
    return entry;
  },

  getRecentEvents(limit = 50) {
    return SECURITY_EVENTS.slice(-limit).reverse();
  },

  getEventsBySeverity(severity) {
    return SECURITY_EVENTS.filter(e => e.severity === severity);
  },

  getEventsByIP(ip) {
    return SECURITY_EVENTS.filter(e => e.ip === ip);
  },

  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const recentEvents = SECURITY_EVENTS.filter(e => new Date(e.timestamp).getTime() > oneHourAgo);

    return {
      totalEvents: SECURITY_EVENTS.length,
      recentEvents: recentEvents.length,
      criticalCount: recentEvents.filter(e => e.severity === 'critical').length,
      warningCount: recentEvents.filter(e => e.severity === 'warning').length,
      infoCount: recentEvents.filter(e => e.severity === 'info').length,
      topThreats: getTopThreats(recentEvents),
      topIPs: getTopIPs(recentEvents),
    };
  },

  flush() {
    return flushBuffer();
  },

  clear() {
    SECURITY_EVENTS.length = 0;
  }
};

function getTopThreats(events) {
  const threatCounts = {};
  events.filter(e => e.severity === 'critical').forEach(e => {
    const key = e.event;
    threatCounts[key] = (threatCounts[key] || 0) + 1;
  });
  return Object.entries(threatCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([event, count]) => ({ event, count }));
}

function getTopIPs(events) {
  const ipCounts = {};
  events.forEach(e => {
    ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1;
  });
  return Object.entries(ipCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));
}

export default SecurityLogger;
