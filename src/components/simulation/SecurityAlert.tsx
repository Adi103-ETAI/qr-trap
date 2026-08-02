'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ANALYSIS_STEPS = [
  'Scanning credentials',
  'Checking device integrity',
  'Reviewing access logs',
  'Cross-referencing activity',
];

interface Props {
  token: string;
  onClicked: () => void;
  clicked: boolean;
}

export function SecurityAlert({ token, onClicked, clicked }: Props) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((i) => (i + 1) % ANALYSIS_STEPS.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[80vh] flex items-center justify-center px-4 py-12"
    >
      {/* Red ambient pulse */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 alert-bg-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.18), transparent 70%)',
        }}
      />

      <motion.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden border-red-500/50 bg-card/90 backdrop-blur scanline">
          {/* Top stripe */}
          <div className="bg-red-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold tracking-wider">
              <AlertOctagon className="h-4 w-4" />
              SECURITY NOTIFICATION
            </div>
            <span className="font-mono text-xs opacity-80">
              {new Date().toLocaleString()}
            </span>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            {/* Big alert header */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex h-16 w-16 rounded-full bg-red-600/20 border-2 border-red-500 items-center justify-center pulse-red"
              >
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </motion.div>
              <h1 className="font-mono text-3xl sm:text-5xl font-bold text-red-500 glitch tracking-tight">
                SECURITY ALERT
              </h1>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 border border-red-500/40 px-3 py-1 text-xs font-mono uppercase tracking-wider text-red-400">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Status: HIGH RISK
              </div>
            </div>

            <p className="text-center text-base sm:text-lg text-foreground/90 leading-relaxed max-w-xl mx-auto">
              Unusual activity associated with your recent event registration
              has been detected. Immediate review is required to secure your
              participation record.
            </p>

            {/* Animated analysis block */}
            <div className="rounded-lg border border-border bg-background/50 p-4 font-mono text-sm">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs uppercase tracking-wider">Analyzing...</span>
              </div>
              <ul className="space-y-2">
                {ANALYSIS_STEPS.map((step, i) => (
                  <li
                    key={step}
                    className={cn(
                      'flex items-center gap-2 transition-colors',
                      i === stepIdx ? 'text-red-400' : 'text-muted-foreground/60',
                    )}
                  >
                    <span className="font-mono text-xs">
                      {i === stepIdx ? '▸' : ' '}
                    </span>
                    <span>{step}</span>
                    {i === stepIdx && <span className="blink">_</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 pt-2">
              {clicked ? (
                <div className="text-center space-y-1">
                  <p className="font-mono text-sm text-muted-foreground">
                    ✓ Notification acknowledged
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Awaiting further instructions from the simulation host...
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={onClicked}
                  className="h-12 px-8 text-base bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] w-full sm:w-auto"
                >
                  Review Security Notification
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
              <p className="text-xs text-muted-foreground/70 max-w-sm text-center">
                You are seeing this page because of your recent Cyber Club
                event registration. No real account or device has been
                compromised.
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 mt-4 font-mono">
          ref: {token.slice(0, 8)}...{token.slice(-4)} · session active
        </p>
      </motion.div>
    </motion.div>
  );
}
