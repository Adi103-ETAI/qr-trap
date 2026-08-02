import Link from 'next/link';
import { Shield, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { GoogleSignInButton } from '@/components/registration/GoogleSignInButton';

export default function RegisterPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to landing
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md overflow-hidden bg-card/40 border border-border flex items-center justify-center">
              <Image
                src="/cyberclub-optimized.png"
                alt="Cyber Club logo"
                width={28}
                height={28}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-mono font-bold text-sm">CYBER CLUB</span>
          </div>
        </div>
      </header>

      <section className="flex-1 cyber-grid flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 sm:px-6 py-12 sm:py-16 w-full">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-card/40 border border-border flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                <Image
                  src="/cyberclub-optimized.png"
                  alt="Cyber Club logo"
                  width={112}
                  height={112}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
                <span className="text-foreground">Cyber</span>{' '}
                <span className="text-red-500">Club</span>
              </h1>
              <p className="text-muted-foreground">
                Sign in to register for the launch event.
              </p>
            </div>

            {/* Sign-in card */}
            <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-6 space-y-4">
              <GoogleSignInButton />
            </div>

            {/* Trust line */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3 w-3 mr-1 text-red-500" />
              We only collect your name and email. No passwords. No payment info.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
