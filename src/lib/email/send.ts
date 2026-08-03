import { db } from '@/lib/db';
import type { EmailLog } from '@/types/database';
import { Resend } from 'resend';

/**
 * Email service using Resend.
 *
 * Two email types:
 *  1. Welcome email — sent immediately after registration. Clean, friendly.
 *  2. Simulation email — sent when admin clicks "Launch". Contains the
 *     /simulation/[token] link that triggers the fake alert page.
 *
 * All emails are also logged to the EmailLog table for admin visibility.
 *
 * SENDER:
 *  - For testing: 'onboarding@resend.dev' (Resend's free testing domain)
 *  - For production: 'Cyber Club <no-reply@yourdomain.com>' (requires
 *    domain verification in Resend dashboard)
 *
 * Set RESEND_FROM_EMAIL in .env to control the sender.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Cyber Club <onboarding@resend.dev>';

// Initialize Resend client only if API key is present.
// If no key, we fall back to mock mode (console.log + EmailLog only).
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!resend) {
  console.warn('[email-service] RESEND_API_KEY not set — running in mock mode. Emails will be logged but not actually sent.');
}

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
    // Send via Resend if configured, otherwise mock
    if (resend) {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: WELCOME_SUBJECT,
        html,
        text,
      });
      if (error) {
        throw new Error(error.message);
      }
    }

    // Persist to EmailLog
    const log = await db.emailLog.create({
      data: {
        participantId,
        toEmail: to,
        subject: WELCOME_SUBJECT,
        body: html,
        tokenUsed: '',
        status: 'sent',
      },
    });

    console.log(
      `[email-service] ${resend ? 'SENT' : 'MOCK'} (welcome)\n` +
        `  to: ${to}\n` +
        `  subject: ${WELCOME_SUBJECT}\n` +
        `  from: ${FROM_EMAIL}\n` +
        `  log_id: ${log.id}`,
    );

    return { success: true, emailLogId: log.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[email-service] welcome email failed:', message);

    // Persist failed attempt
    try {
      await db.emailLog.create({
        data: {
          participantId,
          toEmail: to,
          subject: WELCOME_SUBJECT,
          body: html,
          tokenUsed: '',
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
    // Send via Resend if configured, otherwise mock
    if (resend) {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: SIM_SUBJECT,
        html,
        text,
      });
      if (error) {
        throw new Error(error.message);
      }
    }

    // Persist to EmailLog
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
      `[email-service] ${resend ? 'SENT' : 'MOCK'} (simulation)\n` +
        `  to: ${to}\n` +
        `  subject: ${SIM_SUBJECT}\n` +
        `  from: ${FROM_EMAIL}\n` +
        `  simulation_url: ${url}\n` +
        `  log_id: ${log.id}`,
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
