import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, ChevronLeft, Lock, MailOpen, Clock, Eye } from 'lucide-react';
import { GoogleSignInButton } from '@/components/registration/GoogleSignInButton';
import { DemoRegisterCard } from '@/components/registration/DemoRegisterCard';
import { SuccessActions } from '@/components/registration/SuccessActions';
import { consumeDemoToken } from './actions';
import { consumePostSignupToken } from '@/lib/auth/nextauth';
import { headers } from 'next/headers';

const googleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status;
  const headerList = await headers();
  const host = headerList.get('host') ?? 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') ?? 'http';

  let demoUrl: string | null = null;
  if (status === 'success') {
    // Either the demo flow cookie OR the NextAuth Google flow cookie.
    const token = (await consumeDemoToken()) ?? (await consumePostSignupToken());
    if (token) {
      demoUrl = `${APP_URL}/simulation/${token}`;
    }
  }

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
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-mono font-bold text-sm">CYBER CLUB</span>
          </div>
        </div>
      </header>

      <section className="flex-1 cyber-grid">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
          {status === 'success' ? (
            <SuccessView demoUrl={demoUrl} />
          ) : (
            <RegisterView googleConfigured={googleConfigured} />
          )}
        </div>
      </section>
    </main>
  );
}

function RegisterView({ googleConfigured }: { googleConfigured: boolean }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Lock className="h-3 w-3" />
          STEP 01 — REGISTRATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Register for the Event</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sign in to confirm your participation in the Cyber Club launch
          awareness simulation. We collect only your name and email.
        </p>
      </div>

      <Card className="bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Choose how you'd like to register.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleConfigured ? (
            <GoogleSignInButton />
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">
              <p className="font-medium">Google OAuth is not configured in this environment.</p>
              <p className="text-xs mt-1 text-amber-200/80">
                Use the demo flow below, or set <code className="font-mono">GOOGLE_CLIENT_ID</code> and <code className="font-mono">GOOGLE_CLIENT_SECRET</code> env vars for production.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <DemoRegisterCard />
        </CardContent>
      </Card>

      <PrivacyNotice />
    </div>
  );
}

function SuccessView({ demoUrl }: { demoUrl: string | null }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/40 mx-auto">
          <MailOpen className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Registration Complete</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          You're on the list. When the simulation launches at the event,
          you'll receive a security notification email containing your
          personal simulation link.
        </p>
      </div>

      <Card className="bg-card/70 backdrop-blur">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoStep
              icon={Clock}
              title="Wait for launch"
              desc="The host will launch the simulation during the event."
            />
            <InfoStep
              icon={MailOpen}
              title="Check your inbox"
              desc="An email titled “Security Notification” will arrive."
            />
            <InfoStep
              icon={Eye}
              title="Observe your reaction"
              desc="Notice how the notification makes you feel. That's the lesson."
            />
          </div>
        </CardContent>
      </Card>

      {demoUrl && <SuccessActions simulationUrl={demoUrl} />}

      <div className="text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Return to landing</Link>
        </Button>
      </div>
    </div>
  );
}

function InfoStep({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Clock;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <Icon className="h-5 w-5 text-red-500 mb-2" />
      <p className="font-medium text-sm text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <Card className="bg-card/40 border-dashed">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Privacy</p>
            <p>
              We store only your name, email, and a hashed simulation token.
              Tokens are 64-character cryptographic random values; we never
              store the raw token on the participant record (only its SHA-256
              hash). The simulation URL is the only way to open your page.
            </p>
            <p>
              You can request deletion of your data after the event by
              contacting the Cyber Club organizers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
