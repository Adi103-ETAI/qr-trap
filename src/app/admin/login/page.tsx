import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/admin';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { Shield, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // Already logged in -> straight to dashboard.
  const session = await getAdminSession();
  if (session) {
    redirect('/admin/dashboard');
  }

  return (
    <main className="flex-1 flex flex-col cyber-grid">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-mono font-bold text-sm">CYBER CLUB</span>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 mx-auto">
              <Shield className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
            <p className="text-sm text-muted-foreground">
              Enter the admin password to access the simulation control dashboard.
            </p>
          </div>

          <AdminLoginForm />

          <p className="mt-6 text-center text-xs text-muted-foreground font-mono">
            Sandbox demo password:{' '}
            <code className="text-foreground bg-card/60 px-1.5 py-0.5 rounded">
              cyberclub-admin-demo-2026
            </code>
          </p>
        </div>
      </section>
    </main>
  );
}
