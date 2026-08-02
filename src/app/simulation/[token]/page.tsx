import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { hashToken, isValidTokenFormat } from '@/lib/simulation/tokens';
import { getSimulationStatus } from '@/lib/simulation/state';
import { SimulationClient } from '@/components/simulation/SimulationClient';
import { Button } from '@/components/ui/button';
import { ShieldX, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SimulationPage({ params }: Props) {
  const { token } = await params;

  // Validate format BEFORE any DB lookup to avoid hashing junk.
  if (!isValidTokenFormat(token)) {
    return <InvalidLink />;
  }

  const tokenHash = hashToken(token);
  const participant = await db.participant.findUnique({
    where: { simulationTokenHash: tokenHash },
    select: { id: true, email: true, name: true },
  });

  if (!participant) {
    return <InvalidLink />;
  }

  const status = await getSimulationStatus();
  const initialStatus =
    status === 'revealed' ? 'revealed' : status === 'launched' ? 'launched' : 'idle';

  return (
    <main className="flex-1 flex flex-col cyber-grid">
      {/* Minimal top bar — keep the page immersive */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" />
            Cyber Club
          </Link>
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Secure Session · ref {token.slice(0, 6)}
          </span>
        </div>
      </header>

      <SimulationClient token={token} initialStatus={initialStatus} />
    </main>
  );
}

function InvalidLink() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 cyber-grid">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 mx-auto">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Invalid or expired link</h1>
        <p className="text-muted-foreground">
          The simulation link you followed is not valid. This can happen if
          the link was truncated, altered, or already expired. Please use
          the link from your security notification email.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Return to landing</Link>
        </Button>
      </div>
    </main>
  );
}
