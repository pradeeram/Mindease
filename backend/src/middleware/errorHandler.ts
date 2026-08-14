import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input parameters.',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Handle Prisma connection and authentication errors gracefully
  if (
    err.name === 'PrismaClientInitializationError' ||
    err.name === 'PrismaClientRustPanicError' ||
    err.code === 'P1000' ||
    err.code === 'P1001' ||
    err.code === 'P1003' ||
    err.code === 'P1017'
  ) {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'The secure database is currently connecting. Please ensure valid database credentials are configured in environment variables and try again.',
      },
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error occurred. Please try again later.';

  // Only sanitize 500 internal server errors or unexpected unhandled database driver crashes
  if (
    statusCode >= 500 ||
    message.toLowerCase().includes('prisma') ||
    message.toLowerCase().includes('postgres') ||
    message.toLowerCase().includes('database error')
  ) {
    message = 'An unexpected server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
    },
  });
}
