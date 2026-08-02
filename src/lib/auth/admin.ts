import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

/**
 * Admin session management.
 *
 * Flow:
 *  1. POST /api/admin/login with { password }.
 *  2. Server constant-time compares against process.env.ADMIN_SECRET.
 *  3. On match: generate 32-byte session token, hash it, persist AdminSession
 *     row with 24h expiry, set HTTP-only cookie `admin_session` (raw token).
 *  4. Subsequent admin requests: read cookie, hash, lookup AdminSession.
 *  5. requireAdmin(request): returns session or null.
 */

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

/** Constant-time comparison of two equal-length strings. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  if (bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export interface AdminLoginResult {
  success: boolean;
  error?: string;
}

export async function loginWithPassword(password: string): Promise<AdminLoginResult> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    console.error('[admin-auth] ADMIN_SECRET is not set in env');
    return { success: false, error: 'Server misconfiguration' };
  }
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password required' };
  }
  if (!safeEqual(password, secret)) {
    return { success: false, error: 'Invalid password' };
  }

  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(raw);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_MS);

  await db.adminSession.create({
    data: {
      tokenHash: hashed,
      createdAt: now,
      expiresAt: expires,
    },
  });

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE_NAME)?.value;
  if (raw) {
    const hashed = hashToken(raw);
    try {
      await db.adminSession.deleteMany({ where: { tokenHash: hashed } });
    } catch (err) {
      console.error('[admin-auth] failed to delete session:', err);
    }
  }
  store.delete(ADMIN_COOKIE_NAME);
}

export interface AdminSessionInfo {
  id: string;
  expiresAt: Date;
}

/** Look up an admin session from the request cookie. Returns null if invalid. */
export async function getAdminSession(
  _request?: NextRequest,
): Promise<AdminSessionInfo | null> {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!raw) return null;
  const hashed = hashToken(raw);
  const row = await db.adminSession.findUnique({ where: { tokenHash: hashed } });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    // expired; clean up
    try {
      await db.adminSession.delete({ where: { id: row.id } });
    } catch {
      /* ignore */
    }
    return null;
  }
  return { id: row.id, expiresAt: row.expiresAt };
}

/** Throws a redirect to /admin/login if no valid session. Use in server components. */
export async function requireAdmin(): Promise<AdminSessionInfo> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
