'use client';

import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-card/40 border border-border flex items-center justify-center">
              <Image
                src="/cyberclub-optimized.png"
                alt="Cyber Club logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="font-mono font-bold text-foreground">CYBER CLUB</p>
              <p className="text-xs text-muted-foreground">Student Security Community</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-center">
            <Terminal className="h-4 w-4 text-red-500" />
            <p className="font-mono text-sm text-muted-foreground">
              Stay Vigilant.{' '}
              <span className="text-foreground">Build.</span>{' '}
              <span className="text-foreground">Break.</span>{' '}
              <span className="text-foreground">Learn.</span>{' '}
              <span className="text-foreground">Repeat.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/register">Register</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/login">Admin</Link>
            </Button>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} Cyber Club · Built by students, for students
        </p>
      </div>
    </footer>
  );
}
