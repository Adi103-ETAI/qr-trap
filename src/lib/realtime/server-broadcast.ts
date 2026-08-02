/**
 * Server-side broadcast helpers.
 *
 * With Supabase Realtime, we don't need to explicitly broadcast — the
 * simulation page subscribes to postgres_changes on the Simulation table.
 * When we UPDATE the status column (via Prisma), Supabase Realtime
 * automatically pushes the change to all subscribed clients.
 *
 * These functions are kept as no-ops for backward compatibility with
 * the API routes that call them.
 */
export async function broadcastReveal(): Promise<void> {
  // No-op — Supabase Realtime picks up the DB update automatically.
}

export async function broadcastLaunch(): Promise<void> {
  // No-op — Supabase Realtime picks up the DB update automatically.
}
