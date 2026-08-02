import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginWithPassword } from '@/lib/auth/admin';
import { rateLimit } from '@/lib/rate-limit';

const BodySchema = z.object({
  password: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { max: 10, windowMs: 60_000, keyPrefix: 'admin-login' });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 },
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    const json = await request.json();
    parsed = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = await loginWithPassword(parsed.password);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Login failed' }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
