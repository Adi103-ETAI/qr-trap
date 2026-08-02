'use server';

import { db } from '@/lib/db';
import { generateToken, hashToken } from '@/lib/simulation/tokens';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Registration flow (no spoilers):
 *
 *  1. User clicks "Continue with Google" on /register.
 *  2. Supabase Auth handles Google OAuth, redirects to /auth/callback
 *     which exchanges the code for a session and redirects to /register/details.
 *  3. /register/details greets them by name and asks for their department.
 *  4. submitDepartment() creates the Participant row with department + token
 *     and redirects to /dashboard.
 *
 * The dashboard is a clean Cyber Club member dashboard — no mention of
 * simulation, no "we sent you an email", nothing that would tip them off.
 */

const DEMO_SESSION_COOKIE = 'demo_signup_session';
const DEMO_SESSION_TTL_S = 10 * 60; // 10 minutes

export interface RegistrationDetails {
  email: string;
  name: string | null;
  authUserId: string;
}

/**
 * Read the current registration session — either from Supabase Auth
 * (Google OAuth) or from the demo cookie. Returns null if no session
 * is active, which means the user should be bounced back to /register.
 */
export async function getRegistrationSession(): Promise<RegistrationDetails | null> {
  // 1. Try Supabase Auth session first.
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      return {
        authUserId: user.id,
        email: user.email,
        name: (user.user_metadata?.full_name as string) ?? user.email.split('@')[0],
      };
    }
  } catch {
    // No Supabase session — fall through to demo check.
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
 * already exists, we just update their department and continue.
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
      if (existing.department !== department) {
        await db.participant.update({
          where: { id: existing.id },
          data: { department },
        });
      }
      return { success: true };
    }

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
          provider: session.authUserId.startsWith('demo:') ? 'demo' : 'google',
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
 * /dashboard.
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
  // NOTE: We intentionally do NOT clear the demo session cookie here.
  // The /dashboard page reads it to look up the participant record.
  redirect('/dashboard');
}

export interface DemoSessionStartResult {
  success: boolean;
  error?: string;
}

/**
 * Sandbox-only demo: starts a fake "authenticated" session by stashing
 * a generated name + email in a cookie. The user is then redirected to
 * /register/details just like the Google flow.
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
