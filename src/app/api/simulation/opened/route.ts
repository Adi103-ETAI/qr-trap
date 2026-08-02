import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashToken, isValidTokenFormat } from '@/lib/simulation/tokens';
import { rateLimit } from '@/lib/rate-limit';

const BodySchema = z.object({
  token: z.string().min(1).max(128),
});

/**
 * POST /api/simulation/opened
 * Public. Records `simulation_opened` event for a token. Idempotent — flips
 * Participant.simulationOpened to true once (no error on repeat calls).
 */
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { max: 30, windowMs: 60_000, keyPrefix: 'sim-opened' });
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    const json = await request.json();
    parsed = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!isValidTokenFormat(parsed.token)) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  const tokenHash = hashToken(parsed.token);
  const participant = await db.participant.findUnique({
    where: { simulationTokenHash: tokenHash },
    select: { id: true, simulationOpened: true },
  });
  if (!participant) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  if (!participant.simulationOpened) {
    await db.participant.update({
      where: { id: participant.id },
      data: { simulationOpened: true, simulationOpenedAt: new Date() },
    });
  }

  // Always insert the event (so we can count opens even if they refresh).
  // To avoid spamming the table on refresh, we dedupe by a 30s window.
  const recent = await db.simulationEvent.findFirst({
    where: {
      participantId: participant.id,
      eventType: 'simulation_opened',
      createdAt: { gt: new Date(Date.now() - 30_000) },
    },
    select: { id: true },
  });
  if (!recent) {
    await db.simulationEvent.create({
      data: {
        participantId: participant.id,
        eventType: 'simulation_opened',
        metadata: JSON.stringify({ at: new Date().toISOString() }),
      },
    });
  }

  return NextResponse.json({ success: true });
}
