'use client';

import { io, type Socket } from 'socket.io-client';

/**
 * Browser-side realtime client. Connects to the Socket.io mini-service
 * running on port 3001 (routed via the gateway with `XTransformPort=3001`).
 *
 * Exposes subscribeToSimulation(onReveal, onLaunch) returning a cleanup fn.
 * Falls back gracefully if the socket cannot connect — the caller should
 * also poll `/api/simulation/status` as a backup.
 */

let socket: Socket | null = null;

function getSocket(): Socket {
  if (socket) return socket;
  // NEVER use a port in the URL — only XTransformPort in the query.
  socket = io('/?XTransformPort=3001', {
    transports: ['websocket', 'polling'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 8000,
    timeout: 10_000,
  });
  socket.on('connect', () => {
    console.log('[realtime] connected to simulation broadcast');
  });
  socket.on('disconnect', (reason) => {
    console.warn('[realtime] disconnected:', reason);
  });
  socket.on('connect_error', (err) => {
    console.warn('[realtime] connect_error:', err.message);
  });
  return socket;
}

export interface SimulationSubscription {
  cleanup: () => void;
  isConnected: () => boolean;
}

export function subscribeToSimulation(
  onReveal: () => void,
  onLaunch: () => void,
): SimulationSubscription {
  const s = getSocket();
  const revealHandler = () => onReveal();
  const launchHandler = () => onLaunch();
  s.on('simulation:reveal', revealHandler);
  s.on('simulation:launched', launchHandler);
  return {
    cleanup: () => {
      s.off('simulation:reveal', revealHandler);
      s.off('simulation:launched', launchHandler);
    },
    isConnected: () => s.connected,
  };
}

/** Force-disconnect the socket (e.g. on full page exit). */
export function disconnectRealtime(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
