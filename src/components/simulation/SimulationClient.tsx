'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { subscribeToSimulation } from '@/lib/realtime/client';
import { SecurityAlert } from './SecurityAlert';
import { SimulationReveal } from './SimulationReveal';
import { SimulationIdle } from './SimulationIdle';
import { Loader2, WifiOff } from 'lucide-react';

type View = 'idle' | 'blackout' | 'launched' | 'revealed';

interface Props {
  token: string;
  initialStatus: 'idle' | 'launched' | 'revealed';
  participantName?: string | null;
}

export function SimulationClient({ token, initialStatus, participantName }: Props) {
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

  // Transition handler — when status changes to 'launched', show blackout first.
  const transitionTo = (newStatus: 'idle' | 'launched' | 'revealed') => {
    if (newStatus === 'launched' && lastStatusRef.current === 'idle') {
      // Show black screen for 1.5s, then transition to the alert.
      setView('blackout');
      lastStatusRef.current = 'blackout';
      setTimeout(() => {
        setView('launched');
        lastStatusRef.current = 'launched';
      }, 1500);
    } else if (newStatus === 'revealed') {
      setView('revealed');
      lastStatusRef.current = 'revealed';
    } else if (newStatus === 'launched') {
      // Already past blackout (e.g., page reloaded after launch) — go straight to alert.
      setView('launched');
      lastStatusRef.current = 'launched';
    }
  };

  // Subscribe to Supabase Realtime.
  useEffect(() => {
    const sub = subscribeToSimulation(
      () => transitionTo('revealed'),
      () => transitionTo('launched'),
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
        if (data.status) {
          const newStatus = data.status as 'idle' | 'launched' | 'revealed';
          // Only transition if the status actually changed and we're not
          // in the middle of a blackout transition.
          if (newStatus !== 'idle' && newStatus !== view && view !== 'blackout') {
            transitionTo(newStatus);
          }
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
      {/* Connection indicator (subtle, top-right) — hidden during blackout */}
      {view !== 'blackout' && (
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
      )}

      <AnimatePresence mode="wait">
        {view === 'idle' && (
          <SimulationIdle key="idle" participantName={participantName} />
        )}
        {view === 'blackout' && <BlackoutScreen key="blackout" />}
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

/**
 * Blackout screen — shows for 1.5s between the Family Feud game and the
 * red security alert. Creates the "something went wrong" feeling.
 *
 * Pure black background with a subtle glitch/static effect.
 */
function BlackoutScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Subtle scanline glitch effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
      {/* Brief flash of red at the edges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 1.5, times: [0, 0.5, 1] }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(220,38,38,0.15) 100%)',
        }}
      />
    </motion.div>
  );
}
