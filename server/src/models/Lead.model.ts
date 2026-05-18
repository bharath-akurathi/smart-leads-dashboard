import mongoose, { Schema } from 'mongoose';
import { ILeadDocument, LeadStatus, LeadSource, LeadPriority } from '../types';

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW,
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      required: [true, 'Lead source is required'],
    },
    priority: {
      type: String,
      enum: Object.values(LeadPriority),
      default: LeadPriority.MEDIUM,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes must be at most 2000 characters'],
      default: '',
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must be associated with a user'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient RBAC-scoped queries
leadSchema.index({ createdBy: 1, status: 1 });
leadSchema.index({ createdBy: 1, source: 1 });
leadSchema.index({ createdBy: 1, createdAt: -1 });
leadSchema.index({ status: 1, source: 1, createdBy: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });

// Text index for search
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

const Lead = mongoose.model<ILeadDocument>('Lead', leadSchema);
export default Lead;
