'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { subscribeToSimulation } from '@/lib/realtime/client';
import { SecurityAlert } from './SecurityAlert';
import { SimulationReveal } from './SimulationReveal';
import { SimulationIdle } from './SimulationIdle';
import { Loader2, WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

type View = 'idle' | 'launched' | 'revealed';

interface Props {
  token: string;
  initialStatus: 'idle' | 'launched' | 'revealed';
}

export function SimulationClient({ token, initialStatus }: Props) {
  const [view, setView] = useState<View>(initialStatus);
  const [clicked, setClicked] = useState(false);
  const [socketConnected, setSocketConnected] = useState<boolean | null>(null);
  const lastStatusRef = useRef<View>(initialStatus);

  // Fire "opened" event once on mount.
  useEffect(() => {
    fetch('/api/simulation/opened', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch((err) => console.warn('[opened] failed:', err));
  }, [token]);

  // Subscribe to socket.io. On `simulation:reveal` -> revealed.
  // On `simulation:launched` -> launched.
  useEffect(() => {
    const sub = subscribeToSimulation(
      () => {
        setView('revealed');
        lastStatusRef.current = 'revealed';
      },
      () => {
        if (lastStatusRef.current === 'idle') {
          setView('launched');
          lastStatusRef.current = 'launched';
        }
      },
    );
    const t = setTimeout(() => setSocketConnected(sub.isConnected()), 1500);
    return () => {
      clearTimeout(t);
      sub.cleanup();
    };
  }, []);

  // Polling fallback every 5s — in case socket is dead.
  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/simulation/status?token=${encodeURIComponent(token)}`,
          { method: 'GET' },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.status && data.status !== view) {
          setView(data.status);
          lastStatusRef.current = data.status;
        }
      } catch (err) {
        console.warn('[poll] status fetch failed:', err);
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, view]);

  const handleClick = async () => {
    setClicked(true);
    try {
      await fetch('/api/simulation/clicked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      console.warn('[clicked] failed:', err);
    }
  };

  return (
    <div className="relative">
      {/* Connection indicator (subtle, top-right) */}
      <div className="fixed top-3 right-3 z-50 hidden sm:block">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 backdrop-blur px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
          {socketConnected === null ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : socketConnected ? (
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              LIVE
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-amber-500" />
              POLLING
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'idle' && <SimulationIdle key="idle" />}
        {view === 'launched' && (
          <SecurityAlert
            key="launched"
            token={token}
            clicked={clicked}
            onClicked={handleClick}
          />
        )}
        {view === 'revealed' && <SimulationReveal key="revealed" />}
      </AnimatePresence>
    </div>
  );
}
