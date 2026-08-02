import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/admin';
import { setLaunched } from '@/lib/simulation/state';
import { sendSimulationEmail } from '@/lib/email/send';
import { broadcastLaunch } from '@/lib/realtime/server-broadcast';

/**
 * POST /api/simulation/launch
 * Admin-only. Sets simulation status to `launched`, sends mock emails to
 * all participants who haven't been emailed yet (batched in chunks of 20
 * with Promise.allSettled), records `launched_at`, returns counts.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await setLaunched();
  if (status !== 'launched') {
    // Already launched or revealed — return current state without resending.
    return NextResponse.json({
      success: true,
      already: true,
      status,
      emailed: 0,
      failed: 0,
    });
  }

  // Notify all connected simulation clients to flip into alert mode.
  broadcastLaunch().catch((err) => {
    console.error('[launch] realtime broadcast failed:', err);
  });

  const participants = await db.participant.findMany({
    where: { emailSent: false },
    select: { id: true, email: true, name: true },
  });

  const CHUNK_SIZE = 20;
  let emailed = 0;
  let failed = 0;

  for (let i = 0; i < participants.length; i += CHUNK_SIZE) {
    const chunk = participants.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(async (p) => {
        // Generate a fresh token for this participant (per-email so the
        // same participant can be re-emailed after a reset). We hash it
        // and update the participant row, and use the raw token in the
        // email body / EmailLog.
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
            metadata: JSON.stringify({ subject: 'Security Notification — Event Registration' }),
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
    status: 'launched',
    emailed,
    failed,
    totalParticipants: participants.length,
  });
}
