'use client';

import { motion } from 'framer-motion';
import { UserPlus, Mail, AlertTriangle, GraduationCap } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Register',
    desc: 'Sign up for the Cyber Club launch event using your Google account (or a demo identity).',
  },
  {
    icon: Mail,
    title: 'Receive Notification',
    desc: 'A security notification email arrives, flagged as unusual activity tied to your registration.',
  },
  {
    icon: AlertTriangle,
    title: 'Witness the Simulation',
    desc: 'Click the link. A red alert page appears with urgency cues designed to mimic a real breach.',
  },
  {
    icon: GraduationCap,
    title: 'Learn the Lesson',
    desc: 'The simulation reveals itself. We dissect the social-engineering tactics that were used.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border cyber-grid-fine">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14">
          <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-2">
            {'// 01 — Process'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Four stages. Total elapsed time per participant: under five minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl border border-border bg-card/60 backdrop-blur p-5 hover:border-red-500/40 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-red-500" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
