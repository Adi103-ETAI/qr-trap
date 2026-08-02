import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth/admin';

export async function POST() {
  await logout();
  return NextResponse.json({ success: true });
}
