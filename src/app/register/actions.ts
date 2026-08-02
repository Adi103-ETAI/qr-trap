'use server';

import { db } from '@/lib/db';
import { generateToken, hashToken } from '@/lib/simulation/tokens';
import { cookies } from 'next/headers';

/**
 * Sandbox-only demo registration: creates a participant record without
 * requiring Google OAuth. Generates a fake email like `demo-{rand}@cyberclub.local`
 * and immediately returns the simulation URL so the demo flow can be tested
 * end-to-end.
 *
 * In production (Google OAuth configured), this server action is unused —
 * the NextAuth signIn callback handles participant provisioning.
 */

const DEMO_COOKIE = 'demo_sim_token';
const DEMO_COOKIE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface DemoRegisterResult {
  success: boolean;
  error?: string;
  simulationUrl?: string;
  email?: string;
  name?: string;
}

export async function demoRegister(name?: string): Promise<DemoRegisterResult> {
  try {
    const rand = Math.random().toString(36).slice(2, 10);
    const email = `demo-${rand}@cyberclub.local`;
    const authUserId = `demo:${rand}`;
    const token = generateToken();
    const tokenHash = hashToken(token);

    const existing = await db.participant.findUnique({
      where: { authUserId },
    });
    if (existing) {
      // Shouldn't happen with random, but be safe.
      return { success: false, error: 'Please retry' };
    }

    const created = await db.participant.create({
      data: {
        authUserId,
        email,
        name: name?.trim() || 'Demo Participant',
        simulationTokenHash: tokenHash,
      },
    });
    await db.simulationEvent.create({
      data: {
        participantId: created.id,
        eventType: 'registered',
        metadata: JSON.stringify({ provider: 'demo' }),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const simulationUrl = `${appUrl}/simulation/${token}`;

    // Stash the token in a short-lived cookie so the success page can
    // display the link without exposing it through the URL of the redirect.
    const store = await cookies();
    store.set(DEMO_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DEMO_COOKIE_TTL_MS / 1000,
    });

    console.log(`[demo-register] created participant ${created.id} email=${email} url=${simulationUrl}`);

    return { success: true, simulationUrl, email, name: created.name ?? undefined };
  } catch (err) {
    console.error('[demo-register] failed:', err);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/**
 * Read the demo token cookie. Read-only — in Next.js 16 cookies can only
 * be mutated inside a Server Action or Route Handler, not inside a Server
 * Component render. The cookie has a short maxAge (5 min) so it expires
 * naturally; if a participant re-registers, a fresh token overwrites it.
 */
export async function consumeDemoToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value ?? null;
}
