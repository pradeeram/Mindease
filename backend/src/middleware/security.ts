import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { prisma } from '../db/prisma';

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: process.env.NODE_ENV === 'production' ? config.rateLimit.maxRequests : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.'
    }
  }
});

/**
 * Strict rate limiter for Authentication endpoints (Login, Register, Forgot Password, Reset Password)
 * Includes CAPTCHA requirement signaling after threshold.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: process.env.NODE_ENV === 'production' ? 10 : 500, // 500 in dev/test, 10 in prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        requiresCaptcha: true
      }
    });
  }
});

/**
 * Very strict limiter for Password Reset requests to prevent inbox flooding
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_LIMIT',
      message: 'Too many password reset requests. Please try again in 15 minutes.',
      requiresCaptcha: true
    }
  }
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'CHAT_RATE_LIMIT',
      message: 'You are sending messages too quickly to USHA. Please pause for a moment.'
    }
  }
});

/**
 * Audit log helper to record security-relevant actions
 */
export async function logAudit(params: {
  userId?: string;
  action: string;
  req?: Request;
  details?: string;
  status?: string;
}) {
  try {
    const ipAddress = params.req?.ip || (params.req?.headers['x-forwarded-for'] as string) || undefined;
    const userAgent = params.req?.headers['user-agent'] || undefined;

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : undefined,
        userAgent: userAgent ? userAgent.substring(0, 255) : undefined,
        details: params.details,
        status: params.status || 'SUCCESS',
      }
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
}
