import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Calendar,
  Users,
  BookOpen,
  Terminal,
  Award,
  Bell,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { getRegistrationSession } from '@/app/register/actions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getRegistrationSession();
  if (!session) {
    redirect('/register');
  }

  // Look up the participant record (if it exists — they may have completed
  // registration, or they may be a returning visitor).
  const participant = await db.participant.findUnique({
    where: { authUserId: session.authUserId },
    select: {
      name: true,
      email: true,
      department: true,
      registeredAt: true,
    },
  });

  // If they haven't completed registration yet (no participant row), bounce to details.
  if (!participant) {
    redirect('/register/details');
  }

  const displayName =
    participant.name?.trim() ||
    participant.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="flex-1 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Home
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

      <section className="flex-1 cyber-grid">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          {/* Welcome banner */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-background/40 border border-border flex items-center justify-center shrink-0">
                <Image
                  src="/cyberclub-optimized.png"
                  alt="Cyber Club logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-1">
                  {'// Member Dashboard'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome, <span className="text-red-500">{displayName}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;re registered for the Cyber Club launch.
                  {participant.department && (
                    <> Department: <span className="text-foreground">{participant.department}</span>.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Calendar} label="Member since" value={formatDate(participant.registeredAt)} />
            <StatCard icon={Users} label="Members" value="300+" />
            <StatCard icon={BookOpen} label="Resources" value="12" />
            <StatCard icon={Award} label="Your level" value="New" />
          </div>

          {/* Upcoming events */}
          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-red-500" />
                Upcoming Events
              </CardTitle>
              <CardDescription>What&apos;s happening at Cyber Club.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <EventRow
                title="Cyber Club Launch Night"
                date="Tonight · 6:00 PM"
                location="Main Auditorium"
                tag="Flagship"
                highlight
              />
              <EventRow
                title="Intro to Linux & the Terminal"
                date="Next week · TBA"
                location="Lab 3"
                tag="Workshop"
              />
              <EventRow
                title="CTF Mini-Challenge"
                date="In 2 weeks · TBA"
                location="Online"
                tag="CTF"
              />
              <EventRow
                title="How the Web Really Works"
                date="In 3 weeks · TBA"
                location="Seminar Hall"
                tag="Talk"
              />
            </CardContent>
          </Card>

          {/* Two-column: Resources + Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resources */}
            <Card className="bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="h-5 w-5 text-red-500" />
                  Starter Resources
                </CardTitle>
                <CardDescription>Beginner-friendly stuff to read before launch night.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ResourceLink title="The Cyber Club manifesto" desc="What we're about. 5 min read." />
                <ResourceLink title="Set up your terminal in 10 minutes" desc="Mac, Linux, Windows." />
                <ResourceLink title="CTF vocabulary cheat sheet" desc="pwn, rev, crypto, web, forensics." />
                <ResourceLink title="Recommended YouTube channels" desc="Curated by senior members." />
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-red-500" />
                  Announcements
                </CardTitle>
                <CardDescription>Latest from the club.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnnouncementItem
                  time="2 days ago"
                  text="Launch night date is locked in. Bring your laptop and your curiosity."
                />
                <AnnouncementItem
                  time="5 days ago"
                  text="We're opening mentor sign-ups. Senior members will mentor newcomers through their first CTF."
                />
                <AnnouncementItem
                  time="1 week ago"
                  text="Discord server is live. Invite link will be emailed to registered members before launch night."
                />
              </CardContent>
            </Card>
          </div>

          {/* Call to action */}
          <Card className="bg-card/60 backdrop-blur border-dashed">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">See you at the launch.</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Bring a laptop, bring a friend, and bring your curiosity.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">
                    Back to home
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-red-500" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function EventRow({
  title,
  date,
  location,
  tag,
  highlight,
}: {
  title: string;
  date: string;
  location: string;
  tag: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
        highlight
          ? 'border-red-500/40 bg-red-500/5'
          : 'border-border bg-background/40'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">{title}</p>
          {highlight && (
            <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300 font-mono">
              {tag}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {date} · {location}
        </p>
      </div>
      {!highlight && (
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground font-mono">
          {tag}
        </span>
      )}
    </div>
  );
}

function ResourceLink({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-background/40 transition-colors cursor-pointer">
      <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function AnnouncementItem({ time, text }: { time: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-xs font-mono text-muted-foreground mb-1">{time}</p>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
}
