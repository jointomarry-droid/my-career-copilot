# Security Agent Skill

## Overview
The Security Agent provides continuous protection for the AI Career Copilot project, monitoring for threats, vulnerabilities, and suspicious activities both during development and in production.

## Core Capabilities

### 1. Real-Time Threat Detection
- XSS (Cross-Site Scripting) prevention
- SQL/NoSQL injection blocking
- Path traversal detection
- Command injection prevention
- CSRF protection
- SSRF mitigation

### 2. Rate Limiting
- API endpoint rate limiting (30 req/min)
- Authentication endpoint limiting (5 req/15min)
- Search endpoint limiting (20 req/min)
- Upload endpoint limiting (10 req/5min)
- Per-IP tracking and blocking

### 3. Input Validation
- Email format validation with threat scanning
- Password strength enforcement
- URL validation with protocol checks
- Phone number format validation
- UUID format validation
- Generic string/number validation with bounds

### 4. Security Headers
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### 5. Audit Logging
- Authentication attempts (success/failure)
- Rate limit violations
- Suspicious activity detection
- Input validation failures
- Unauthorized access attempts
- CORS violations
- SQL injection attempts
- XSS attempts
- Path traversal attempts

### 6. Dependency Security
- npm audit integration
- Vulnerability scanning
- Version pinning recommendations
- Unused package detection

## API Endpoints

### GET /api/security/scan
Returns comprehensive security scan results including:
- Overall security score (0-100)
- Category-specific scores
- Threat statistics
- Recent incidents
- Recommendations

### POST /api/security/scan
Perform specific security scans:
- `scan-headers`: Check security header configuration
- `scan-routes`: Verify route protection
- `scan-dependencies`: Check for vulnerable packages

## Integration Points

### Middleware (middleware.js)
- Route-level security headers
- Rate limiting enforcement
- Threat pattern detection
- CORS validation
- Request size limits

### Libraries
- `lib/rate-limiter.js`: Rate limiting logic
- `lib/validator.js`: Input validation schemas
- `lib/security-logger.js`: Audit logging

## Security Score Calculation

The security score (0-100) is calculated based on:
- Critical events: -10 points each
- Warnings (after 5): -2 points each
- Category scores weighted average

### Category Scores
- Authentication: 85/100
- API Security: 80/100
- Input Validation: 90/100
- Security Headers: 95/100
- Monitoring: 75/100
- Dependencies: 70/100

## Threat Patterns Blocked

### XSS Patterns
- `<script>` tags
- `javascript:` protocol
- Event handlers (onclick, onerror, etc.)
- `<iframe>`, `<object>`, `<embed>` tags

### SQL Injection Patterns
- `UNION SELECT`
- `DROP TABLE`
- `INSERT INTO`
- `DELETE FROM`
- `UPDATE SET`
- SQL comments (`--`, `/* */`)

### Path Traversal
- `../` sequences
- Encoded `%2e%2e`

### Command Injection
- Template literals with expressions
- `exec()` calls
- `eval()` calls

## Production Deployment

### Pre-Deploy Checklist
1. Run `npm audit` and fix critical vulnerabilities
2. Verify all security headers are configured
3. Test rate limiting on key endpoints
4. Verify CORS configuration
5. Check environment variable exposure
6. Run full security scan via dashboard

### Post-Deploy Monitoring
1. Monitor security dashboard for incidents
2. Review rate limit logs weekly
3. Run dependency audits monthly
4. Update security patterns quarterly

## Emergency Response

### If a Threat is Detected
1. Security Logger automatically records the event
2. Critical events trigger console.error logging
3. Repeated offenders are rate-limited
4. Scanner detection results in immediate 403

### If Vulnerability is Found
1. Run `npm audit` to identify affected packages
2. Check for available patches
3. If no patch, evaluate alternative packages
4. Document in security log
5. Deploy fix within 24 hours for critical issues

## Configuration

### Environment Variables
```
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
RATE_LIMIT_API=30
RATE_LIMIT_AUTH=5
RATE_LIMIT_SEARCH=20
```

### Customization
Edit `middleware.js` to:
- Add new threat patterns
- Adjust rate limits
- Modify security headers
- Add IP whitelisting/blacklisting
