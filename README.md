# Cyber Club Awareness Simulation

A controlled cybersecurity awareness exercise for a college **Cyber Club launch event** (300–500 participants). Participants register, receive a simulated "security notification" email, witness a staged alert page designed to mimic social-engineering tactics, then see an educational reveal screen that dissects the psychological levers used against them.

> **No real hacking occurs.** This is a demonstration of social engineering, not an intrusion attempt.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Local Development Setup](#3-local-development-setup)
4. [Sandbox Demo Accounts](#4-sandbox-demo-accounts)
5. [Supabase Migration](#5-supabase-migration-postgres)
6. [Google OAuth Configuration](#6-google-oauth-configuration)
7. [Resend Email Configuration](#7-resend-email-configuration)
8. [Vercel Deployment](#8-vercel-deployment)
9. [Event-Day Operational Checklist](#9-event-day-operational-checklist)
10. [Security Checklist](#10-security-checklist)
11. [Testing Checklist](#11-testing-checklist)
12. [Architecture Diagram](#12-architecture-diagram)

---

## 1. Project Overview

The simulation runs as a finite-state machine with three global states:

```
   IDLE  ──launch──▶  LAUNCHED  ──reveal──▶  REVEALED
   │                     │                       │
   │                     │                       │
   ▼                     ▼                       ▼
 "Please wait"     Red alert page        Educational
  (neutral UI)     (social engineering   reveal screen
                   tactics deployed)
```

**Per-participant flow:**
1. Register on `/register` (Google OAuth in production, demo identity in sandbox).
2. A `Participant` row is created with a hashed simulation token.
3. The host clicks **LAUNCH SIMULATION** in the admin dashboard.
4. Mock emails go out to every participant; the email body contains a unique link `/simulation/{token}`.
5. Participants click the link and land on a red, urgent "SECURITY ALERT" page.
6. The host clicks **REVEAL SIMULATION**.
7. Every open simulation page transitions (via Socket.io broadcast) to the reveal screen, which explains the five social-engineering vectors used: **Fear · Urgency · Authority · Personalization · Curiosity**.

**Educational payload (on the reveal screen):**
- Reassurance list (no password collected, no device accessed, etc.)
- "Attackers often use:" section tying each tactic back to what the participant just experienced.
- A bold **STOP — THINK — VERIFY** callout.
- A short paragraph on phishing & social engineering.

---

## 2. Tech Stack

### Sandbox (this repo, runnable as-is)

| Layer            | Choice                                                       |
| ---------------- | ----------------------------------------------------------- |
| Framework        | Next.js 16 (App Router) + TypeScript 5                       |
| Styling          | Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons         |
| Animation        | Framer Motion                                                |
| Database         | Prisma + SQLite (`db/custom.db`)                             |
| Auth             | NextAuth.js v4 (Credentials provider for admin; optional Google provider) |
| Realtime         | Socket.io mini-service on port 3001                          |
| Email            | Mock email service — logs to console + persists to `EmailLog` table for admin visibility |
| Rate limiting    | In-memory per-IP bucket (`src/lib/rate-limit.ts`)            |
| State (client)   | React hooks + Framer Motion (no global store needed)         |

### Production target (drop-in replacements)

| Sandbox                  | Production equivalent                              | Migration notes                                                       |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------- |
| Prisma + SQLite          | Supabase Postgres                                  | Swap `datasource` provider to `postgresql`, run `prisma migrate deploy` |
| NextAuth Credentials     | NextAuth Google provider                           | Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars             |
| Socket.io mini-service   | Supabase Realtime channels                         | Abstraction lives in `src/lib/realtime/`; replace `client.ts` + `server-broadcast.ts` with `supabase.channel(...)` calls |
| Mock email service       | Resend                                             | Replace `sendSimulationEmail` body in `src/lib/email/send.ts` with `resend.emails.send({...})` — same signature |
| In-memory rate limiter   | Upstash Redis                                      | Swap `src/lib/rate-limit.ts` impl                                    |

---

## 3. Local Development Setup

```bash
# 1. Install deps
bun install

# 2. Install realtime service deps
cd mini-services/realtime-service && bun install && cd ../..

# 3. Apply database schema
bun run db:push

# 4. Set env vars (sandbox defaults are pre-filled in .env)
#    - For production overrides, copy .env.local.example to .env.local
cp .env.local.example .env.local  # optional, edit values

# 5. Start the realtime mini-service (in a separate terminal)
cd mini-services/realtime-service && bun run dev

# 6. Start the Next.js dev server
bun run dev
# App is at http://localhost:3000
```

### Sandbox helper: reset DB between dry-runs

```bash
bun run scripts/reset-db.ts
# Wipes Participants, Events, EmailLogs, Simulations, AdminSessions
# Creates one fresh Simulation row in status=idle
```

---

## 4. Sandbox Demo Accounts

| Role         | How to access                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| **Admin**    | Go to `/admin/login`. Password: `cyberclub-admin-demo-2026` (set via `ADMIN_SECRET` env var).         |
| **Participant (demo)** | Go to `/register` → "Continue as Demo Participant". A throwaway `demo-{rand}@cyberclub.local` identity is created. The simulation URL is displayed on the success page (sandbox-only). |
| **Participant (Google)** | If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set, the "Continue with Google" button is shown. Otherwise a notice explains how to enable it. |

### Quick demo flow

1. Open `/` (landing page).
2. Click **Register for Event** → /register.
3. Click **Continue as Demo Participant** → success page shows simulation URL.
4. Copy the URL, open in a new tab → /simulation/{token} → "Simulation has not started yet" (idle).
5. Open `/admin/login` in another tab → enter password → dashboard.
6. Click **LAUNCH SIMULATION** → confirm. The participant tab transitions to the red alert page (via Socket.io broadcast).
7. Click the alert's CTA button (records `simulation_clicked`).
8. Back in admin, click **REVEAL SIMULATION** → confirm. The participant tab transitions to the reveal screen.
9. Watch the admin dashboard's **Live Activity** stream update in real time.

---

## 5. Supabase Migration (Postgres)

1. **Create a Supabase project** at https://supabase.com and copy the connection string (Settings → Database → Connection string, URI format).
2. **Edit `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. **Edit `.env`** (or `.env.local`):
   ```
   DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"
   ```
4. **Create and apply the migration**:
   ```bash
   bunx prisma migrate dev --name init
   # or, for an already-provisioned DB:
   bunx prisma migrate deploy
   ```
5. **(Recommended) Enable Row Level Security** on every table. The app already enforces auth server-side (admin session cookie + requireAdmin helper), so RLS is a defense-in-depth layer:
   ```sql
   ALTER TABLE "Participant"        ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Simulation"         ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "SimulationEvent"    ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "EmailLog"           ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "AdminSession"       ENABLE ROW LEVEL SECURITY;
   ```
6. The Prisma Client used by the Next.js server connects with the service-role key (no RLS restrictions); web clients never talk to Supabase directly.

---

## 6. Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create (or select) a project, then **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. **Authorized JavaScript origins**: `http://localhost:3000` (dev) and your production URL (e.g. `https://cyberclub.example.com`).
5. **Authorized redirect URIs**: `${APP_URL}/api/auth/callback/google` — e.g. `http://localhost:3000/api/auth/callback/google`.
6. Copy the **Client ID** and **Client Secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxx
   ```
7. Restart `bun run dev`. The "Continue with Google" button will now appear on `/register`.

> **Note**: When env vars are missing, the registration page automatically falls back to the demo flow. No code changes needed.

---

## 7. Resend Email Configuration

The mock email service is at `src/lib/email/send.ts`. Its signature is:

```ts
sendSimulationEmail({
  to: string,
  name?: string | null,
  token: string,
  participantId: string,
}): Promise<{ success: boolean; error?: string; emailLogId?: string }>
```

**To switch to Resend in production:**

1. Sign up at https://resend.com and get an API key.
2. Set `RESEND_API_KEY` in `.env.local`.
3. Install the SDK: `bun add resend`.
4. Replace the body of `sendSimulationEmail` in `src/lib/email/send.ts`:

```ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendSimulationEmail({ to, name, token, participantId }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/simulation/${token}`;
  const { data, error } = await resend.emails.send({
    from: 'Cyber Club <no-reply@cyberclub.dev>',
    to,
    subject: 'Security Notification — Event Registration',
    html: buildHtml(name, url),   // keep the existing builder
    text: buildText(name, url),
  });
  if (error) return { success: false, error: error.message };

  // Still persist an EmailLog row for audit (omit `tokenUsed` in prod)
  await db.emailLog.create({
    data: {
      participantId,
      toEmail: to,
      subject: 'Security Notification — Event Registration',
      body: '(sent via Resend)',
      tokenUsed: '',               // DO NOT store the raw token in production
      status: 'sent',
    },
  });
  return { success: true, emailLogId: data?.id };
}
```

5. **Important**: In production, set `tokenUsed: ''` (or remove the field entirely) so the raw token is never persisted in `EmailLog`. The sandbox stores it only so admins can copy a test link.

---

## 8. Vercel Deployment

1. Push the repo to GitHub.
2. In Vercel, **New Project → Import** your repo.
3. **Framework preset**: Next.js. **Build command**: `next build` (the default). **Install command**: `bun install`.
4. **Environment variables** (set all):
   - `DATABASE_URL` — your Supabase Postgres connection string.
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — your Vercel URL (e.g. `https://cyberclub.vercel.app`).
   - `NEXT_PUBLIC_APP_URL` — same as `NEXTAUTH_URL`.
   - `ADMIN_SECRET` — a strong admin password.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — from step 6.
   - `RESEND_API_KEY` — from step 7.
5. **Deploy**.
6. **Realtime**: Vercel is serverless, so the in-process Socket.io mini-service won't work as-is. Either:
   - Deploy the realtime service to a long-running host (Render, Railway, Fly.io) and update `REALTIME_INTERNAL_URL` env var; **or**
   - Swap to Supabase Realtime channels (recommended — see `src/lib/realtime/` for the abstraction boundary).

---

## 9. Event-Day Operational Checklist

**T-30 minutes (dry-run):**
- [ ] `bun run scripts/reset-db.ts` to start with a clean DB.
- [ ] Open `/admin/login` and confirm you can log in.
- [ ] Open `/register` and submit one demo registration.
- [ ] Confirm the simulation URL appears on the success page.
- [ ] Open the simulation URL in another tab — should show "Simulation has not started".
- [ ] Click **LAUNCH SIMULATION** in admin dashboard.
- [ ] Confirm the simulation tab transitions to the red alert.
- [ ] Click **REVEAL SIMULATION** — confirm transition to the reveal screen.
- [ ] Confirm the Live Activity stream shows the full event sequence.
- [ ] Reset DB again.

**T-5 minutes:**
- [ ] Verify the realtime mini-service is running: `curl http://localhost:3001/` should return a JSON response.
- [ ] Verify the dev server has no errors in `dev.log`.

**During event:**
- [ ] Participants register at `/register`.
- [ ] Watch the admin dashboard's **Live Activity** stream as registrations arrive.
- [ ] When ready, click **LAUNCH SIMULATION**. Watch emails queue and send.
- [ ] Watch **Simulation Opened** counter climb as participants click.
- [ ] Deliver your talk for ~3–5 minutes while the alert is live.
- [ ] Click **REVEAL SIMULATION**. Watch transitions complete.
- [ ] Walk through the reveal screen with the audience.

**Post-event:**
- [ ] Export the `EmailLog` and `SimulationEvent` tables if you want to keep a record.
- [ ] Run `bun run scripts/reset-db.ts` to wipe participant PII.
- [ ] Optionally rotate `ADMIN_SECRET` and `NEXTAUTH_SECRET`.

---

## 10. Security Checklist

- [x] **Token hashing** — `Participant.simulationTokenHash` stores only the SHA-256 of the 64-char hex token. Lookup is hash-first.
- [x] **No raw tokens on the participant row** — the raw token only lives in `EmailLog.tokenUsed` for sandbox demo visibility. Production should set this to `''`.
- [x] **Constant-time password comparison** — `crypto.timingSafeEqual` in both the admin login route and the NextAuth Credentials provider.
- [x] **HTTP-only admin session cookie** — `admin_session` cookie is `httpOnly: true`, `sameSite: 'lax'`, 24h expiry.
- [x] **Zod validation on every API body** — see each route in `src/app/api/`.
- [x] **Admin routes protected** — `getAdminSession()` check on every `/api/admin/*` and `/api/simulation/launch|reveal` route.
- [x] **Public simulation endpoints rate-limited** — 30 req/min/IP for `opened`/`clicked`, 60 req/min/IP for `status`.
- [x] **Generic error messages to clients** — detailed errors only in `console.error` server-side.
- [x] **No secrets exposed to client** — only `NEXT_PUBLIC_APP_URL` is public.
- [x] **Security headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off) via `next.config.ts`.
- [x] **Token format validation** — `isValidTokenFormat` regex-checks the 64-hex-char shape before any DB lookup.
- [x] **.gitignore** — `.env`, `.env.local`, `db/`, `node_modules/` are all ignored.
- [x] **No `console.log` of raw tokens in production code paths** — the mock email service logs the URL only server-side (development aid).

### Production-only hardening (not in sandbox)

- [ ] Enable Supabase RLS on every table (defense-in-depth).
- [ ] Move admin session storage to a TTL'd Redis key (so it survives serverless cold starts).
- [ ] Replace in-memory rate limiter with Upstash Redis sliding-window.
- [ ] Add CSP header (Content-Security-Policy) — left out of sandbox because of inline styles.
- [ ] Rotate `NEXTAUTH_SECRET` and `ADMIN_SECRET` post-event.
- [ ] Add audit log for admin actions (launch/reveal).

---

## 11. Testing Checklist

Manual test scripts for the full flow:

- [ ] **Landing page** (`/`) renders, all sections visible, CTA buttons navigate.
- [ ] **Register — demo flow**: lands on success page with simulation URL.
- [ ] **Register — Google flow** (if configured): Google redirect → success page.
- [ ] **Simulation — invalid token**: `/simulation/junk` → "Invalid or expired link".
- [ ] **Simulation — idle state**: valid token + status=idle → "Simulation has not started yet".
- [ ] **Simulation — launched state**: red alert UI, glitching heading, animated analysis block, CTA records `simulation_clicked`.
- [ ] **Simulation — revealed state**: green reveal screen, all 5 attack vectors shown, STOP-THINK-VERIFY callout.
- [ ] **Realtime transition**: open simulation tab, click LAUNCH in admin → tab flips idle → launched without page reload.
- [ ] **Realtime transition**: click REVEAL in admin → tab flips launched → revealed with Framer Motion animation.
- [ ] **Polling fallback**: kill the realtime service, refresh simulation tab → polling takes over (POLLING badge appears), still transitions on launch/reveal.
- [ ] **Admin login**: wrong password → 401, correct password → redirect to dashboard.
- [ ] **Admin dashboard**: 5 stat cards, status badge color matches state (gray/amber/emerald).
- [ ] **Admin dashboard — Live Activity**: events appear within 3 seconds.
- [ ] **Admin dashboard — Email Log**: copy button copies the URL, open button opens simulation in new tab.
- [ ] **Admin logout**: clears cookie, redirects to login, subsequent /api/admin/stats returns 401.
- [ ] **Rate limit**: 31 rapid requests to `/api/simulation/opened` from the same IP → 429 on the 31st.

Automated smoke test script: see `/tmp/e2e-test.sh` (created during development; not committed).

---

## 12. Architecture Diagram

```
 ┌────────────────────────────────────────────────────────────────────┐
 │                         BROWSER (participant)                       │
 │                                                                     │
 │   /register  ───────▶ /simulation/{token}                          │
 │      │                       │                                      │
 │      │ demoRegister          │ SimulationClient                     │
 │      │ (server action)       │  - socket.io client (port 3001)      │
 │      ▼                       │  - polling /api/simulation/status    │
 │   Participant row            │    every 5s (fallback)               │
 │   + SimulationEvent          │  - POST /api/simulation/opened       │
 │     (registered)             │  - POST /api/simulation/clicked      │
 └──────────────────────────────┼─────────────────────────────────────┘
                                │
                                │ HTTPS (relative paths only)
                                ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │                    NEXT.JS 16 (port 3000)                           │
 │                                                                     │
 │  Public routes                  Admin routes (requireAdmin)         │
 │  ─────────────                  ─────────────────────—              │
 │  GET  /                         GET  /admin/login                   │
 │  GET  /register                 GET  /admin/dashboard                │
 │  GET  /simulation/[token]                                            │
 │                                                                     │
 │  API routes                                                         │
 │  ────────────                                                       │
 │  POST /api/admin/login           (Credentials → AdminSession)       │
 │  POST /api/admin/logout                                             │
 │  GET  /api/admin/stats          ◀── auto-polled every 3s            │
 │  GET  /api/admin/events                                            │
 │  GET  /api/admin/emails                                            │
 │  POST /api/simulation/launch    ─▶ broadcastLaunch()                │
 │  POST /api/simulation/reveal    ─▶ broadcastReveal()                │
 │  GET  /api/simulation/status    (public, polling fallback)          │
 │  POST /api/simulation/opened    (public, idempotent)                │
 │  POST /api/simulation/clicked   (public, idempotent)                │
 │  POST /api/participants         (internal)                          │
 │  POST /api/email/send           (internal/admin)                    │
 │  GET  /api/auth/[...nextauth]   (NextAuth Google + Credentials)     │
 │                                                                     │
 │  Lib                                                                │
 │  ────                                                               │
 │  db (Prisma)  tokens  state  email/send  auth/admin  auth/nextauth  │
 │  rate-limit  realtime/server-broadcast                              │
 └──────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ socket.io-client (trusted broadcaster)
                                ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │            REALTIME MINI-SERVICE (Socket.io, port 3001)             │
 │                                                                     │
 │  - Accepts browser connections (path: "/", transports: ws+polling)  │
 │  - Accepts trusted Next.js broadcaster (emits "admin:broadcast")    │
 │  - Re-broadcasts "simulation:launched" / "simulation:reveal"        │
 │    to ALL connected sockets.                                        │
 │                                                                     │
 │  PRODUCTION: replace with Supabase Realtime channels.               │
 └────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │                 DATABASE (SQLite sandbox / Supabase prod)           │
 │                                                                     │
 │  Participant         id, authUserId, email, name,                   │
 │                      simulationTokenHash (SHA-256), flags, dates    │
 │  Simulation          id, status (idle|launched|revealed), dates     │
 │  SimulationEvent     id, participantId, eventType, createdAt, meta  │
 │  EmailLog            id, participantId, toEmail, subject, body,     │
 │                      tokenUsed (SANDBOX ONLY), status               │
 │  AdminSession        id, tokenHash (SHA-256), createdAt, expiresAt  │
 └────────────────────────────────────────────────────────────────────┘
```

### Simulation state machine

```
       ┌──────────┐  POST /api/simulation/launch  ┌───────────┐  POST /api/simulation/reveal  ┌──────────┐
       │   IDLE   │ ────────────────────────────▶ │ LAUNCHED  │ ────────────────────────────▶ │ REVEALED │
       │          │                                │           │                                │          │
       │ (neutral │                                │ (red alert│                                │ (green   │
       │   UI)    │                                │   UI)     │                                │  reveal) │
       └──────────┘                                └───────────┘                                └──────────┘
            │                                          │                                            │
            │ broadcastLaunch()                        │ broadcastReveal()                          │
            ▼                                          ▼                                            ▼
       browser client                              browser client                            browser client
       idle → launched                             launched → revealed                        (already revealed)
```

---

## License

Internal use only — Cyber Club awareness exercise. Not for redistribution.

## Credits

Built for the Cyber Club launch event. Stay vigilant. **Stop. Think. Verify.**
