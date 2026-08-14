import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import { generateTokens } from '../../middleware/auth';
import { config } from '../../config';
import {
  encryptData,
  decryptData,
  generateSecureToken,
  hashToken,
  DUMMY_BCRYPT_HASH,
} from '../../utils/crypto';

export class AuthService {
  /**
   * User Signup / Registration
   * - Eliminates User Enumeration: Returns identical response whether email exists or not.
   * - Constant-time execution: Calculates bcrypt hash even on existing email.
   * - Generates cryptographically secure SHA-256 hashed verification token (24-hour expiry).
   * - Requires email verification before account goes active.
   * - Records separate audit trails for Terms of Service and Privacy Policy consent (DPDP Act 2023).
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    if (existing) {
      // User exists: perform constant-time dummy work and return identical response
      // Prevents attackers from probing if an email is registered
      return {
        success: true,
        message: 'If this email is not yet registered, a verification link has been sent to your inbox.',
        requiresVerification: true,
      };
    }

    // Generate single-use verification token (32 bytes = 64 hex chars)
    const rawVerificationToken = generateSecureToken(32);
    const verificationTokenHash = hashToken(rawVerificationToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: data.name.trim(),
        role: 'USER',
        onboarded: false,
        emailVerified: false,
        verificationTokenHash,
        verificationTokenExpires,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        onboarded: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    // Record distinct, immutable consent logs (DPDP Act 2023 & DPDP Rules 2025)
    await prisma.consent.createMany({
      data: [
        {
          userId: user.id,
          policyType: 'TERMS',
          agreedVersion: 'v2.0-DPDP-2026',
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
        {
          userId: user.id,
          policyType: 'PRIVACY',
          agreedVersion: 'v2.0-DPDP-2026',
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        }
      ]
    });

    // In a production environment, send email with rawVerificationToken via SendGrid / Resend / AWS SES.
    // In development mode or local verification, return safe metadata for local testing
    return {
      success: true,
      message: 'If this email is not yet registered, a verification link has been sent to your inbox.',
      requiresVerification: true,
      // For local development testing only
      devVerificationToken: process.env.NODE_ENV !== 'production' ? rawVerificationToken : undefined,
    };
  }

  /**
   * Verify Email Address via Single-Use Cryptographic Token
   */
  async verifyEmail(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      const error: any = new Error('Invalid or missing email verification token.');
      error.statusCode = 400;
      throw error;
    }

