import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client.
 * Uses the anon (publishable) key — safe to expose to the client.
 * Respects RLS policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
