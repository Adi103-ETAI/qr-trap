'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Zap,
  BadgeAlert,
  Fingerprint,
  HelpCircle,
} from 'lucide-react';

const vectors = [
  {
    icon: Flame,
    name: 'Fear',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    desc: 'The alert implies something bad has already happened. Fear narrows your focus and short-circuits careful evaluation.',
  },
  {
    icon: Zap,
    name: 'Urgency',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    desc: '“Review immediately.” Urgency pressures you to act before verifying. Real services rarely demand instant action.',
  },
  {
    icon: BadgeAlert,
    name: 'Authority',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    desc: 'Official-looking branding, badges, and serious-sounding language mimic a trusted institution to bypass suspicion.',
  },
  {
    icon: Fingerprint,
    name: 'Personalization',
    color: 'text-fuchsia-500',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    desc: 'The message references your recent event registration — a detail that makes it feel legitimate and targeted.',
  },
  {
    icon: HelpCircle,
    name: 'Curiosity',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    desc: '“Unusual activity detected” invites you to click to find out more. Curiosity is a powerful click trigger.',
  },
];

export function AttackVectors() {
  return (
    <section className="border-b border-border cyber-grid-fine">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14">
          <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-2">
            {'// 03 — Education'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Attack Vectors Demonstrated
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            These are the same five psychological levers used by real
            phishing campaigns every day. Recognising them is your first
            line of defence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vectors.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card/60 backdrop-blur p-5 hover:border-red-500/40 transition-colors"
            >
              <div className={`inline-flex h-10 w-10 rounded-lg ${v.bg} ${v.border} border items-center justify-center mb-3`}>
                <v.icon className={`h-5 w-5 ${v.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 font-mono">{v.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-xl border-2 border-red-500/50 bg-red-600/10 p-5 flex flex-col justify-center"
          >
            <p className="font-mono text-xs text-red-400 uppercase tracking-widest mb-2">Callout</p>
            <p className="font-mono text-2xl font-bold text-foreground leading-tight">
              STOP — THINK — VERIFY
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              When you feel pressured, slow down. Verify through a separate
              channel before clicking, calling, or entering credentials.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
