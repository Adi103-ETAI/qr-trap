import type { NextRequest } from 'next/server';

/**
 * Simple in-memory rate limiter (per-IP, per-route-prefix).
 *
 * Limits: max N requests per windowMs per IP. Designed for the sandbox;
 * for production use Upstash Redis or a real rate-limit service.
 *
 * NOTE: state lives in process memory — not shared across serverless
 * instances. Adequate for a single-instance sandbox demo.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs * 2) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  request: NextRequest | Request,
  opts: { max: number; windowMs: number; keyPrefix?: string },
): RateLimitResult {
  const ip =
    (request as NextRequest).headers?.get('x-real-ip') ||
    (request as NextRequest).headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const key = `${opts.keyPrefix ?? 'rl'}:${ip}`;
  const now = Date.now();
  cleanup(now, opts.windowMs);
  const existing = buckets.get(key);
  if (!existing || now - existing.windowStart > opts.windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, remaining: opts.max - 1, resetMs: opts.windowMs };
  }
  existing.count += 1;
  if (existing.count > opts.max) {
    return { ok: false, remaining: 0, resetMs: opts.windowMs - (now - existing.windowStart) };
  }
  return {
    ok: true,
    remaining: opts.max - existing.count,
    resetMs: opts.windowMs - (now - existing.windowStart),
  };
}
