import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to simulation state changes via Supabase Realtime.
 *
 * Listens to postgres_changes on the `Simulation` table. When the host
 * updates the status column (idle -> launched -> revealed), all connected
 * simulation pages receive the change in real-time.
 *
 * Returns a cleanup function.
 */
export function subscribeToSimulation(
  onReveal: () => void,
  onLaunch: () => void,
): { cleanup: () => void; isConnected: () => boolean } {
  const supabase = createClient();
  let connected = false;

  const channel = supabase
    .channel('simulation-status')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Simulation',
      },
      (payload: { new: { status?: string } }) => {
        const newStatus = payload.new?.status;
        if (newStatus === 'revealed') {
          onReveal();
        } else if (newStatus === 'launched') {
          onLaunch();
        }
      },
    )
    .subscribe((status: string) => {
      connected = status === 'SUBSCRIBED';
    });

  return {
    cleanup: () => {
      supabase.removeChannel(channel);
    },
    isConnected: () => connected,
  };
}
