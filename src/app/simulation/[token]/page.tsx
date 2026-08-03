import { db } from '@/lib/db';
import { hashToken, isValidTokenFormat } from '@/lib/simulation/tokens';
import { getSimulationStatus } from '@/lib/simulation/state';
import { SimulationClient } from '@/components/simulation/SimulationClient';
import { ShieldX } from 'lucide-react';

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

  // No header, no back button, no navigation — participants can't leave.
  // The SimulationClient takes over the full viewport.
  return (
    <main className="flex-1 flex flex-col cyber-grid">
      <SimulationClient token={token} initialStatus={initialStatus} participantName={participant.name} />
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
      </div>
    </main>
  );
}
