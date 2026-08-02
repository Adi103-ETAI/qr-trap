'use client';

import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border cyber-grid">
      {/* Radial red glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(220,38,38,0.18), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 lg:py-32 flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs font-mono text-muted-foreground"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 pulse-red" />
          LIVE AWARENESS EXERCISE — CYBER CLUB
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-2xl overflow-hidden bg-card/40 border border-border flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.3)]">
            <Image
              src="/cyberclub-optimized.png"
              alt="Cyber Club logo"
              width={176}
              height={176}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-card border border-border p-1.5">
            <Lock className="h-3.5 w-3.5 text-red-500" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
        >
          <span className="text-foreground">Cyber</span>{' '}
          <span className="text-red-500">Club</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-mono text-lg sm:text-xl text-red-400 tracking-wider"
        >
          &gt; YOU HAVE BEEN HACKED_
          <span className="blink">|</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          A controlled cybersecurity awareness simulation. Register for the
          event, receive a security notification, witness a live social
          engineering demonstration, and learn how to defend yourself
          against real-world attacks. <span className="text-foreground font-medium">No real hacking occurs.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-3 pt-2"
        >
          <Button asChild size="lg" className="w-full sm:w-auto h-12 px-6 text-base bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            <Link href="/register">
              <Shield className="h-5 w-5" />
              Register for Event
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 grid grid-cols-3 gap-4 sm:gap-8 text-center"
        >
          <Stat value="300+" label="Participants" />
          <Stat value="5" label="Attack Vectors" />
          <Stat value="0" label="Real Breaches" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground">{value}</span>
      <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
