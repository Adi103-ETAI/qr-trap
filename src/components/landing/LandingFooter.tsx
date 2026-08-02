'use client';

import { motion } from 'framer-motion';
import { Shield, Terminal } from 'lucide-react';
import Link from 'next/link';
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
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-mono font-bold text-foreground">CYBER CLUB</p>
              <p className="text-xs text-muted-foreground">Awareness Simulation Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-center">
            <Terminal className="h-4 w-4 text-red-500" />
            <p className="font-mono text-sm text-muted-foreground">
              Stay vigilant. <span className="text-foreground">Stop.</span>{' '}
              <span className="text-foreground">Think.</span>{' '}
              <span className="text-foreground">Verify.</span>
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
          © {new Date().getFullYear()} Cyber Club · This is a controlled
          awareness exercise · No real systems were compromised
        </p>
      </div>
    </footer>
  );
}
