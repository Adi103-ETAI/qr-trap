// Domain types derived from Prisma models (hand-written to avoid tight coupling
// between client and server components and to keep the API surface explicit).

export type SimulationStatus = 'idle' | 'launched' | 'revealed';

export type EventType =
  | 'registered'
  | 'email_sent'
  | 'simulation_opened'
  | 'simulation_clicked'
  | 'reveal_seen';

export interface Participant {
  id: string;
  authUserId: string;
  email: string;
  name: string | null;
  simulationTokenHash: string;
  registeredAt: Date;
  emailSent: boolean;
  emailSentAt: Date | null;
  simulationOpened: boolean;
  simulationOpenedAt: Date | null;
  clicked: boolean;
  clickedAt: Date | null;
}

export interface Simulation {
  id: string;
  status: SimulationStatus;
  launchedAt: Date | null;
  revealedAt: Date | null;
  createdAt: Date;
}

export interface SimulationEvent {
  id: string;
  participantId: string;
  eventType: EventType;
  createdAt: Date;
  metadata: string | null;
}

export interface EmailLog {
  id: string;
  participantId: string;
  toEmail: string;
  subject: string;
  body: string;
  tokenUsed: string;
  status: 'sent' | 'failed';
  error: string | null;
  createdAt: Date;
}

export interface AdminSession {
  id: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}
