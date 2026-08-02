'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatCard } from './StatCard';
import { SimulationControls } from './SimulationControls';
import { LiveActivity } from './LiveActivity';
import { EmailLogTable } from './EmailLogTable';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type SimStatus = 'idle' | 'launched' | 'revealed';

interface Stats {
  totalRegistered: number;
  emailsSent: number;
  simulationOpened: number;
  clicked: number;
  openedLast30s: number;
  status: SimStatus;
}

interface EventItem {
  id: string;
  eventType: string;
  createdAt: string;
  participantEmail: string;
  participantName: string | null;
}

interface EmailItem {
  id: string;
  toEmail: string;
  subject: string;
  status: string;
  tokenUsed: string;
  createdAt: string;
}

interface Props {
  stats: Stats;
  initialEvents: EventItem[];
  initialEmails: EmailItem[];
  launchedAtIso: string | null;
  revealedAtIso: string | null;
}

export function AdminDashboardClient({
  stats: initialStats,
  initialEvents,
  initialEmails,
  launchedAtIso,
  revealedAtIso,
}: Props) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, eventsRes, emailsRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/admin/events?limit=50', { cache: 'no-store' }),
        fetch('/api/admin/emails?limit=25', { cache: 'no-store' }),
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events ?? []);
      }
      if (emailsRes.ok) {
        const data = await emailsRes.json();
        setEmails(data.emails ?? []);
      }
    } catch (err) {
      console.error('[refresh] failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 3 seconds for live updates.
  useEffect(() => {
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  const onAction = async (kind: 'launch' | 'reveal') => {
    try {
      const res = await fetch(`/api/simulation/${kind}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: `${kind} failed`,
          description: data.error || 'Unknown error',
        });
        return;
      }
      toast({
        title: kind === 'launch' ? 'Simulation launched' : 'Simulation revealed',
        description:
          kind === 'launch'
            ? `Emails sent: ${data.emailed ?? 0}, failed: ${data.failed ?? 0}`
            : 'All participants will see the reveal screen.',
      });
      await refresh();
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Network error' });
    }
  };

  return (
    <div className="flex-1 cyber-grid-fine">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Simulation Control</h1>
            <p className="text-sm text-muted-foreground">
              Live operations dashboard · {stats.status.toUpperCase()}
              {launchedAtIso && (
                <span className="ml-2 text-xs">
                  · launched {timeAgo(launchedAtIso)}
                </span>
              )}
              {revealedAtIso && (
                <span className="ml-2 text-xs">
                  · revealed {timeAgo(revealedAtIso)}
                </span>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Registered"
            value={stats.totalRegistered}
            accent="default"
          />
          <StatCard
            label="Emails Sent"
            value={stats.emailsSent}
            accent="default"
          />
          <StatCard
            label="Simulation Opened"
            value={stats.simulationOpened}
            sub={`+${stats.openedLast30s} in last 30s`}
            accent="amber"
          />
          <StatCard
            label="Interacted"
            value={stats.clicked}
            accent="amber"
          />
          <StatCard
            label="Reveal Status"
            value={stats.status}
            accent={stats.status === 'idle' ? 'muted' : stats.status === 'launched' ? 'amber' : 'emerald'}
            isStatus
          />
        </div>

        {/* Controls */}
        <SimulationControls status={stats.status} onAction={onAction} />

        {/* Activity + Emails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiveActivity events={events} openedLast30s={stats.openedLast30s} />
          <EmailLogTable emails={emails} />
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
