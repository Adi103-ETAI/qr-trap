'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  sub?: string;
  accent?: 'default' | 'amber' | 'emerald' | 'muted';
  isStatus?: boolean;
}

const accentMap = {
  default: 'text-foreground',
  amber: 'text-amber-500',
  emerald: 'text-emerald-500',
  muted: 'text-muted-foreground',
};

const badgeMap = {
  idle: { label: 'IDLE', cls: 'bg-muted text-muted-foreground border-border' },
  launched: { label: 'LAUNCHED', cls: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  revealed: { label: 'REVEALED', cls: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
};

export function StatCard({ label, value, sub, accent = 'default', isStatus }: Props) {
  return (
    <Card className="bg-card/70 backdrop-blur p-4 sm:p-5 gap-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
        {label}
      </p>
      {isStatus && typeof value === 'string' ? (
        <div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider',
              badgeMap[value as keyof typeof badgeMap]?.cls,
            )}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {badgeMap[value as keyof typeof badgeMap]?.label ?? value}
          </span>
        </div>
      ) : (
        <p className={cn('text-3xl sm:text-4xl font-bold font-mono', accentMap[accent])}>
          {value}
        </p>
      )}
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
