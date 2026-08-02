-- Row Level Security policies for the Cyber Club awareness simulation.
-- Run this in the Supabase SQL Editor after `prisma db push` creates the tables.

-- ============================================================================
-- Participant table
-- ============================================================================
-- Participants can only read their own row (matched by authUserId = auth.uid()).
-- All writes go through the service role (admin operations) or server actions
-- that use the service role client.

alter table "Participant" enable row level security;

create policy "Participants can read own row"
  on "Participant" for select
  using (authUserId = auth.uid()::text);

-- No insert/update/delete policies for the anon key — all participant
-- creation happens via server actions using the service role client.

-- ============================================================================
-- Simulation table
-- ============================================================================
-- The current simulation status is public (participants need to read it
-- to know whether to show idle/launched/revealed). Writes are admin-only.

alter table "Simulation" enable row level security;

create policy "Simulation is publicly readable"
  on "Simulation" for select
  using (true);

-- ============================================================================
-- SimulationEvent table
-- ============================================================================
-- Events are write-only from the server (service role). Participants
-- don't need to read them.

alter table "SimulationEvent" enable row level security;

-- No policies = no access via anon key (service role bypasses RLS).

-- ============================================================================
-- EmailLog table
-- ============================================================================
-- Admin-only. No participant access.

alter table "EmailLog" enable row level security;

-- No policies = no access via anon key.

-- ============================================================================
-- AdminSession table
-- ============================================================================
-- Admin-only. No participant access.

alter table "AdminSession" enable row level security;

-- No policies = no access via anon key.

-- ============================================================================
-- Realtime
-- ============================================================================
-- Enable realtime for the Simulation table so the simulation page can
-- subscribe to status changes.

alter publication supabase_realtime add table "Simulation";
