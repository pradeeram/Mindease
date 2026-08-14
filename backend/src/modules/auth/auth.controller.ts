import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { logAudit } from '../../middleware/security';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must explicitly agree to the Terms of Service.'),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must explicitly acknowledge the Privacy Policy.'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  mfaToken: z.string().optional(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(10, 'Verification token is required.'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Password reset token is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
});

const verifyMfaSchema = z.object({
  token: z.string().length(6, 'TOTP code must be exactly 6 digits.'),
});

const disableMfaSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
  token: z.string().length(6, 'TOTP code must be exactly 6 digits.'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.register({
        ...data,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : undefined,
        userAgent: userAgent ? userAgent.substring(0, 255) : undefined,
      });

      await logAudit({
        action: 'AUTH_REGISTER_ATTEMPT',
        req,
        details: `Registration attempted for ${data.email}`,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string || req.body?.token;
      const { token: validToken } = verifyEmailSchema.parse({ token });
      const result = await authService.verifyEmail(validToken);

      await logAudit({
        userId: result.user.id,
        action: 'AUTH_EMAIL_VERIFIED',
        req,
      });

      if (result.refreshToken) {
        res.cookie('mindease_refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Email address successfully verified! Your account is now active.',
      });
    } catch (err) {
      next(err);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = resendVerificationSchema.parse(req.body);
      const result = await authService.resendVerification(email);

      await logAudit({
        action: 'AUTH_RESEND_VERIFICATION',
        req,
        details: `Resend verification requested for ${email}`,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);

      await logAudit({
        action: 'AUTH_FORGOT_PASSWORD_REQUEST',
        req,
        details: `Password reset requested for ${email}`,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(data);

      await logAudit({
        action: 'AUTH_PASSWORD_RESET_SUCCESS',
        req,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      if (result.mfaRequired) {
        res.status(200).json({
          success: true,
          data: result,
        });
        return;
      }

      const successResult = result as {
        mfaRequired: false;
        user: any;
        accessToken: string;
        refreshToken: string;
      };

      await logAudit({
        userId: successResult.user?.id,
        action: 'AUTH_LOGIN_SUCCESS',
        req,
        details: `User logged in with email ${data.email}`,
      });

      if (successResult.refreshToken) {
        res.cookie('mindease_refresh_token', successResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.status(200).json({
        success: true,
        data: successResult,
      });
    } catch (err: any) {
      await logAudit({
        action: 'AUTH_LOGIN_FAILED',
        req,
        details: `Failed login attempt for ${req.body?.email}: ${err.message}`,
        status: 'FAILURE',
      });
      next(err);
    }
  }

  async setupMFA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await authService.setupMFA(userId);

      await logAudit({
        userId,
        action: 'MFA_SETUP_INITIATED',
        req,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyAndEnableMFA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { token } = verifyMfaSchema.parse(req.body);
      const result = await authService.verifyAndEnableMFA(userId, token);

      await logAudit({
        userId,
        action: 'MFA_ENABLED',
        req,
        details: 'User successfully verified and enabled TOTP MFA',
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Two-Factor Authentication is now enabled for your account.',
      });
    } catch (err) {
      next(err);
    }
  }

  async disableMFA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { password, token } = disableMfaSchema.parse(req.body);
      const result = await authService.disableMFA(userId, password, token);

      await logAudit({
        userId,
        action: 'MFA_DISABLED',
        req,
        details: 'User disabled TOTP MFA',
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Two-Factor Authentication has been disabled.',
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.mindease_refresh_token || req.body?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided.' }
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.cookie('mindease_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await logAudit({
          userId: req.user.id,
          action: 'AUTH_LOGOUT',
          req,
        });
      }

      res.clearCookie('mindease_refresh_token');
      res.clearCookie('mindease_access_token');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
