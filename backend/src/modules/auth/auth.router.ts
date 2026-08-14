import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authLimiter, passwordResetLimiter } from '../../middleware/security';

export const authRouter = Router();

// Public Authentication Endpoints (Guarded by strict rate limiters)
authRouter.post('/register', authLimiter, authController.register);
authRouter.post('/login', authLimiter, authController.login);
authRouter.post('/verify-email', authLimiter, authController.verifyEmail);
authRouter.get('/verify-email', authLimiter, authController.verifyEmail);
authRouter.post('/resend-verification', authLimiter, authController.resendVerification);

// Password Reset Flow (Guarded by strict password reset rate limiter)
authRouter.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
authRouter.post('/reset-password', passwordResetLimiter, authController.resetPassword);

authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authenticate, authController.logout);

// Protected Identity & MFA Management
authRouter.get('/me', authenticate, authController.me);
authRouter.post('/mfa/setup', authenticate, authLimiter, authController.setupMFA);
authRouter.post('/mfa/verify', authenticate, authLimiter, authController.verifyAndEnableMFA);
authRouter.post('/mfa/disable', authenticate, authLimiter, authController.disableMFA);
