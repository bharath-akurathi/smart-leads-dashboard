import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import { signToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/validators/schemas';
import { AppError } from '../middleware/errorHandler';
import { ZodError } from 'zod';

/**
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Create user
    const user = await User.create(parsed);

    // Generate token
    const token = signToken({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
      return;
    }
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = loginSchema.parse(req.body);

    // Find user and include password for comparison
    const user = await User.findOne({ email: parsed.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isMatch = await user.comparePassword(parsed.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = signToken({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
      return;
    }
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
