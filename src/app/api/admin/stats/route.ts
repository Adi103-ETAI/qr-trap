import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin';
import { getSimulation } from '@/lib/simulation/state';

/**
 * GET /api/admin/stats
 * Returns aggregate dashboard stats. Admin-only.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [totalRegistered, emailsSent, simulationOpened, clicked, sim, openedLast30s] =
    await Promise.all([
      db.participant.count(),
      db.participant.count({ where: { emailSent: true } }),
      db.participant.count({ where: { simulationOpened: true } }),
      db.participant.count({ where: { clicked: true } }),
      getSimulation(),
      db.simulationEvent.count({
        where: {
          eventType: 'simulation_opened',
          createdAt: { gt: new Date(Date.now() - 30_000) },
        },
      }),
    ]);
  return NextResponse.json({
    totalRegistered,
    emailsSent,
    simulationOpened,
    clicked,
    openedLast30s,
    status: sim.status,
  });
}
