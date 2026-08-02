'use client';

import { motion } from 'framer-motion';
import { Clock, ShieldCheck } from 'lucide-react';

export function SimulationIdle() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/40 border border-border mx-auto"
        >
          <Clock className="h-9 w-9 text-muted-foreground" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Simulation has not started yet
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Please wait for the event to begin. The simulation will activate
            automatically when the host launches it.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-mono text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60" />
          STATUS: <span className="text-foreground">IDLE</span>
        </div>

        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          This page will refresh automatically when the simulation starts.
        </p>
      </div>
    </motion.div>
  );
}
