import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Calendar,
  Users,
  BookOpen,
  Terminal,
  Bell,
  ArrowUpRight,
  MessageSquare,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { getRegistrationSession } from '@/app/register/actions';
import { redirect } from 'next/navigation';
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';

export default async function DashboardPage() {
  const session = await getRegistrationSession();
  if (!session) {
    redirect('/register');
  }

  const participant = await db.participant.findUnique({
    where: { authUserId: session.authUserId },
    select: {
      name: true,
      email: true,
      department: true,
      registeredAt: true,
    },
  });

  if (!participant) {
    redirect('/register/details');
  }

  const displayName =
    participant.name?.trim() ||
    participant.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="flex-1 flex flex-col">
      {/* Top bar with Settings button */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-3">
            <DashboardSettings
              name={participant.name}
              email={participant.email}
              department={participant.department}
            />
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

          {/* Quick actions — interactive buttons instead of passive stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction icon={MessageSquare} label="Discord" sublabel="Join the chat" />
            <QuickAction icon={BookOpen} label="Resources" sublabel="12 guides" />
            <QuickAction icon={Terminal} label="Practice" sublabel="CTF archive" />
            <QuickAction icon={Users} label="Members" sublabel="300+ joined" />
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
                rsvp
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
        </div>
      </section>
    </main>
  );
}

function QuickAction({
  icon: Icon,
  label,
  sublabel,
}: {
  icon: typeof MessageSquare;
  label: string;
  sublabel: string;
}) {
  return (
    <button className="rounded-xl border border-border bg-card/60 backdrop-blur p-4 text-left hover:border-red-500/40 hover:bg-card transition-colors group">
      <Icon className="h-5 w-5 text-red-500 mb-2" />
      <p className="font-semibold text-sm text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </button>
  );
}

function EventRow({
  title,
  date,
  location,
  tag,
  highlight,
  rsvp,
}: {
  title: string;
  date: string;
  location: string;
  tag: string;
  highlight?: boolean;
  rsvp?: boolean;
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
      {rsvp ? (
        <Button size="sm" variant="outline" className="shrink-0 h-8">
          <Check className="h-3.5 w-3.5" />
          I&apos;ll be there
        </Button>
      ) : (
        !highlight && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground font-mono">
            {tag}
          </span>
        )
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
