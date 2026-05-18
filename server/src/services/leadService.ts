import { Types, FilterQuery } from 'mongoose';
import Lead from '../models/Lead.model';
import {
  ILeadDocument,
  UserRole,
  LeadQueryParams,
  PaginationMeta,
  LeadStats,
} from '../types';
import { AppError } from '../middleware/errorHandler';

/**
 * Build the base filter query with RBAC scoping.
 * Admins see all leads; Sales users see only their own.
 */
const buildBaseFilter = (
  userRole: UserRole,
  userId: Types.ObjectId
): FilterQuery<ILeadDocument> => {
  if (userRole === UserRole.ADMIN) return {};
  return { createdBy: userId };
};

/**
 * Get paginated, filtered, and sorted leads.
 */
export const getLeads = async (
  userRole: UserRole,
  userId: Types.ObjectId,
  query: LeadQueryParams
): Promise<{ data: ILeadDocument[]; meta: PaginationMeta }> => {
  const { page = 1, limit = 10, status, source, priority, search, sort = 'latest' } = query;

  const filter: FilterQuery<ILeadDocument> = buildBaseFilter(userRole, userId);

  // Apply filters
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (priority) filter.priority = priority;

  // Case-insensitive search on name, email, or company
  if (search) {
    const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
    ];
  }

  // Sort direction
  const sortOrder = sort === 'oldest' ? 1 : -1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    Lead.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  const meta: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { data: data as ILeadDocument[], meta };
};

/**
 * Get a single lead by ID with RBAC scoping.
 */
export const getLeadById = async (
  leadId: string,
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<ILeadDocument> => {
  if (!Types.ObjectId.isValid(leadId)) {
    throw new AppError('Invalid lead ID format', 400);
  }

  const lead = await Lead.findById(leadId)
    .populate('createdBy', 'name email')
    .lean();

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  // RBAC check: Sales users can only access their own leads
  if (
    userRole === UserRole.SALES &&
    lead.createdBy._id.toString() !== userId.toString()
  ) {
    throw new AppError('Access denied. You can only view your own leads.', 403);
  }

  return lead as ILeadDocument;
};

/**
 * Create a new lead.
 */
export const createLead = async (
  data: Partial<ILeadDocument>,
  userId: Types.ObjectId
): Promise<ILeadDocument> => {
  const lead = await Lead.create({
    ...data,
    createdBy: userId,
  });

  return lead.toJSON() as ILeadDocument;
};

/**
 * Update a lead with RBAC scoping.
 */
export const updateLead = async (
  leadId: string,
  data: Partial<ILeadDocument>,
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<ILeadDocument> => {
  if (!Types.ObjectId.isValid(leadId)) {
    throw new AppError('Invalid lead ID format', 400);
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  // RBAC check
  if (
    userRole === UserRole.SALES &&
    lead.createdBy.toString() !== userId.toString()
  ) {
    throw new AppError('Access denied. You can only update your own leads.', 403);
  }

  const updatedLead = await Lead.findByIdAndUpdate(leadId, data, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name email')
    .lean();

  return updatedLead as ILeadDocument;
};

/**
 * Delete a lead with RBAC scoping.
 */
export const deleteLead = async (
  leadId: string,
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<void> => {
  if (!Types.ObjectId.isValid(leadId)) {
    throw new AppError('Invalid lead ID format', 400);
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  // RBAC check
  if (
    userRole === UserRole.SALES &&
    lead.createdBy.toString() !== userId.toString()
  ) {
    throw new AppError('Access denied. You can only delete your own leads.', 403);
  }

  await Lead.findByIdAndDelete(leadId);
};

/**
 * Get all leads for CSV export (RBAC-scoped, no pagination).
 */
export const getLeadsForExport = async (
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<ILeadDocument[]> => {
  const filter = buildBaseFilter(userRole, userId);
  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return leads as ILeadDocument[];
};

/**
 * Get aggregated lead statistics (RBAC-scoped).
 */
export const getLeadStats = async (
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<LeadStats> => {
  const matchStage =
    userRole === UserRole.ADMIN ? {} : { createdBy: userId };

  const [statusCounts, sourceCounts] = await Promise.all([
    Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Build stats object
  const stats: LeadStats = {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    won: 0,
    lost: 0,
    bySource: sourceCounts,
  };

  statusCounts.forEach(({ _id, count }) => {
    stats.total += count;
    switch (_id) {
      case 'New':
        stats.new = count;
        break;
      case 'Contacted':
        stats.contacted = count;
        break;
      case 'Qualified':
        stats.qualified = count;
        break;
      case 'Proposal':
        stats.proposal = count;
        break;
      case 'Won':
        stats.won = count;
        break;
      case 'Lost':
        stats.lost = count;
        break;
    }
  });

  return stats;
};

/**
 * Bulk update status for multiple leads (RBAC-scoped).
 */
export const bulkUpdateStatus = async (
  ids: string[],
  status: string,
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<number> => {
  const objectIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  const filter: FilterQuery<ILeadDocument> = { _id: { $in: objectIds } };

  // RBAC: Sales users can only update their own leads
  if (userRole === UserRole.SALES) {
    filter.createdBy = userId;
  }

  const result = await Lead.updateMany(filter, { $set: { status } });
  return result.modifiedCount;
};

/**
 * Bulk delete leads (RBAC-scoped).
 */
export const bulkDelete = async (
  ids: string[],
  userRole: UserRole,
  userId: Types.ObjectId
): Promise<number> => {
  const objectIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  const filter: FilterQuery<ILeadDocument> = { _id: { $in: objectIds } };

  // RBAC: Sales users can only delete their own leads
  if (userRole === UserRole.SALES) {
    filter.createdBy = userId;
  }

  const result = await Lead.deleteMany(filter);
  return result.deletedCount;
};
