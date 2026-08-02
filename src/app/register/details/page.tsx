import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Shield, AlertCircle } from 'lucide-react';
import { getRegistrationSession } from '../actions';
import { redirect } from 'next/navigation';
import { DepartmentForm } from '@/components/registration/DepartmentForm';

const DEPARTMENTS = [
  'Law',
  'Nursing',
  'Physiotherapy',
  'Commerce',
  'Mass Communication',
  'Computer Science',
  'Social Work',
  'Hotel Management',
  'Other',
];

export default async function DetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const session = await getRegistrationSession();

  // If no active session (no Google OAuth, no demo cookie), bounce to /register.
  if (!session) {
    redirect('/register');
  }

  const displayName =
    session.name?.trim() ||
    session.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="flex-1 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back
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
            {/* Welcome */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-mono text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                SIGNED IN
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome, <span className="text-red-500">{displayName}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Almost there. Pick your department to finish registering.
              </p>
            </div>

            {/* Department form */}
            <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-6">
              {sp.error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    {sp.error === 'missing_department'
                      ? 'Please select your department.'
                      : decodeURIComponent(sp.error)}
                  </span>
                </div>
              )}
              <DepartmentForm departments={DEPARTMENTS} defaultName={displayName} />
            </div>

            {/* Trust line */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3 w-3 mr-1 text-red-500" />
              We use your department to send you relevant club updates. That&apos;s it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
