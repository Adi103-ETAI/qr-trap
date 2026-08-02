import crypto from 'crypto';

/**
 * Token utilities for the simulation flow.
 *
 * SECURITY MODEL
 * --------------
 * - Tokens are 64-char hex strings generated from 32 random bytes.
 * - The Participant table stores ONLY the SHA-256 hex hash of the token.
 * - Token lookups: hash the incoming token then SELECT by hash.
 * - The raw token is only stored in EmailLog.tokenUsed (SANDBOX-ONLY, for
 *   admin demo visibility). In production, never store the raw token.
 */

/** Generate a fresh 64-char hex token (cryptographically random). */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 hash a token (returns hex string). */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Constant-time comparison of two hex strings of equal length.
 * Falls back to length check first; returns false on length mismatch.
 */
export function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  if (bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Validate token format (64 lowercase hex chars). */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}
