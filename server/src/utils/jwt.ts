import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserRole } from '../types';

interface TokenPayload {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
}

export const signToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      _id: payload._id.toString(),
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret) as TokenPayload;
};
