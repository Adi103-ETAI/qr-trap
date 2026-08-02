import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for privileged admin operations.
 * Bypasses RLS. NEVER expose this to the client — only use in Route
 * Handlers and Server Actions that have verified admin authorization.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
