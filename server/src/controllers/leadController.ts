import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as leadService from '../services/leadService';
import { generateCSV } from '../utils/csvExport';
import {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  bulkStatusSchema,
  bulkDeleteSchema,
} from '../utils/validators/schemas';
import { ZodError } from 'zod';

/**
 * Helper to handle Zod validation errors consistently.
 */
const handleZodError = (error: ZodError, res: Response): void => {
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  });
};

/**
 * GET /api/leads
 */
export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = leadQuerySchema.parse(req.query);
    const result = await leadService.getLeads(
      req.user!.role,
      req.user!._id,
      query
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(error, res);
    next(error);
  }
};

/**
 * GET /api/leads/stats
 */
export const getLeadStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await leadService.getLeadStats(
      req.user!.role,
      req.user!._id
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/export/csv
 */
export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leads = await leadService.getLeadsForExport(
      req.user!.role,
      req.user!._id
    );

    const csv = generateCSV(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads_export_${Date.now()}.csv`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id
 */
export const getLeadById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await leadService.getLeadById(
      req.params.id as string,
      req.user!.role,
      req.user!._id
    );

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads
 */
export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createLeadSchema.parse(req.body);
    const lead = await leadService.createLead(parsed as any, req.user!._id);

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(error, res);
    next(error);
  }
};

/**
 * PUT /api/leads/:id
 */
export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateLeadSchema.parse(req.body);
    const lead = await leadService.updateLead(
      req.params.id as string,
      parsed as any,
      req.user!.role,
      req.user!._id
    );

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(error, res);
    next(error);
  }
};

/**
 * DELETE /api/leads/:id
 */
export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await leadService.deleteLead(
      req.params.id as string,
      req.user!.role,
      req.user!._id
    );

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/leads/bulk/status
 */
export const bulkUpdateStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids, status } = bulkStatusSchema.parse(req.body);
    const modifiedCount = await leadService.bulkUpdateStatus(
      ids,
      status,
      req.user!.role,
      req.user!._id
    );

    res.status(200).json({
      success: true,
      message: `${modifiedCount} lead(s) updated.`,
      data: { modifiedCount },
    });
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(error, res);
    next(error);
  }
};

/**
 * DELETE /api/leads/bulk
 */
export const bulkDelete = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids } = bulkDeleteSchema.parse(req.body);
    const deletedCount = await leadService.bulkDelete(
      ids,
      req.user!.role,
      req.user!._id
    );

    res.status(200).json({
      success: true,
      message: `${deletedCount} lead(s) deleted.`,
      data: { deletedCount },
    });
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(error, res);
    next(error);
  }
};
