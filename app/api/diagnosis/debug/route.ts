import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserIdFromSession } from '@/lib/getUserId';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';

/**
 * 開発環境専用：診断機能の動作状況を確認するデバッグAPI
 * GET /api/diagnosis/debug
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug API is only available in development' }, { status: 404 });
  }

  try {
    const session = await auth();
    const userId = await getUserIdFromSession(session);

    let diagnosisCount = 0;
    let latestDiagnosis: { id?: string; userId?: string; createdAt?: string } | null = null;

    await connectDB();
    if (userId) {
      const myList = await Diagnosis.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
      diagnosisCount = myList.length;
    }
    const list = await Diagnosis.find({}).sort({ createdAt: -1 }).limit(1).lean();
    if (list.length > 0) {
      const latest = list[0] as { _id?: { toString: () => string }; userId?: { toString: () => string }; createdAt?: Date };
      latestDiagnosis = {
        id: latest._id?.toString(),
        userId: latest.userId?.toString(),
        createdAt: latest.createdAt?.toISOString(),
      };
    }

    return NextResponse.json({
      ok: true,
      diagnostics: {
        session: {
          exists: !!session,
          email: session?.user?.email ? `${session.user.email.slice(0, 8)}...` : null,
        },
        userId: userId?.toString() ?? null,
        diagnosisCount,
        latestInDb: latestDiagnosis,
        env: {
          hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
          hasMongodbUri: !!process.env.MONGODB_URI,
        },
      },
    });
  } catch (error) {
    console.error('[Diagnosis debug]', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
