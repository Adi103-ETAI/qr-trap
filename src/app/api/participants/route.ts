import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateToken, hashToken } from '@/lib/simulation/tokens';
import { rateLimit } from '@/lib/rate-limit';

const BodySchema = z.object({
  authUserId: z.string().min(1).max(128),
  email: z.string().email().max(256),
  name: z.string().max(128).optional().nullable(),
});

/**
 * POST /api/participants
 * Internal route. Creates a participant if one does not already exist for
 * the given authUserId. Returns the participant id (NEVER the token).
 *
 * In practice, the registration flow uses a server action
 * (`src/app/register/actions.ts::demoRegister`) for the sandbox demo and
 * the NextAuth signIn callback for Google OAuth. This route exists as a
 * documented alternative entry point.
 */
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { max: 30, windowMs: 60_000, keyPrefix: 'participants' });
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const existing = await db.participant.findUnique({
    where: { authUserId: parsed.authUserId },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ id: existing.id, created: false });
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const created = await db.participant.create({
    data: {
      authUserId: parsed.authUserId,
      email: parsed.email,
      name: parsed.name ?? null,
      simulationTokenHash: tokenHash,
    },
  });
  await db.simulationEvent.create({
    data: {
      participantId: created.id,
      eventType: 'registered',
      metadata: JSON.stringify({ via: 'api' }),
    },
  });

  // NOTE: the raw token is intentionally NOT returned here. The email
  // service is the carrier of the token. For the sandbox demo, use the
  // /register demo flow which returns the URL once via a short-lived cookie.
  return NextResponse.json({ id: created.id, created: true });
}
