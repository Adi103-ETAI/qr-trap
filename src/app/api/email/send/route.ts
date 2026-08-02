import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendSimulationEmail } from '@/lib/email/send';
import { getAdminSession } from '@/lib/auth/admin';

const BodySchema = z.object({
  participantId: z.string().min(1).max(64),
  // Optional override — when omitted, a fresh token is generated.
});

/**
 * POST /api/email/send
 * Internal/admin route. Sends (mock) simulation email to a single
 * participant. Used by the launch flow in batched mode and available
 * as a one-off admin action.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const p = await db.participant.findUnique({
    where: { id: parsed.participantId },
    select: { id: true, email: true, name: true },
  });
  if (!p) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
  }

  const { generateToken, hashToken } = await import('@/lib/simulation/tokens');
  const token = generateToken();
  const tokenHash = hashToken(token);
  await db.participant.update({
    where: { id: p.id },
    data: {
      simulationTokenHash: tokenHash,
      emailSent: true,
      emailSentAt: new Date(),
    },
  });

  const r = await sendSimulationEmail({
    to: p.email,
    name: p.name,
    token,
    participantId: p.id,
  });
  if (!r.success) {
    return NextResponse.json({ error: r.error ?? 'send failed' }, { status: 500 });
  }
  await db.simulationEvent.create({
    data: {
      participantId: p.id,
      eventType: 'email_sent',
      metadata: JSON.stringify({ via: 'manual' }),
    },
  });
  return NextResponse.json({ success: true });
}
