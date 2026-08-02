import { io as ioc, type Socket } from 'socket.io-client';

/**
 * Server-side broadcaster. The Next.js process talks to the realtime
 * mini-service on port 3001 as a *client* (a trusted internal client)
 * and emits `simulation:reveal` / `simulation:launched` events that the
 * mini-service then rebroadcasts to all subscribed simulation pages.
 *
 * Why a client instead of in-process? Because Next.js API routes are
 * short-lived per-request, and we want the broadcast to come from a
 * single long-lived socket so participants see consistent state. The
 * mini-service on port 3001 is the single source of truth for broadcasts.
 *
 * For production with Supabase Realtime, replace these helpers with
 * `supabase.channel('simulation').send({...})`.
 */

const REALTIME_URL = process.env.REALTIME_INTERNAL_URL ?? 'http://localhost:3001';

let client: Socket | null = null;

function getClient(): Socket {
  if (client && client.connected) return client;
  if (client) {
    client.connect();
    return client;
  }
  client = ioc(REALTIME_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
    timeout: 3000,
  });
  return client;
}

/** Broadcast `simulation:reveal` to all connected participants. */
export async function broadcastReveal(): Promise<void> {
  const s = getClient();
  // Give the socket a moment to connect if it's fresh.
  if (!s.connected) {
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 1500);
      s.once('connect', () => {
        clearTimeout(t);
        resolve();
      });
      s.connect();
    });
  }
  s.emit('admin:broadcast', { event: 'simulation:reveal' });
}

/** Broadcast `simulation:launched` to all connected participants. */
export async function broadcastLaunch(): Promise<void> {
  const s = getClient();
  if (!s.connected) {
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 1500);
      s.once('connect', () => {
        clearTimeout(t);
        resolve();
      });
      s.connect();
    });
  }
  s.emit('admin:broadcast', { event: 'simulation:launched' });
}
