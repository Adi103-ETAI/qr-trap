import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin';

/**
 * GET /api/admin/emails?limit=25
 * Returns recent EmailLog rows (newest first). Admin-only.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const limitRaw = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '25', 10);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitRaw) ? limitRaw : 25));
  const rows = await db.emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  const emails = rows.map((e) => ({
    id: e.id,
    toEmail: e.toEmail,
    subject: e.subject,
    status: e.status,
    tokenUsed: e.tokenUsed,
    createdAt: e.createdAt.toISOString(),
  }));
  return NextResponse.json({ emails });
}
