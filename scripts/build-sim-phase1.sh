#!/bin/bash
set -e
cd /home/z/my-project

echo "=== Checkout club-o1 ==="
git checkout club-o1 2>&1 | tail -1
git branch --show-current

echo "=== Add sendWelcomeEmail to email service ==="
cat > src/lib/email/send.ts << 'EMAILEOF'
import { db } from '@/lib/db';
import type { EmailLog } from '@/types/database';

/**
 * Email service for the Cyber Club awareness simulation.
 *
 * Two email types:
 *  1. Welcome email — sent immediately after registration. Clean, friendly.
 *     No simulation link, no urgency.
 *  2. Simulation email — sent when admin clicks "Launch". Contains the
 *     /simulation/[token] link that triggers the fake alert page.
 *
 * PRODUCTION MIGRATION
 * --------------------
 * Replace the bodies of both functions with Resend SDK calls. The
 * signatures stay the same. See README for the exact snippet.
 *
 * SANDBOX NOTE: The raw token is stored in EmailLog.tokenUsed for admin
 * demo visibility. In production, do NOT store the raw token.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ============================================================================
// 1. Welcome email
// ============================================================================

const WELCOME_SUBJECT = 'Welcome to Cyber Club';

function buildWelcomeHtml(name: string | null): string {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0b1220; padding:32px 0; margin:0;">
    <div style="max-width:480px; margin:0 auto; background:#111827; border:1px solid #1f2937; border-radius:12px; overflow:hidden;">
      <div style="background:#dc2626; padding:16px 24px;">
        <p style="margin:0; color:#fff; font-size:16px; font-weight:700; font-family:monospace;">CYBER CLUB</p>
      </div>
      <div style="padding:32px 24px;">
        <h1 style="margin:0 0 16px; color:#f9fafb; font-size:24px; font-weight:700;">Welcome to the club.</h1>
        <p style="margin:0 0 16px; color:#d1d5db; font-size:15px; line-height:1.6;">${greeting}</p>
        <p style="margin:0 0 16px; color:#d1d5db; font-size:15px; line-height:1.6;">
          Thanks for registering for the Cyber Club launch event. We're excited
          to have you on board.
        </p>
        <p style="margin:0 0 16px; color:#d1d5db; font-size:15px; line-height:1.6;">
          We'll send you another email closer to the event with more details.
          See you there.
        </p>
        <div style="margin-top:24px; padding-top:24px; border-top:1px solid #1f2937;">
          <p style="margin:0; color:#6b7280; font-size:13px; font-family:monospace;">
            — Cyber Club Team
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildWelcomeText(name: string | null): string {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return `${greeting}

Thanks for registering for the Cyber Club launch event. We're excited
to have you on board.

We'll send you another email closer to the event with more details.
See you there.

— Cyber Club Team`;
}

export interface WelcomeEmailArgs {
  to: string;
  name: string | null;
  participantId: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  emailLogId?: string;
}

export async function sendWelcomeEmail(args: WelcomeEmailArgs): Promise<EmailResult> {
  const { to, name, participantId } = args;
  const html = buildWelcomeHtml(name);
  const text = buildWelcomeText(name);

  try {
    const log = await db.emailLog.create({
      data: {
        participantId,
        toEmail: to,
        subject: WELCOME_SUBJECT,
        body: html,
        tokenUsed: '', // No token for welcome email
        status: 'sent',
      },
    });

    console.log(
      `[email-service] MOCK SEND (welcome)\n` +
        `  to: ${to}\n` +
        `  subject: ${WELCOME_SUBJECT}\n` +
        `  log_id: ${log.id}\n` +
        `  --- text body ---\n${text}\n  --- end ---`,
    );

    return { success: true, emailLogId: log.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[email-service] welcome email failed:', message);
    return { success: false, error: message };
  }
}

// ============================================================================
// 2. Simulation email
// ============================================================================

const SIM_SUBJECT = 'Security Notification — Event Registration';

function buildSimHtml(name: string | null, url: string): string {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0b1220; padding:32px 0; margin:0;">
    <div style="max-width:480px; margin:0 auto; background:#111827; border:1px solid #1f2937; border-radius:12px; overflow:hidden;">
      <div style="background:#dc2626; padding:16px 24px;">
        <p style="margin:0; color:#fff; font-size:14px; font-weight:700; font-family:monospace;">⚠ SECURITY NOTIFICATION</p>
      </div>
      <div style="padding:32px 24px;">
        <h1 style="margin:0 0 16px; color:#f9fafb; font-size:22px; font-weight:700;">Unusual activity detected</h1>
        <p style="margin:0 0 16px; color:#d1d5db; font-size:15px; line-height:1.6;">${greeting}</p>
        <p style="margin:0 0 16px; color:#d1d5db; font-size:15px; line-height:1.6;">
          An unusual activity notification has been generated for your recent
          event registration. Please review the notification.
        </p>
        <a href="${url}" style="display:inline-block; background:#dc2626; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px; margin-top:8px;">
          Review Notification
        </a>
        <p style="margin:24px 0 0; color:#6b7280; font-size:12px; line-height:1.5;">
          If you did not register for this event, you may safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function buildSimText(name: string | null, url: string): string {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  return `${greeting}

An unusual activity notification has been generated for your recent
event registration. Please review the notification.

Review Notification: ${url}

If you did not register for this event, you may safely ignore this email.`;
}

export interface SimulationEmailArgs {
  to: string;
  name: string | null;
  token: string;
  participantId: string;
}

export async function sendSimulationEmail(args: SimulationEmailArgs): Promise<EmailResult> {
  const { to, name, token, participantId } = args;
  const url = `${APP_URL}/simulation/${token}`;
  const html = buildSimHtml(name ?? null, url);
  const text = buildSimText(name ?? null, url);

  try {
    const log = await db.emailLog.create({
      data: {
        participantId,
        toEmail: to,
        subject: SIM_SUBJECT,
        body: html,
        tokenUsed: token,
        status: 'sent',
      },
    });

    console.log(
      `[email-service] MOCK SEND (simulation)\n` +
        `  to: ${to}\n` +
        `  subject: ${SIM_SUBJECT}\n` +
        `  simulation_url: ${url}\n` +
        `  log_id: ${log.id}\n` +
        `  --- text body ---\n${text}\n  --- end ---`,
    );

    return { success: true, emailLogId: log.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[email-service] simulation email failed:', message);
    try {
      await db.emailLog.create({
        data: {
          participantId,
          toEmail: to,
          subject: SIM_SUBJECT,
          body: html,
          tokenUsed: token,
          status: 'failed',
          error: message,
        },
      });
    } catch {
      /* swallow nested errors */
    }
    return { success: false, error: message };
  }
}

