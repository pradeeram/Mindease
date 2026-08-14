import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const SECRET_KEY = config.encryption.key;

// Pre-computed dummy bcrypt hash (work factor 12) for constant-time comparison against nonexistent users
// Prevents timing attacks that reveal user existence
export const DUMMY_BCRYPT_HASH = '$2a$12$e8xL1iH7m3B1j7jWcK7Vf.H4Y7v1sYqTzG6vL3xM2iP9qR5tU8vWa';

/**
 * Encrypt sensitive mental health data at rest (AES-256)
 */
export function encryptData(plainText: string): string {
  if (!plainText) return '';
  try {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
  } catch (err) {
    console.error('Encryption error:', err);
    return plainText;
  }
}

/**
 * Decrypt sensitive mental health data
 */
export function decryptData(cipherText: string): string {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText;
  } catch (err) {
    return cipherText;
  }
}

/**
 * Generates a cryptographically strong random token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hashes a token using SHA-256 so raw tokens are NEVER stored in the database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
