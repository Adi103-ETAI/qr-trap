/**
 * Sandbox-only helper: reset the simulation database back to a clean state.
 *
 * Usage:
 *   bun run scripts/reset-db.ts
 *
 * Wipes Participants, SimulationEvents, EmailLogs, Simulations, AdminSessions.
 * Creates one fresh Simulation row in status=idle. Use between event-day
 * dry-runs. DO NOT run during a live event.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('[reset-db] wiping all data...');
  await db.simulationEvent.deleteMany();
  await db.emailLog.deleteMany();
  await db.participant.deleteMany();
  await db.simulation.deleteMany();
  await db.adminSession.deleteMany();
  await db.simulation.create({ data: { status: 'idle' } });
  console.log('[reset-db] done. Simulation is now idle.');
}

main()
  .catch((e) => {
    console.error('[reset-db] failed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
