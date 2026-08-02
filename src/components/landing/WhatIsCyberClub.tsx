'use client';

import { motion } from 'framer-motion';
import { Terminal, Network, BookOpen, Users } from 'lucide-react';

const pillars = [
  {
    icon: Network,
    title: 'Build',
    desc: 'Hands-on sessions on networking, web tech, and the systems that power the internet — from the ground up.',
  },
  {
    icon: Terminal,
    title: 'Break',
    desc: 'CTF challenges, wargames, and guided teardowns where you learn how attackers think by stepping into their shoes.',
  },
  {
    icon: BookOpen,
    title: 'Learn',
    desc: 'Talks, workshops, and reading circles on the ideas shaping security today — from cryptography to human factors.',
  },
  {
    icon: Users,
    title: 'Connect',
    desc: 'A room full of people who get it. Mentors, peers, and friends to learn with, build with, and grow with.',
  },
];

export function WhatIsCyberClub() {
  return (
    <section className="border-b border-border cyber-grid-fine">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14">
          <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-2">
            {'// 01 — The Club'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What is Cyber Club?</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            A student-run community for anyone curious about how the digital
            world really works — the protocols, the vulnerabilities, the
            people, and the craft of keeping systems safe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl border border-border bg-card/60 backdrop-blur p-5 hover:border-red-500/40 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center">
                  <p.icon className="h-5 w-5 text-red-500" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 rounded-xl border border-border bg-background/40 p-6 sm:p-8"
        >
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            <span className="text-red-500">&gt;</span> Whether you&apos;ve never
            opened a terminal or you&apos;ve been breaking things since you
            were twelve — there&apos;s a seat for you here. The launch event is
            the first night of the rest of the semester.{' '}
            <span className="text-foreground">Show up. Pay attention. Trust nothing.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
