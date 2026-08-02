import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin';

/**
 * GET /api/admin/events?limit=50
 * Returns recent SimulationEvent rows (newest first). Admin-only.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const limitRaw = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '50', 10);
  const limit = Math.max(1, Math.min(200, Number.isFinite(limitRaw) ? limitRaw : 50));
  const rows = await db.simulationEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { participant: { select: { email: true, name: true } } },
  });
  const events = rows.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    createdAt: e.createdAt.toISOString(),
    participantEmail: e.participant?.email ?? 'unknown',
    participantName: e.participant?.name ?? null,
  }));
  return NextResponse.json({ events });
}
