import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashToken, isValidTokenFormat } from '@/lib/simulation/tokens';
import { getSimulationStatus } from '@/lib/simulation/state';
import { rateLimit } from '@/lib/rate-limit';

const BodySchema = z.object({
  token: z.string().min(1).max(128),
});

/**
 * GET /api/simulation/status?token=...  (preferred for polling)
 * POST /api/simulation/status  body: { token }
 *
 * Public (no auth). Returns current simulation status for the given token.
 * Used as a polling fallback when Socket.io is unavailable.
 *
 * Side effect: when status === 'revealed', records a `reveal_seen` event
 * for the participant (idempotent via metadata marker).
 */
export async function GET(request: NextRequest) {
  return handle(request, request.nextUrl.searchParams.get('token') ?? '');
}

export async function POST(request: NextRequest) {
  let token = '';
  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    token = parsed.data.token;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  return handle(request, token);
}

async function handle(request: NextRequest, rawToken: string) {
  const rl = rateLimit(request, { max: 60, windowMs: 60_000, keyPrefix: 'sim-status' });
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!isValidTokenFormat(rawToken)) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }
  const tokenHash = hashToken(rawToken);
  const participant = await db.participant.findUnique({
    where: { simulationTokenHash: tokenHash },
    select: { id: true },
  });
  if (!participant) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }
  const status = await getSimulationStatus();

  if (status === 'revealed') {
    // Idempotently record `reveal_seen` (use metadata marker to dedupe).
    try {
      const existing = await db.simulationEvent.findFirst({
        where: { participantId: participant.id, eventType: 'reveal_seen' },
      });
      if (!existing) {
        await db.simulationEvent.create({
          data: {
            participantId: participant.id,
            eventType: 'reveal_seen',
            metadata: JSON.stringify({ seenAt: new Date().toISOString() }),
          },
        });
      }
    } catch (err) {
      console.error('[status] failed to record reveal_seen:', err);
    }
  }

  return NextResponse.json({
    status,
    participantId: participant.id,
  });
}
