import { z } from 'zod';

/**
 * API Input Validation Schemas
 * Validates all incoming request bodies and query parameters
 */

// ─── Common Schemas ─────────────────────────────────

export const userIdSchema = z.string().min(1).max(100);
export const emailSchema = z.string().email();
export const urlSchema = z.string().url().max(2048);
export const cronSchema = z.string().regex(/^[\d\*\/\-\,\s]+$/).max(50);

// ─── Auto-Apply Schema ──────────────────────────────

export const autoApplySchema = z.object({
  profileId: userIdSchema,
  targetUrl: z.string().max(2048).optional(),
  targetType: z.enum(['scholarship', 'job', 'work_permit']),
  position: z.string().max(500).optional(),
  applicationId: z.string().max(100).optional(),
});

// ─── Application Schema ─────────────────────────────

export const applicationCreateSchema = z.object({
  userId: userIdSchema.optional(),
  title: z.string().min(1).max(500),
  institution: z.string().max(500).optional(),
  type: z.enum(['Scholarship', 'Job', 'Work Permit']),
  country: z.string().max(100).optional(),
  url: z.string().max(2048).optional(),
  matchScore: z.number().min(0).max(100).optional(),
  agent: z.string().max(200).optional(),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(['Queued', 'In Progress', 'Submitted', 'Failed', 'Document Check', 'Tailoring CV']),
  progress: z.number().min(0).max(100).optional(),
});

// ─── Resume Schema ──────────────────────────────────

export const resumeParseSchema = z.object({
  userId: userIdSchema.optional(),
  resumeText: z.string().max(50000).optional(),
  action: z.enum(['parse', 'update', 'tailor', 'cover-letter']).default('parse'),
  opportunity: z.object({
    title: z.string().max(500),
    institution: z.string().max(500).optional(),
    type: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    matchScore: z.number().min(0).max(100).optional(),
  }).optional(),
  autoUpdate: z.boolean().optional(),
});

// ─── Campaign Schema ────────────────────────────────

export const campaignCreateSchema = z.object({
  userId: userIdSchema.optional(),
  name: z.string().max(200).optional(),
  preset: z.enum(['aggressive', 'moderate', 'conservative', 'discovery', 'weekly']).default('moderate'),
  cron: cronSchema.optional(),
  maxApplications: z.number().int().min(1).max(50).optional(),
  delay: z.number().int().min(0).max(60000).optional(),
  types: z.array(z.enum(['scholarship', 'job', 'work_permit'])).optional(),
  countries: z.array(z.string().max(100)).optional(),
});

export const campaignUpdateSchema = z.object({
  campaignId: userIdSchema,
  action: z.enum(['pause', 'resume']),
});

// ─── Discovery Schema ───────────────────────────────

export const discoveryCreateSchema = z.object({
  userId: userIdSchema.optional(),
  autoApply: z.boolean().optional(),
});

export const discoveryUpdateSchema = z.object({
  discoveryId: userIdSchema,
  status: z.enum(['new', 'applied', 'ignored', 'shortlisted']),
});

// ─── Notification Schema ────────────────────────────

export const notificationSchema = z.object({
  action: z.enum(['status_change', 'new_discoveries', 'daily_digest', 'test']),
  userId: userIdSchema.optional(),
  application: z.object({
    title: z.string().max(500),
    institution: z.string().max(500).optional(),
    country: z.string().max(100).optional(),
    type: z.string().max(100).optional(),
    agent: z.string().max(100).optional(),
    progress: z.number().min(0).max(100).optional(),
    matchScore: z.number().min(0).max(100).optional(),
  }).optional(),
  oldStatus: z.string().max(100).optional(),
  newStatus: z.string().max(100).optional(),
  discoveries: z.array(z.object({
    title: z.string(),
    url: z.string(),
    country: z.string().optional(),
  })).optional(),
});

// ─── Task Schema ────────────────────────────────────

export const taskCancelSchema = z.object({
  action: z.literal('cancel'),
});

// ─── Validation Helper ──────────────────────────────

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

export function validateRequest(schema) {
  return async (request) => {
    try {
      const body = await request.json();
      const result = validate(schema, body);
      if (!result.success) {
        return { valid: false, error: result.errors.join(', ') };
      }
      return { valid: true, data: result.data };
    } catch (e) {
      return { valid: false, error: 'Invalid JSON body' };
    }
  };
}
