import { Document, Types } from 'mongoose';
import { Request } from 'express';

// ─── Enums ─────────────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  WON = 'Won',
  LOST = 'Lost',
}

export enum LeadSource {
  WEBSITE = 'Website',
  INSTAGRAM = 'Instagram',
  REFERRAL = 'Referral',
  LINKEDIN = 'LinkedIn',
  GOOGLE_ADS = 'Google Ads',
  COLD_CALL = 'Cold Call',
  EMAIL_CAMPAIGN = 'Email Campaign',
  TRADE_SHOW = 'Trade Show',
  OTHER = 'Other',
}

export enum LeadPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

// ─── Interfaces ────────────────────────────────────────────────
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  notes?: string;
  lastContactedAt?: Date;
  createdBy: Types.ObjectId;
}

export interface ILeadDocument extends ILead, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request Types ─────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: UserRole;
  };
}

// ─── Response Types ────────────────────────────────────────────
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

// ─── Query Types ───────────────────────────────────────────────
export interface LeadQueryParams {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  search?: string;
  sort?: 'latest' | 'oldest';
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
