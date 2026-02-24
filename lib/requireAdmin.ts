import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== 'admin') {
    return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true as const, session };
}
