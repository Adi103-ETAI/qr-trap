import { createServer } from 'http';
import { Server } from 'socket.io';

/**
 * Realtime mini-service (Socket.io).
 *
 * Listens on port 3001 (fixed; do not change).
 *
 * Responsibilities:
 *  - Accept connections from simulation client pages (browser).
 *  - Accept a single trusted "admin broadcaster" connection (Next.js server,
 *    connects as a socket.io-client to emit `admin:broadcast` events).
 *  - When the admin broadcaster emits `admin:broadcast` with payload
 *    { event: 'simulation:reveal' | 'simulation:launched' }, rebroadcast
 *    that event name to every connected socket (broadcast).
 *
 * There is no per-client auth on the broadcast channel — it is a public
 * fan-out. Participants only learn the simulation status, which is also
 * available via the unauthenticated polling endpoint
 * GET /api/simulation/status?token=... so no information is leaked.
 *
 * PRODUCTION MIGRATION
 * --------------------
 * Replace this with a Supabase Realtime channel:
 *
 *   const channel = supabase.channel('simulation');
 *   // Admin: channel.send({ type: 'broadcast', event: 'simulation:reveal' });
 *   // Participants: channel.on('simulation:reveal', () => ...);
 */

const PORT = 3001;

const httpServer = createServer((req, res) => {
  // Simple health-check endpoint so the gateway / k8s can probe it.
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'realtime', port: PORT }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const io = new Server(httpServer, {
  // Path is `/` so the gateway (Caddy) can route via XTransformPort=3001.
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60_000,
  pingInterval: 25_000,
});

let connectedClients = 0;

io.on('connection', (socket) => {
  connectedClients += 1;
  console.log(`[realtime] client connected: ${socket.id} (total=${connectedClients})`);

  // Trusted broadcaster (Next.js server) emits `admin:broadcast`.
  // We re-emit the inner event name to ALL clients.
  socket.on('admin:broadcast', (payload: { event: string; data?: unknown }) => {
    if (
      payload &&
      typeof payload === 'object' &&
      typeof payload.event === 'string' &&
      (payload.event === 'simulation:reveal' ||
        payload.event === 'simulation:launched')
    ) {
      console.log(`[realtime] broadcasting ${payload.event} to all clients`);
      io.emit(payload.event, payload.data ?? null);
    } else {
      console.warn(`[realtime] refused admin:broadcast:`, payload);
    }
  });

  socket.on('disconnect', (reason) => {
    connectedClients = Math.max(0, connectedClients - 1);
    console.log(`[realtime] client disconnected: ${socket.id} reason=${reason} (total=${connectedClients})`);
  });

  socket.on('error', (err) => {
    console.error(`[realtime] socket error (${socket.id}):`, err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[realtime] Socket.io service listening on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`[realtime] received ${signal}, shutting down...`);
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
