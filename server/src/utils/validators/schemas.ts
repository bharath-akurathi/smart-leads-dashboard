import { z } from 'zod';
import { LeadStatus, LeadSource, LeadPriority, UserRole } from '../../types';

// ─── Auth Schemas ──────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.SALES),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Lead Schemas ──────────────────────────────────────────────
export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().max(20).optional().default(''),
  company: z.string().trim().max(200).optional().default(''),
  status: z.nativeEnum(LeadStatus).optional().default(LeadStatus.NEW),
  source: z.nativeEnum(LeadSource, {
    errorMap: () => ({ message: 'Invalid lead source' }),
  }),
  priority: z.nativeEnum(LeadPriority).optional().default(LeadPriority.MEDIUM),
  notes: z.string().trim().max(2000).optional().default(''),
  lastContactedAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export const updateLeadSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().max(20).optional(),
  company: z.string().trim().max(200).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  notes: z.string().trim().max(2000).optional(),
  lastContactedAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : undefined)),
});

// ─── Query Schema ──────────────────────────────────────────────
export const leadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  search: z.string().trim().optional(),
  sort: z.enum(['latest', 'oldest']).optional().default('latest'),
});

// ─── Bulk Schemas ──────────────────────────────────────────────
export const bulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one lead ID is required'),
  status: z.nativeEnum(LeadStatus),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one lead ID is required'),
});

// Inferred types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
