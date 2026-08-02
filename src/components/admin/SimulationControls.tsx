'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Rocket, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  status: 'idle' | 'launched' | 'revealed';
  onAction: (kind: 'launch' | 'reveal') => Promise<void>;
}

export function SimulationControls({ status, onAction }: Props) {
  const [confirm, setConfirm] = useState<null | 'launch' | 'reveal'>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await onAction(confirm);
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-card/70 backdrop-blur p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Simulation Actions</h2>
          <p className="text-sm text-muted-foreground">
            Launch emails the alert to all registered participants. Reveal
            transitions every open simulation page to the educational
            reveal screen.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            onClick={() => setConfirm('launch')}
            disabled={status !== 'idle' || busy}
            className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white"
          >
            <Rocket className="h-4 w-4" />
            LAUNCH SIMULATION
          </Button>
          <Button
            onClick={() => setConfirm('reveal')}
            disabled={status !== 'launched' || busy}
            className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Eye className="h-4 w-4" />
            REVEAL SIMULATION
          </Button>
        </div>
      </div>

      {/* Confirmation modal */}
      <Dialog open={confirm !== null} onOpenChange={(o) => !busy && setConfirm(o ? confirm : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {confirm === 'launch' ? 'Launch the simulation?' : 'Reveal the simulation?'}
            </DialogTitle>
            <DialogDescription>
              {confirm === 'launch' ? (
                <>
                  This will mark the simulation as <strong>launched</strong> and send a
                  security notification email to every registered participant
                  who hasn't received one yet. The action is irreversible.
                  Are you sure?
                </>
              ) : (
                <>
                  This will mark the simulation as <strong>revealed</strong> and broadcast
                  to every connected participant page to transition to the
                  educational reveal screen. The action is irreversible.
                  Are you sure?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirm(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={run}
              disabled={busy}
              className={
                confirm === 'launch'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {confirm === 'launch' ? 'Confirm launch' : 'Confirm reveal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
