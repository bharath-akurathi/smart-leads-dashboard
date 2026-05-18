import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

/**
 * Role-based access control middleware factory.
 * Returns middleware that only allows specified roles.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Access denied.',
      });
      return;
    }

    next();
  };
};

export default requireRole;
