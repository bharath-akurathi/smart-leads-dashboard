// ─── Enums ─────────────────────────────────────────────────────
export type UserRole = 'admin' | 'sales';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

export type LeadSource =
  | 'Website'
  | 'Instagram'
  | 'Referral'
  | 'LinkedIn'
  | 'Google Ads'
  | 'Cold Call'
  | 'Email Campaign'
  | 'Trade Show'
  | 'Other';

export type LeadPriority = 'Low' | 'Medium' | 'High';

// ─── Models ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  notes: string;
  lastContactedAt: string | null;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── API Types ─────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[] | null;
  meta?: PaginationMeta;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  won: number;
  lost: number;
  bySource: { _id: string; count: number }[];
}

// ─── Form Types ────────────────────────────────────────────────
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LeadForm {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  notes?: string;
}

// ─── Filter Types ──────────────────────────────────────────────
export interface LeadFilters {
  page: number;
  limit: number;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  search?: string;
  sort: 'latest' | 'oldest';
}

// ─── Constants ─────────────────────────────────────────────────
export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Won',
  'Lost',
];

export const LEAD_SOURCES: LeadSource[] = [
  'Website',
  'Instagram',
  'Referral',
  'LinkedIn',
  'Google Ads',
  'Cold Call',
  'Email Campaign',
  'Trade Show',
  'Other',
];

export const LEAD_PRIORITIES: LeadPriority[] = ['Low', 'Medium', 'High'];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'badge-new',
  Contacted: 'badge-contacted',
  Qualified: 'badge-qualified',
  Proposal: 'badge-proposal',
  Won: 'badge-won',
  Lost: 'badge-lost',
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};
