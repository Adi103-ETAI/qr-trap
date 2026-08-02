import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { generateToken, hashToken } from '@/lib/simulation/tokens';
import { cookies } from 'next/headers';

/**
 * NextAuth configuration.
 *
 * Providers:
 *  - Google OAuth (production). Only registered if GOOGLE_CLIENT_ID and
 *    GOOGLE_CLIENT_SECRET are present. Sandbox demo runs without it.
 *  - Credentials (admin). Used by /admin/login for password-based admin.
 *
 * On successful Google sign-in, the `signIn` callback lazily creates a
 * Participant row (with a freshly generated simulation token) if one does
 * not already exist for the Google `sub`. The raw token is never stored
 * on the Participant row — only its SHA-256 hash. For sandbox demo only,
 * the raw token is also stashed in a short-lived HTTP-only cookie so the
 * /register?status=success page can display a one-time simulation URL.
 *
 * PRODUCTION NOTE: In production the email itself is the carrier of the
 * token. The success page should NOT display the URL.
 */

const TOKEN_COOKIE = 'post_signup_token';
const TOKEN_COOKIE_TTL_S = 60; // 1 minute — single redirect

const providers: NextAuthOptions['providers'] = [];

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

providers.push(
  CredentialsProvider({
    name: 'Admin',
    credentials: {
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const secret = process.env.ADMIN_SECRET;
      if (!secret || !credentials?.password) return null;
      const a = Buffer.from(credentials.password);
      const b = Buffer.from(secret);
      if (a.length !== b.length || a.length === 0) return null;
      if (!crypto.timingSafeEqual(a, b)) return null;
      return { id: 'admin', name: 'Administrator', email: 'admin@cyberclub.local' };
    },
  }),
);

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 }, // 24h
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const authUserId = `google:${account.providerAccountId}`;
        const existing = await db.participant.findUnique({
          where: { authUserId },
        });
        if (!existing) {
          const token = generateToken();
          const tokenHash = hashToken(token);
          const created = await db.participant.create({
            data: {
              authUserId,
              email: user.email,
              name: user.name ?? null,
              simulationTokenHash: tokenHash,
            },
          });
          await db.simulationEvent.create({
            data: {
              participantId: created.id,
              eventType: 'registered',
              metadata: JSON.stringify({ provider: 'google' }),
            },
          });
          // Sandbox-only: stash raw token in a short-lived cookie so the
          // success page can show the simulation URL once. PRODUCTION:
          // remove this — the email is the carrier.
          try {
            const store = await cookies();
            store.set(TOKEN_COOKIE, token, {
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
              maxAge: TOKEN_COOKIE_TTL_S,
            });
          } catch (err) {
            console.warn('[nextauth] could not set post-signup token cookie:', err);
          }
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account?.provider === 'google' && user?.email) {
        const authUserId = `google:${account.providerAccountId}`;
        token.authUserId = authUserId;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.authUserId) {
        // Augment session with authUserId for downstream server components.
        (session as Record<string, unknown>).authUserId = token.authUserId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/register',
    error: '/register',
  },
};

/**
 * Server-side helper: read the post-signup token cookie. Read-only — in
 * Next.js 16 cookies can only be mutated inside a Server Action or Route
 * Handler, not inside a Server Component render. The cookie has a short
 * maxAge so it expires naturally.
 */
export async function consumePostSignupToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}
