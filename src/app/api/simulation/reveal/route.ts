import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { setRevealed } from '@/lib/simulation/state';
import { broadcastReveal } from '@/lib/realtime/server-broadcast';
import { db } from '@/lib/db';

/**
 * POST /api/simulation/reveal
 * Admin-only. Sets status to `revealed`, records revealedAt, broadcasts
 * via Socket.io to all connected simulation clients.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await setRevealed();
  if (status !== 'revealed') {
    return NextResponse.json({
      success: false,
      error: `Cannot reveal from status "${status}". Must be launched first.`,
      status,
    }, { status: 409 });
  }

  // Fire-and-forget broadcast to all simulation clients.
  broadcastReveal().catch((err) => {
    console.error('[reveal] realtime broadcast failed:', err);
  });

  // Persist `reveal_seen` events lazily as each client polls /status next.
  // (We do NOT mass-create reveal_seen events here — that happens when each
  // participant next hits /api/simulation/status and sees status=revealed.)
  void db; // keep import referenced

  return NextResponse.json({ success: true, status: 'revealed' });
}
