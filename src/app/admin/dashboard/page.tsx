import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { getSimulation } from '@/lib/simulation/state';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton';
import { Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let session;
  try {
    session = await getAdminSession();
  } catch {
    session = null;
  }
  if (!session) {
    redirect('/admin/login');
  }

  // Aggregate stats in parallel.
  const [
    totalRegistered,
    emailsSent,
    simulationOpened,
    clicked,
    sim,
    recentEvents,
    recentEmails,
    openedLast30s,
  ] = await Promise.all([
    db.participant.count(),
    db.participant.count({ where: { emailSent: true } }),
    db.participant.count({ where: { simulationOpened: true } }),
    db.participant.count({ where: { clicked: true } }),
    getSimulation(),
    db.simulationEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { participant: { select: { email: true, name: true } } },
    }),
    db.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    db.simulationEvent.count({
      where: {
        eventType: 'simulation_opened',
        createdAt: { gt: new Date(Date.now() - 30_000) },
      },
    }),
  ]);

  const stats = {
    totalRegistered,
    emailsSent,
    simulationOpened,
    clicked,
    openedLast30s,
    status: sim.status as 'idle' | 'launched' | 'revealed',
    launchedAt: sim.launchedAt,
    revealedAt: sim.revealedAt,
  };

  // Serialize dates for the client component.
  const serializedEvents = recentEvents.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    createdAt: e.createdAt.toISOString(),
    participantEmail: e.participant?.email ?? 'unknown',
    participantName: e.participant?.name ?? null,
  }));

  const serializedEmails = recentEmails.map((em) => ({
    id: em.id,
    toEmail: em.toEmail,
    subject: em.subject,
    status: em.status,
    tokenUsed: em.tokenUsed,
    createdAt: em.createdAt.toISOString(),
  }));

  return (
    <main className="flex-1 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-sm">CYBER CLUB</span>
              <span className="text-xs text-muted-foreground">/ Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                View site
              </Link>
            </Button>
            <AdminLogoutButton />

          </div>
        </div>
      </header>

      <AdminDashboardClient
        stats={stats}
        initialEvents={serializedEvents}
        initialEmails={serializedEmails}
        launchedAtIso={sim.launchedAt?.toISOString() ?? null}
        revealedAtIso={sim.revealedAt?.toISOString() ?? null}
      />
    </main>
  );
}
