'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Mail, MousePointerClick, Eye, UserPlus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventItem {
  id: string;
  eventType: string;
  createdAt: string;
  participantEmail: string;
  participantName: string | null;
}

const EVENT_META: Record<
  string,
  { icon: typeof Mail; label: string; color: string }
> = {
  registered: { icon: UserPlus, label: 'Registered', color: 'text-cyan-500' },
  email_sent: { icon: Mail, label: 'Email sent', color: 'text-amber-500' },
  simulation_opened: { icon: Eye, label: 'Opened simulation', color: 'text-orange-500' },
  simulation_clicked: { icon: MousePointerClick, label: 'Clicked CTA', color: 'text-red-500' },
  reveal_seen: { icon: CheckCircle2, label: 'Saw reveal', color: 'text-emerald-500' },
};

interface Props {
  events: EventItem[];
  openedLast30s: number;
}

export function LiveActivity({ events, openedLast30s }: Props) {
  return (
    <Card className="bg-card/70 backdrop-blur p-5 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-red-500" />
          <h3 className="font-semibold">Live Activity</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {events.length} recent
        </span>
      </div>

      {openedLast30s > 0 && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          <strong className="font-mono">{openedLast30s}</strong>{' '}
          {openedLast30s === 1 ? 'participant opened' : 'participants opened'}{' '}
          in the last 30 seconds.
        </div>
      )}

      <ScrollArea className="h-96 w-full pr-2 cyber-scroll">
        {events.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            No activity yet. Register participants and launch the simulation to see events here.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {events.map((e) => {
              const meta = EVENT_META[e.eventType] ?? {
                icon: Activity,
                label: e.eventType,
                color: 'text-muted-foreground',
              };
              const Icon = meta.icon;
              return (
                <li
                  key={e.id}
                  className="flex items-start gap-2.5 rounded-md border border-border/60 bg-background/40 px-3 py-2 hover:bg-background/70 transition-colors"
                >
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', meta.color)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-muted-foreground">
                        {' · '}
                        {e.participantName || e.participantEmail}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {relativeTime(e.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </Card>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
