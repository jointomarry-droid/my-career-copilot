import { NextResponse } from 'next/server';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'on',
};

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;
const API_RATE_LIMIT_MAX = 30;
const SUSPICIOUS_IPS = new Map();
const BLOCKED_PATTERNS = [
  /\.\.\//g,
  /<script[\s>]/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /union\s+select/gi,
  /drop\s+table/gi,
  /insert\s+into/gi,
  /delete\s+from/gi,
  /exec\(/gi,
  /eval\(/gi,
  /document\.cookie/gi,
  /window\.location/gi,
  /\$\{.*\}/g,
  /`.*`/g,
];

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return '127.0.0.1';
}

function checkRateLimit(ip, isApi) {
  const now = Date.now();
  const key = `${ip}:${isApi ? 'api' : 'page'}`;
  const limit = isApi ? API_RATE_LIMIT_MAX : RATE_LIMIT_MAX;

  if (!RATE_LIMIT_MAP.has(key)) {
    RATE_LIMIT_MAP.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  const record = RATE_LIMIT_MAP.get(key);
  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    RATE_LIMIT_MAP.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  record.count++;
  if (record.count > limit) {
    const suspiciousCount = SUSPICIOUS_IPS.get(ip) || 0;
    SUSPICIOUS_IPS.set(ip, suspiciousCount + 1);
    return { allowed: false, remaining: 0, retryAfter: RATE_LIMIT_WINDOW - (now - record.windowStart) };
  }

  return { allowed: true, remaining: limit - record.count };
}

function detectSuspiciousActivity(request, pathname) {
  const threats = [];
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url) || pattern.test(pathname)) {
      threats.push({ type: 'pattern_match', pattern: pattern.toString() });
    }
  }

  if (userAgent.toLowerCase().includes('sqlmap') || userAgent.toLowerCase().includes('nikto') || userAgent.toLowerCase().includes('nessus')) {
    threats.push({ type: 'scanner_detected', userAgent });
  }

  if (pathname.includes('..') || pathname.includes('%2e%2e')) {
    threats.push({ type: 'path_traversal', path: pathname });
  }

  return threats;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const isApi = pathname.startsWith('/api/');
  const isStatic = pathname.startsWith('/_next/') || pathname.startsWith('/favicon') || pathname.includes('.');

  if (isStatic) {
    const response = NextResponse.next();
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const threats = detectSuspiciousActivity(request, pathname);
  if (threats.length > 0) {
    console.error(`[SECURITY] Threats detected from ${ip}:`, threats);
    if (threats.some(t => t.type === 'scanner_detected')) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const rateLimit = checkRateLimit(ip, isApi);
  if (!rateLimit.allowed) {
    console.warn(`[SECURITY] Rate limit exceeded for ${ip}`);
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(rateLimit.retryAfter / 1000).toString(),
        'X-RateLimit-Limit': (isApi ? API_RATE_LIMIT_MAX : RATE_LIMIT_MAX).toString(),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  const response = NextResponse.next();

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

  if (isApi) {
    const origin = request.headers.get('origin');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
    if (origin && !allowedOrigins.includes(origin)) {
      console.warn(`[SECURITY] CORS violation from ${ip}: origin ${origin}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
    response.headers.set('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  if (pathname.startsWith('/api/')) {
    const contentType = request.headers.get('content-type');
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      if (contentType && contentType.includes('application/json')) {
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 1024 * 1024) {
          return new NextResponse('Payload Too Large', { status: 413 });
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
