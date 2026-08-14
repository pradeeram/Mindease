import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateTokens(user: { id: string; email: string; role: string }) {
  const payload = { id: user.id, email: user.email, role: user.role };
  
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry as any,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry as any,
  });

  return { accessToken, refreshToken };
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.mindease_access_token) {
      token = req.cookies.mindease_access_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' }
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as AuthenticatedUser;
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists.' }
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please refresh your token.' }
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or malformed authentication token.' }
    });
  }
}