/** Helper for admin dashboard: recent email log rows. */
export async function getRecentEmailLogs(limit = 25): Promise<EmailLog[]> {
  const rows = await db.emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows as unknown as EmailLog[];
}
EMAILEOF
echo "OK: email service updated"

echo "=== Add welcome email trigger to completeRegistration ==="
python3 << 'PYEOF'
with open('src/app/register/actions.ts') as f:
    c = f.read()

# Add import for sendWelcomeEmail
old_import = "import { generateToken, hashToken } from '@/lib/simulation/tokens';"
new_import = """import { generateToken, hashToken } from '@/lib/simulation/tokens';
import { sendWelcomeEmail } from '@/lib/email/send';"""

if old_import in c and 'sendWelcomeEmail' not in c:
    c = c.replace(old_import, new_import)

# Find the completeRegistration function and add welcome email after event creation
# Look for the pattern: simulationEvent.create ... return { success: true }
old_block = """    await db.simulationEvent.create({
      data: {
        participantId: created.id,
        eventType: 'registered',
        metadata: JSON.stringify({
          provider: session.authUserId.startsWith('demo:') ? 'demo' : 'google',
          department,
        }),
      },
    });

    return { success: true };"""

new_block = """    await db.simulationEvent.create({
      data: {
        participantId: created.id,
        eventType: 'registered',
        metadata: JSON.stringify({
          provider: session.authUserId.startsWith('demo:') ? 'demo' : 'google',
          department,
        }),
      },
    });

    // Send welcome email (fire-and-forget — don't block registration on email)
    void sendWelcomeEmail({
      to: session.email,
      name: session.name,
      participantId: created.id,
    }).catch((err) => console.error('[welcome-email] failed:', err));

    return { success: true };"""

if old_block in c:
    c = c.replace(old_block, new_block)
    with open('src/app/register/actions.ts', 'w') as f:
        f.write(c)
    print('OK: welcome email trigger added')
else:
    print('WARN: completeRegistration block not found (may already have welcome email)')
    # Check if it's already there
    if 'sendWelcomeEmail' in c:
        print('  -> sendWelcomeEmail already present')
    with open('src/app/register/actions.ts', 'w') as f:
        f.write(c)
PYEOF

echo "=== Done with email changes ==="
