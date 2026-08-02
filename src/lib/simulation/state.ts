import { db } from '@/lib/db';
import type { Simulation, SimulationStatus } from '@/types/database';
import { isSimulationStatus } from '@/types/simulation';

/**
 * Simulation state machine helpers.
 *
 * A single "active" Simulation row is the source of truth for the global
 * status. We always operate on the most recent Simulation row. If none
 * exists, we lazily create one on first read (status = idle).
 *
 * State transitions:
 *   idle -> launched   (setLaunched)
 *   launched -> revealed (setRevealed)
 * Re-launching or re-revealing is idempotent / no-op.
 */

async function getOrCreateActiveSimulation(): Promise<Simulation> {
  const latest = await db.simulation.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  if (latest) return latest as unknown as Simulation;
  const created = await db.simulation.create({ data: { status: 'idle' } });
  return created as unknown as Simulation;
}

export async function getSimulationStatus(): Promise<SimulationStatus> {
  const sim = await getOrCreateActiveSimulation();
  return isSimulationStatus(sim.status) ? sim.status : 'idle';
}

export async function getSimulation(): Promise<Simulation> {
  return getOrCreateActiveSimulation();
}

/**
 * Transition idle -> launched. Records launchedAt. Idempotent: if already
 * launched or revealed, returns the current status without sending emails.
 */
export async function setLaunched(): Promise<SimulationStatus> {
  const sim = await getOrCreateActiveSimulation();
  if (sim.status !== 'idle') return sim.status as SimulationStatus;
  await db.simulation.update({
    where: { id: sim.id },
    data: {
      status: 'launched',
      launchedAt: new Date(),
    },
  });
  return 'launched';
}

/**
 * Transition launched -> revealed. Records revealedAt. Idempotent: if
 * already revealed, no-op. If still idle, refuses (returns idle).
 */
export async function setRevealed(): Promise<SimulationStatus> {
  const sim = await getOrCreateActiveSimulation();
  if (sim.status === 'revealed') return 'revealed';
  if (sim.status === 'idle') return 'idle';
  await db.simulation.update({
    where: { id: sim.id },
    data: {
      status: 'revealed',
      revealedAt: new Date(),
    },
  });
  return 'revealed';
}

/**
 * Reset simulation back to idle. Useful for event-day dry-runs. This
 * creates a new Simulation row so historical events are preserved.
 */
export async function resetSimulation(): Promise<SimulationStatus> {
  await db.simulation.create({ data: { status: 'idle' } });
  return 'idle';
}
