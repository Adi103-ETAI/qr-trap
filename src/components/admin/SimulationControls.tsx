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
import { Rocket, Eye, Mail, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  status: 'idle' | 'launched' | 'revealed';
  onAction: (kind: 'launch' | 'reveal') => Promise<void>;
  onSendEmail: (resend: boolean) => Promise<void>;
}

export function SimulationControls({ status, onAction, onSendEmail }: Props) {
  const [confirm, setConfirm] = useState<null | 'launch' | 'reveal' | 'send-email' | 'resend-email'>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm === 'launch') await onAction('launch');
      else if (confirm === 'reveal') await onAction('reveal');
      else if (confirm === 'send-email') await onSendEmail(false);
      else if (confirm === 'resend-email') await onSendEmail(true);
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmTitle =
    confirm === 'launch' ? 'Launch the simulation?' :
    confirm === 'reveal' ? 'Reveal the simulation?' :
    confirm === 'send-email' ? 'Send simulation emails?' :
    confirm === 'resend-email' ? 'Re-send to ALL participants?' : '';

  const confirmDesc =
    confirm === 'launch' ? (
      <>
        This will mark the simulation as <strong>launched</strong> and send a
        security notification email to every registered participant
        who hasn&apos;t received one yet. The action is irreversible.
        Are you sure?
      </>
    ) :
    confirm === 'reveal' ? (
      <>
        This will mark the simulation as <strong>revealed</strong> and broadcast
        to every connected participant page to transition to the
        educational reveal screen. The action is irreversible.
        Are you sure?
      </>
    ) :
    confirm === 'send-email' ? (
      <>
        This will send the security notification email to all registered
        participants who haven&apos;t received it yet. This does NOT change
        the simulation status — you can click it multiple times.
        Continue?
      </>
    ) : (
      <>
        This will <strong>re-send</strong> the simulation email to ALL
        registered participants, even those who already received it. Use
        this carefully to avoid spamming. Continue?
      </>
    );

  const confirmButton =
    confirm === 'launch' ? 'Confirm launch' :
    confirm === 'reveal' ? 'Confirm reveal' :
    confirm === 'send-email' ? 'Send emails' :
    'Re-send to all';

  const confirmButtonClass =
    confirm === 'launch' ? 'bg-red-600 hover:bg-red-700 text-white' :
    confirm === 'reveal' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
    confirm === 'send-email' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
    'bg-amber-600 hover:bg-amber-700 text-white';

  return (
    <Card className="bg-card/70 backdrop-blur p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Simulation Actions</h2>
          <p className="text-sm text-muted-foreground">
            Send Email delivers the simulation link to participants. Launch
            flips the status to &quot;launched&quot;. Reveal transitions
            every open simulation page to the educational reveal screen.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
          <Button
            onClick={() => setConfirm('send-email')}
            disabled={busy}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Mail className="h-4 w-4" />
            SEND EMAIL
          </Button>
          <Button
            onClick={() => setConfirm('resend-email')}
            disabled={busy}
            variant="outline"
            className="h-11 px-5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          >
            <Mail className="h-4 w-4" />
            RE-SEND TO ALL
          </Button>
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

      <Dialog open={confirm !== null} onOpenChange={(o) => !busy && setConfirm(o ? confirm : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {confirmTitle}
            </DialogTitle>
            <DialogDescription>{confirmDesc}</DialogDescription>
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
              className={confirmButtonClass}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {confirmButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
