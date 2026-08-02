export type SimulationStatus = 'idle' | 'launched' | 'revealed';

export type EventType =
  | 'registered'
  | 'email_sent'
  | 'simulation_opened'
  | 'simulation_clicked'
  | 'reveal_seen';

export const SIMULATION_STATUSES: readonly SimulationStatus[] = [
  'idle',
  'launched',
  'revealed',
] as const;

export const EVENT_TYPES: readonly EventType[] = [
  'registered',
  'email_sent',
  'simulation_opened',
  'simulation_clicked',
  'reveal_seen',
] as const;

export function isSimulationStatus(v: string): v is SimulationStatus {
  return (SIMULATION_STATUSES as readonly string[]).includes(v);
}

export function isEventType(v: string): v is EventType {
  return (EVENT_TYPES as readonly string[]).includes(v);
}
