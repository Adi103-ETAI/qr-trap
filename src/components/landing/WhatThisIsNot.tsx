'use client';

import { motion } from 'framer-motion';
import { ShieldX, KeyRound, HardDrive, Bug } from 'lucide-react';

const items = [
  {
    icon: KeyRound,
    title: 'No passwords collected',
    desc: 'We never ask for, store, or transmit any of your account passwords.',
  },
  {
    icon: HardDrive,
    title: 'No device access',
    desc: 'The simulation runs entirely in your browser. Nothing is installed on your device.',
  },
  {
    icon: ShieldX,
    title: 'No real hacking',
    desc: 'This is a demonstration of social engineering — not an actual intrusion attempt.',
  },
  {
    icon: Bug,
    title: 'No malware deployed',
    desc: 'There are no payloads, no exploits, and no malicious code anywhere in this exercise.',
  },
];

export function WhatThisIsNot() {
  return (
    <section className="border-b border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14">
          <p className="font-mono text-xs text-emerald-500 uppercase tracking-widest mb-2">
            {'// 02 — Trust'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What This Is <span className="text-emerald-500">Not</span></h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            We want to be very clear about the boundaries of this exercise so
            you can participate with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-xl border border-border bg-background/40 p-5"
            >
              <div className="shrink-0 h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <it.icon className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{it.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
