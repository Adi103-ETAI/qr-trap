// force-recompile: 1785699479.2593207
'use server';

import { db } from '@/lib/db';
import { generateToken, hashToken } from '@/lib/simulation/tokens';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';

/**
 * Registration flow (no spoilers):
 *
 *  1. User clicks "Continue with Google" on /register.
 *  2. Google OAuth (or demo flow) authenticates them.
 *  3. They land on /register/details — we greet them by name and ask
 *     them to pick their department.
 *  4. They submit the form. The completeRegistration() server action
 *     below creates the Participant row (with department + freshly
 *     generated hashed token) and redirects them to /dashboard.
 *
 * The dashboard is a clean Cyber Club member dashboard — no mention of
 * simulation, no "we sent you an email", nothing that would tip them off.
 */

const DEMO_SESSION_COOKIE = 'demo_signup_session';
const DEMO_SESSION_TTL_S = 10 * 60; // 10 minutes — long enough to fill the form

export interface DemoSessionStartResult {
  success: boolean;
  error?: string;
}

/**
 * Sandbox-only demo: starts a fake "authenticated" session by stashing
 * a generated name + email in a cookie. The user is then redirected to
 * /register/details just like the Google flow.
 *
 * In production (Google OAuth configured), this is unused — the NextAuth
 * Google provider handles authentication.
 */
export async function startDemoRegistration(name?: string): Promise<DemoSessionStartResult> {
  try {
    const rand = Math.random().toString(36).slice(2, 10);
    const email = `demo-${rand}@cyberclub.local`;
    const finalName = name?.trim() || `Demo Participant ${rand.slice(0, 4)}`;

    const store = await cookies();
    store.set(
      DEMO_SESSION_COOKIE,
      JSON.stringify({ email, name: finalName, authUserId: `demo:${rand}` }),
      {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: DEMO_SESSION_TTL_S,
      },
    );

    return { success: true };
  } catch (err) {
    console.error('[demo-signup-start] failed:', err);
    return { success: false, error: 'Could not start demo registration. Please try again.' };
  }
}

export interface RegistrationDetails {
  email: string;
  name: string | null;
  authUserId: string;
}

/**
 * Read the current registration session — either from NextAuth (Google)
 * or from the demo cookie. Returns null if no session is active, which
 * means the user should be bounced back to /register.
 */
export async function getRegistrationSession(): Promise<RegistrationDetails | null> {
  // 1. Try NextAuth (Google OAuth) session first.
  try {
    const session = await getServerSession(authOptions);
    const authUserId = (session as Record<string, unknown> | null)?.authUserId as
      | string
      | undefined;
    const email = (session as Record<string, unknown> | null)?.email as string | undefined;
    const name = (session as Record<string, unknown> | null)?.name as string | null | undefined;
    if (authUserId && email) {
      return { authUserId, email, name: name ?? null };
    }
  } catch {
    // No NextAuth session — fall through to demo check.
  }

  // 2. Fall back to demo session cookie.
  const store = await cookies();
  const raw = store.get(DEMO_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RegistrationDetails;
    if (parsed?.authUserId && parsed?.email) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export interface CompleteRegistrationResult {
  success: boolean;
  error?: string;
}

/**
 * Final step: creates the Participant row with the selected department.
 * Called from the /register/details form submission. If the participant
 * already exists (e.g., they re-registered), we just update their
 * department and continue — no error, no token regeneration.
 *
 * After this, the user is redirected to /dashboard.
 */
export async function completeRegistration(
  department: string,
): Promise<CompleteRegistrationResult> {
  try {
    const session = await getRegistrationSession();
    if (!session) {
      return { success: false, error: 'Your session expired. Please start again.' };
    }

    const existing = await db.participant.findUnique({
      where: { authUserId: session.authUserId },
    });

    if (existing) {
      // Already registered — just update department if it changed.
      if (existing.department !== department) {
        await db.participant.update({
          where: { id: existing.id },
          data: { department },
        });
      }
      return { success: true };
    }

    // New participant — create with department + hashed token.
    const token = generateToken();
    const tokenHash = hashToken(token);

    const created = await db.participant.create({
      data: {
        authUserId: session.authUserId,
        email: session.email,
        name: session.name,
        department,
        simulationTokenHash: tokenHash,
      },
    });
    await db.simulationEvent.create({
      data: {
        participantId: created.id,
        eventType: 'registered',
        metadata: JSON.stringify({
          provider: session.authUserId.startsWith('google:') ? 'google' : 'demo',
          department,
        }),
      },
    });

    return { success: true };
  } catch (err) {
    console.error('[complete-registration] failed:', err);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/**
 * Server action wrapper that completes registration and redirects to
 * /dashboard. Used by the details form.
 */
export async function submitDepartment(formData: FormData): Promise<void> {
  const department = formData.get('department') as string;
  if (!department) {
    redirect('/register/details?error=missing_department');
  }
  const result = await completeRegistration(department);
  if (!result.success) {
    redirect('/register/details?error=' + encodeURIComponent(result.error ?? 'unknown'));
  }
  // Clear the demo session cookie on success (no-op for NextAuth sessions).
  try {
    const store = await cookies();
    store.delete(DEMO_SESSION_COOKIE);
  } catch {
    // ignore
  }
  redirect('/dashboard');
}
