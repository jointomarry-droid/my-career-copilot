const DANGEROUS_PATTERNS = [
  { pattern: /<script[\s>]/gi, name: 'XSS_SCRIPT' },
  { pattern: /javascript:/gi, name: 'XSS_JAVASCRIPT' },
  { pattern: /on\w+\s*=/gi, name: 'XSS_EVENT_HANDLER' },
  { pattern: /union\s+select/gi, name: 'SQL_INJECTION_UNION' },
  { pattern: /drop\s+table/gi, name: 'SQL_INJECTION_DROP' },
  { pattern: /insert\s+into/gi, name: 'SQL_INJECTION_INSERT' },
  { pattern: /delete\s+from/gi, name: 'SQL_INJECTION_DELETE' },
  { pattern: /update\s+\w+\s+set/gi, name: 'SQL_INJECTION_UPDATE' },
  { pattern: /--\s*$/gm, name: 'SQL_COMMENT' },
  { pattern: /\/\*[\s\S]*?\*\//g, name: 'SQL_BLOCK_COMMENT' },
  { pattern: /;\s*drop/gi, name: 'SQL_SEMICOLON_DROP' },
  { pattern: /\.\.\//g, name: 'PATH_TRAVERSAL' },
  { pattern: /%2e%2e/gi, name: 'PATH_TRAVERSAL_ENCODED' },
  { pattern: /\$\{.*\}/g, name: 'TEMPLATE_INJECTION' },
  { pattern: /`[^`]*`/g, name: 'COMMAND_INJECTION' },
  { pattern: /exec\(/gi, name: 'CODE_EXECUTION' },
  { pattern: /eval\(/gi, name: 'CODE_EVAL' },
  { pattern: /document\.cookie/gi, name: 'COOKIE_THEFT' },
  { pattern: /window\.location\s*=/gi, name: 'REDIRECT_HIJACK' },
  { pattern: /<iframe/gi, name: 'IFRAME_INJECTION' },
  { pattern: /<object/gi, name: 'OBJECT_INJECTION' },
  { pattern: /<embed/gi, name: 'EMBED_INJECTION' },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function scanForThreats(input) {
  if (typeof input !== 'string') return [];
  const threats = [];
  for (const { pattern, name } of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(name);
    }
  }
  return threats;
}

function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, error: 'Email is required' };
  const trimmed = email.trim();
  if (trimmed.length > 254) return { valid: false, error: 'Email too long' };
  const threats = scanForThreats(trimmed);
  if (threats.length > 0) return { valid: false, error: 'Invalid email format', threats };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: 'Invalid email format' };
  return { valid: true, sanitized: trimmed.toLowerCase() };
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, error: 'Password is required' };
  const issues = [];
  if (password.length < 8) issues.push('Password must be at least 8 characters');
  if (password.length > 128) issues.push('Password too long');
  if (!/[A-Z]/.test(password)) issues.push('Must contain uppercase letter');
  if (!/[a-z]/.test(password)) issues.push('Must contain lowercase letter');
  if (!/[0-9]/.test(password)) issues.push('Must contain number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) issues.push('Must contain special character');
  const threats = scanForThreats(password);
  if (threats.length > 0) issues.push('Password contains suspicious patterns');
  return { valid: issues.length === 0, issues };
}

export function validateURL(url) {
  if (!url || typeof url !== 'string') return { valid: false, error: 'URL is required' };
  const threats = scanForThreats(url);
  if (threats.length > 0) return { valid: false, error: 'URL contains suspicious patterns', threats };
  if (!URL_REGEX.test(url)) return { valid: false, error: 'Invalid URL format' };
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs allowed' };
    }
    return { valid: true, sanitized: parsed.href };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return { valid: false, error: 'Phone is required' };
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{7,15}$/.test(cleaned)) return { valid: false, error: 'Invalid phone format' };
  return { valid: true, sanitized: cleaned };
}

export function validateUUID(id) {
  if (!id || typeof id !== 'string') return { valid: false, error: 'ID is required' };
  return { valid: UUID_REGEX.test(id), sanitized: id.toLowerCase() };
}

export function validateString(input, { maxLength = 1000, minLength = 0, allowHTML = false, fieldName = 'field' } = {}) {
  if (input === null || input === undefined) return { valid: false, error: `${fieldName} is required` };
  const str = String(input);
  if (str.length < minLength) return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  if (str.length > maxLength) return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  const threats = scanForThreats(str);
  if (threats.length > 0 && !allowHTML) {
    return { valid: false, error: `${fieldName} contains suspicious patterns`, threats };
  }
  return { valid: true, sanitized: allowHTML ? str : sanitizeString(str) };
}

export function validateNumber(input, { min = -Infinity, max = Infinity, integer = false, fieldName = 'field' } = {}) {
  const num = Number(input);
  if (isNaN(num)) return { valid: false, error: `${fieldName} must be a number` };
  if (integer && !Number.isInteger(num)) return { valid: false, error: `${fieldName} must be an integer` };
  if (num < min) return { valid: false, error: `${fieldName} must be at least ${min}` };
  if (num > max) return { valid: false, error: `${fieldName} must be at most ${max}` };
  return { valid: true, sanitized: num };
}

export function validateObject(schema, data) {
  const errors = [];
  const sanitized = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push({ field: key, error: `${key} is required` });
      continue;
    }

    if (value === null || value === undefined) continue;

    switch (rules.type) {
      case 'email': {
        const result = validateEmail(value);
        if (!result.valid) errors.push({ field: key, error: result.error });
        else sanitized[key] = result.sanitized;
        break;
      }
      case 'password': {
        const result = validatePassword(value);
        if (!result.valid) errors.push({ field: key, errors: result.issues });
        else sanitized[key] = value;
        break;
      }
      case 'url': {
        const result = validateURL(value);
        if (!result.valid) errors.push({ field: key, error: result.error });
        else sanitized[key] = result.sanitized;
        break;
      }
      case 'phone': {
        const result = validatePhone(value);
        if (!result.valid) errors.push({ field: key, error: result.error });
        else sanitized[key] = result.sanitized;
        break;
      }
      case 'string': {
        const result = validateString(value, rules);
        if (!result.valid) errors.push({ field: key, error: result.error });
        else sanitized[key] = result.sanitized;
        break;
      }
      case 'number': {
        const result = validateNumber(value, rules);
        if (!result.valid) errors.push({ field: key, error: result.error });
        else sanitized[key] = result.sanitized;
        break;
      }
      default:
        sanitized[key] = value;
    }
  }

  return { valid: errors.length === 0, errors, sanitized };
}

export function validateRequestBody(body, schema) {
  const threats = scanForThreats(JSON.stringify(body));
  if (threats.length > 0) {
    return { valid: false, errors: [{ error: 'Request contains suspicious patterns', threats }], sanitized: {} };
  }
  return validateObject(schema, body);
}

export function scanInput(input) {
  const threats = scanForThreats(String(input));
  return { safe: threats.length === 0, threats };
}
