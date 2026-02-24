import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

const MAX_ENTRIES = 100;
const errorLog: Array<{
  id: string;
  message: string;
  timestamp: string;
  url?: string;
  stack?: string;
}> = [];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  return NextResponse.json({
    errors: errorLog.slice(-MAX_ENTRIES).reverse(),
    sentryConfigured: !!process.env.SENTRY_DSN,
  });
}

export function addErrorEntry(entry: { message: string; url?: string; stack?: string }) {
  errorLog.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    message: entry.message,
    timestamp: new Date().toISOString(),
    url: entry.url,
    stack: entry.stack,
  });
  if (errorLog.length > MAX_ENTRIES * 2) {
    errorLog.splice(0, errorLog.length - MAX_ENTRIES);
  }
}
