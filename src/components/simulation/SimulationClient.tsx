'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { subscribeToSimulation } from '@/lib/realtime/client';
import { SecurityAlert } from './SecurityAlert';
import { SimulationReveal } from './SimulationReveal';
import { SimulationIdle } from './SimulationIdle';

type View = 'idle' | 'blackout' | 'launched' | 'revealed';

interface Props {
  token: string;
  initialStatus: 'idle' | 'launched' | 'revealed';
  participantName?: string | null;
}

export function SimulationClient({ token, initialStatus, participantName }: Props) {
  const [view, setView] = useState<View>(initialStatus);
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
    return () => {
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

  // Fire 'clicked' event when the alert page appears (no button anymore).
  useEffect(() => {
    if (view === 'launched') {
      fetch('/api/simulation/clicked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch((err) => console.warn('[clicked] failed:', err));
    }
  }, [view, token]);

  return (
    <div className="relative">

      <AnimatePresence mode="wait">
        {view === 'idle' && (
          <SimulationIdle key="idle" participantName={participantName} />
        )}
        {view === 'blackout' && <BlackoutScreen key="blackout" />}
        {view === 'launched' && (
          <SecurityAlert
            key="launched"
            token={token}
            onClicked={() => {}}
            clicked={false}
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