    const tokenHash = hashToken(rawToken);

    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash: tokenHash,
        verificationTokenExpires: { gt: new Date() },
      }
    });

    if (!user) {
      const error: any = new Error('Verification link is invalid or has expired. Please request a new link.');
      error.statusCode = 400;
      throw error;
    }

    // Mark email as verified and invalidate token
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationTokenHash: null,
        verificationTokenExpires: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        onboarded: true,
        theme: true,
      }
    });

    const tokens = generateTokens(updated);
    return { user: updated, ...tokens };
  }

  /**
   * Resend Verification Email
   * - Eliminates User Enumeration: Always returns identical response regardless of whether email exists.
   */
  async resendVerification(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (user && !user.emailVerified) {
      const rawToken = generateSecureToken(32);
      const verificationTokenHash = hashToken(rawToken);
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationTokenHash,
          verificationTokenExpires,
        }
      });
    } else {
      // Constant-time dummy work
      await bcrypt.compare('dummy', DUMMY_BCRYPT_HASH);
    }

    return {
      success: true,
      message: 'If an unverified account with this email exists, a fresh verification link has been sent.',
    };
  }

  /**
   * User Login with:
   * - Anti-Enumeration & Constant-Time Dummy Comparison
   * - Account Lockout Brute-Force Protection (Locks for 15 mins after 5 failed attempts)
   * - Email Verification Check
   * - TOTP Multi-Factor Authentication
   */
  async login(data: { email: string; password: string; mfaToken?: string }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // 1. Check if user is currently locked out
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      // Still execute constant-time bcrypt compare to match timing
      await bcrypt.compare(data.password, user.passwordHash);
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      const error: any = new Error(`Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minute(s).`);
      error.statusCode = 429;
      error.code = 'ACCOUNT_LOCKED';
      throw error;
    }

    // 2. If user does NOT exist, execute constant-time dummy comparison to prevent timing attacks
    if (!user) {
      await bcrypt.compare(data.password, DUMMY_BCRYPT_HASH);
      const error: any = new Error('Invalid Login Credentials');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 3. Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      const newAttempts = user.failedLoginAttempts + 1;
      const isNowLocked = newAttempts >= 5;
      const lockedUntil = isNowLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        }
      });

      const error: any = new Error(
        isNowLocked
          ? 'Account locked for 15 minutes due to 5 consecutive failed login attempts.'
          : 'Invalid Login Credentials'
      );
      error.statusCode = isNowLocked ? 429 : 401;
      error.code = isNowLocked ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS';
      throw error;
    }

    // 4. Enforce Email Verification (Allow demo user for test/demo mode)
    if (!user.emailVerified && user.email !== 'demo@mindease.app') {
      const error: any = new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      error.statusCode = 403;
      error.code = 'EMAIL_UNVERIFIED';
      throw error;
    }

    // 5. Reset failed attempts upon successful password validation
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        }
      });
    }

    // 6. Check if Multi-Factor Authentication is enabled
    if (user.mfaEnabled) {
      if (!data.mfaToken) {
        return {
          mfaRequired: true,
          userId: user.id,
          email: user.email,
        };
      }

      if (!user.mfaSecret) {
        const error: any = new Error('MFA configuration corrupted. Please contact support.');
        error.statusCode = 500;
        throw error;
      }

      const decryptedSecret = decryptData(user.mfaSecret);
      const verified = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token: data.mfaToken,
        window: 1, // Allow +/- 30 seconds clock drift
      });

      if (!verified) {
        const error: any = new Error('Invalid 6-digit authentication code.');
        error.statusCode = 401;
        error.code = 'INVALID_MFA_TOKEN';
        throw error;
      }
    }

    const tokens = generateTokens(user);
    return {
      mfaRequired: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        onboarded: user.onboarded,
        theme: user.theme,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Request Password Reset (Forgot Password)
   * - Eliminates User Enumeration: Returns identical generic message regardless of email existence.
   * - Cryptographically secure 32-byte token.
   * - Stored ONLY as a SHA-256 hash in the database.
   * - 20-minute strict expiration.
   * - Never exposed in logs or database plaintext.
   */
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (user) {
      const rawResetToken = generateSecureToken(32);
      const resetPasswordTokenHash = hashToken(rawResetToken);
      const resetPasswordExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordTokenHash,
          resetPasswordExpires,
        }
      });

      // In production, send email containing rawResetToken via email service.
      // Raw token is NEVER written to DB or logged.
      return {
        success: true,
        message: 'If an account with that email exists, we have sent a secure password reset link to your inbox.',
        devResetToken: process.env.NODE_ENV !== 'production' ? rawResetToken : undefined,
      };
    }

    // If user does NOT exist, execute constant-time dummy work
    await bcrypt.compare('dummy', DUMMY_BCRYPT_HASH);

    return {
      success: true,
      message: 'If an account with that email exists, we have sent a secure password reset link to your inbox.',
    };
  }

  /**
   * Reset Password with Single-Use Token
   * - Validates SHA-256 hash of token.
   * - Enforces 20-minute expiration window.
   * - Immediately invalidates token to guarantee single-use.
   * - Hashes new password with slow KDF (bcrypt 12 rounds).
   * - Clears failed attempts and account lockouts.
   */
  async resetPassword(data: { token: string; newPassword: string }) {
    if (!data.token || typeof data.token !== 'string') {
      const error: any = new Error('Invalid or missing password reset token.');
      error.statusCode = 400;
      throw error;
    }

    if (!data.newPassword || data.newPassword.length < 8) {
      const error: any = new Error('Password must be at least 8 characters long.');
      error.statusCode = 400;
      throw error;
    }

    const tokenHash = hashToken(data.token);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: { gt: new Date() },
      }
    });

    if (!user) {
      const error: any = new Error('Password reset link is invalid or has expired (20-minute limit). Please request a new reset link.');
      error.statusCode = 400;
      error.code = 'INVALID_RESET_TOKEN';
      throw error;
    }

    // Hash new password with slow KDF (bcrypt 12 rounds)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.newPassword, salt);

    // Update password and invalidate reset token (single-use)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordTokenHash: null,
        resetPasswordExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });

    return {
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new credentials.',
    };
  }

  /**
   * Set up TOTP Multi-Factor Authentication
   */
  async setupMFA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const secret = speakeasy.generateSecret({
      name: `MindEase (${user.email})`,
      issuer: 'MindEase CBT Platform',
      length: 20,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    // Temporarily save encrypted secret until verified
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: encryptData(secret.base32),
      }
    });

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpAuthUrl: secret.otpauth_url,
    };
  }

  /**
   * Verify & Activate TOTP Multi-Factor Authentication
   */
  async verifyAndEnableMFA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      const error: any = new Error('MFA setup was not initiated. Please start setup again.');
      error.statusCode = 400;
      throw error;
    }

    const decryptedSecret = decryptData(user.mfaSecret);
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      const error: any = new Error('Invalid verification code. Please check your authenticator app.');
      error.statusCode = 400;
      error.code = 'INVALID_MFA_TOKEN';
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        mfaEnabled: true,
      }
    });

    return updated;
  }

  /**
   * Disable TOTP Multi-Factor Authentication
   */
  async disableMFA(userId: string, password: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      const error: any = new Error('User not found or MFA is not active.');
      error.statusCode = 400;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const error: any = new Error('Incorrect password.');
      error.statusCode = 401;
      throw error;
    }

    const decryptedSecret = decryptData(user.mfaSecret);
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      const error: any = new Error('Invalid authentication code.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        mfaEnabled: false,
      }
    });

    return updated;
  }

  /**
   * Refresh JWT Access Token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, mfaEnabled: true, onboarded: true, theme: true }
      });

      if (!user) {
        const error: any = new Error('User not found.');
        error.statusCode = 401;
        throw error;
      }

      const tokens = generateTokens(user);
      return { user, ...tokens };
    } catch (err) {
      const error: any = new Error('Invalid or expired refresh token. Please log in again.');
      error.statusCode = 401;
      throw error;
    }
  }
}

export const authService = new AuthService();
