'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Hand,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const REASSURANCES = [
  'No password was collected.',
  'No device was accessed.',
  'No account was compromised.',
  'What you experienced was a controlled demonstration.',
];

export function SimulationReveal() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-[80vh] flex items-center justify-center px-4 py-12"
    >
      {/* Calm emerald glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,185,129,0.18), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-3xl space-y-6">
        <Card className="border-emerald-500/30 bg-card/90 backdrop-blur overflow-hidden">
          {/* Top stripe */}
          <div className="bg-emerald-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              SIMULATION REVEAL
            </div>
            <span className="font-mono text-xs opacity-80">ALL CLEAR</span>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Big reassurance */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex h-20 w-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 items-center justify-center"
              >
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </motion.div>
              <h1 className="font-mono text-3xl sm:text-5xl font-bold text-emerald-500 tracking-tight">
                YOU WERE NOT HACKED.
              </h1>
              <p className="text-lg text-foreground/90 max-w-xl mx-auto">
                This was a controlled cybersecurity awareness simulation
                run by the Cyber Club. Everything you just saw was staged.
              </p>
            </div>

            {/* Reassurance list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASSURANCES.map((r, i) => (
                <motion.div
                  key={r}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-foreground/90">{r}</span>
                </motion.div>
              ))}
            </div>

            {/* STOP THINK VERIFY callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="rounded-lg border-2 border-red-500/50 bg-red-600/10 p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Hand className="h-5 w-5 text-red-500" />
                <span className="font-mono text-2xl font-bold text-foreground tracking-wider">
                  STOP — THINK — VERIFY
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                When you feel pressured, slow down. Verify through a separate
                channel before clicking, calling, or entering credentials.
              </p>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground font-mono">
              Brought to you by <span className="text-foreground font-bold">Cyber Club</span>. Stay vigilant.
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
