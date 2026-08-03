import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/admin';
import { sendSimulationEmail } from '@/lib/email/send';
import { z } from 'zod';

/**
 * POST /api/simulation/send-email
 * Admin-only. Sends the simulation email to all registered participants
 * who haven't received it yet (or ALL participants if resend=true).
 *
 * Does NOT change the simulation status — this is just email delivery.
 * The admin can click this multiple times.
 *
 * Body:
 *   { resend?: boolean }  — if true, re-sends to everyone (even those
 *                           already emailed). Default: false (only sends
 *                           to those who haven't received it).
 */
const BodySchema = z.object({
  resend: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const json = await request.json();
    body = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // If resend=true, send to everyone. Otherwise, only send to those who
  // haven't received the email yet.
  const where = body.resend ? {} : { emailSent: false };

  const participants = await db.participant.findMany({
    where,
    select: { id: true, email: true, name: true },
  });

  const CHUNK_SIZE = 20;
  let emailed = 0;
  let failed = 0;

  for (let i = 0; i < participants.length; i += CHUNK_SIZE) {
    const chunk = participants.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(async (p) => {
        const { generateToken, hashToken } = await import(
          '@/lib/simulation/tokens'
        );
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
        if (!r.success) throw new Error(r.error ?? 'send failed');
        await db.simulationEvent.create({
          data: {
            participantId: p.id,
            eventType: 'email_sent',
            metadata: JSON.stringify({
              subject: 'Security Notification — Event Registration',
              resend: body.resend,
            }),
          },
        });
      }),
    );
    for (const r of results) {
      if (r.status === 'fulfilled') emailed += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({
    success: true,
    emailed,
    failed,
    totalParticipants: participants.length,
    resend: body.resend,
  });
}
