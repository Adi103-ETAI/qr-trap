import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';

/**
 * NextAuth configuration.
 *
 * Providers:
 *  - Google OAuth (production). Only registered if GOOGLE_CLIENT_ID and
 *    GOOGLE_CLIENT_SECRET are present. Sandbox demo runs without it.
 *  - Credentials (admin). Used by /admin/login for password-based admin.
 *
 * Participant creation is NOT done here. The Google sign-in only authenticates
 * the user. The actual Participant row (with token + department) is created in
 * the /register/details server action when the user picks their department.
 * This keeps the registration flow user-facing and lets them review their
 * name + pick a department before the record is committed.
 */

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
    async signIn() {
      // No participant creation here — that happens in /register/details
      // after the user picks their department.
      return true;
    },
    async jwt({ token, account, user }) {
      if (account?.provider === 'google' && user?.email) {
        const authUserId = `google:${account.providerAccountId}`;
        token.authUserId = authUserId;
        token.email = user.email;
        token.name = user.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.authUserId) {
        (session as Record<string, unknown>).authUserId = token.authUserId;
        (session as Record<string, unknown>).email = token.email;
        (session as Record<string, unknown>).name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/register',
    error: '/register',
  },
};
