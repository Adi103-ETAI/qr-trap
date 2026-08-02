import { db } from '@/lib/db';
import type { EmailLog } from '@/types/database';

/**
 * Mock email service for the sandbox demo.
 *
 * PRODUCTION MIGRATION
 * --------------------
 * Replace the body of `sendSimulationEmail` with a Resend SDK call. The
 * signature stays the same:
 *
 *   import { Resend } from 'resend';
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *
 *   export async function sendSimulationEmail({ to, name, token }) {
 *     const url = `${process.env.NEXT_PUBLIC_APP_URL}/simulation/${token}`;
 *     const { data, error } = await resend.emails.send({
 *       from: 'Cyber Club <no-reply@cyberclub.dev>',
 *       to,
 *       subject: 'Security Notification — Event Registration',
 *       html: buildHtml(name, url),
 *       text: buildText(name, url),
 *     });
 *     if (error) return { success: false, error: error.message };
 *     // Optionally persist EmailLog for audit.
 *     return { success: true };
 *   }
 *
 * Also: in production, DO NOT store the raw token in EmailLog.tokenUsed.
 * That field exists only so admins can copy a test link in the sandbox.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SUBJECT = 'Security Notification — Event Registration';

function buildHtml(name: string | null, url: string): string {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0b1220; padding:32px 0;">
    <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
      <div style="background:#dc2626;color:#fff;padding:18px 24px;font-weight:700;letter-spacing:0.5px;">SECURITY NOTIFICATION</div>
      <div style="padding:24px;color:#e5e7eb;">
        <p>${greeting}</p>
        <p>An unusual activity notification has been generated for your recent event registration. Please review the notification.</p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Review Notification</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;">If you did not register for this event, you may safely ignore this email.</p>
      </div>
    </div>
  </body>
</html>`;
}

function buildText(name: string | null, url: string): string {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  return `${greeting}

An unusual activity notification has been generated for your recent event registration. Please review the notification.

Review Notification: ${url}

If you did not register for this event, you may safely ignore this email.
`;
}

export interface SendSimulationEmailArgs {
  to: string;
  name?: string | null;
  token: string;
  participantId: string;
}

export interface SendSimulationEmailResult {
  success: boolean;
  error?: string;
  emailLogId?: string;
}

/**
 * Sandbox mock email sender. Persists the email body to the EmailLog table
 * (with the raw token in `tokenUsed` for admin demo visibility) and logs
 * the full content + simulation URL to the server console.
 */
export async function sendSimulationEmail(
  args: SendSimulationEmailArgs,
): Promise<SendSimulationEmailResult> {
  const { to, name, token, participantId } = args;
  const url = `${APP_URL}/simulation/${token}`;
  const html = buildHtml(name ?? null, url);
  const text = buildText(name ?? null, url);

  try {
    // SANDBOX-ONLY: store raw token in EmailLog.tokenUsed for admin demo visibility.
    // PRODUCTION: do not store the raw token; reference the participant only.
    const log = await db.emailLog.create({
      data: {
        participantId,
        toEmail: to,
        subject: SUBJECT,
        body: html,
        tokenUsed: token,
        status: 'sent',
      },
    });

    console.log(
      `[email-service] MOCK SEND\n` +
        `  to: ${to}\n` +
        `  subject: ${SUBJECT}\n` +
        `  simulation_url: ${url}\n` +
        `  log_id: ${log.id}\n` +
        `  --- text body ---\n${text}\n  --- end ---`,
    );

    return { success: true, emailLogId: log.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[email-service] failed to persist / send email:', message);
    // Still persist a failed attempt so admin sees the row.
    try {
      await db.emailLog.create({
        data: {
          participantId,
          toEmail: to,
          subject: SUBJECT,
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
