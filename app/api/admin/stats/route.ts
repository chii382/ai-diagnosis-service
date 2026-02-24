import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';

const PER_PAGE = 5;

const SORT_FIELDS = ['createdAt', 'userName', 'userEmail', 'summary'] as const;
type SortField = (typeof SORT_FIELDS)[number];

function isValidSortField(v: string | null): v is SortField {
  return v != null && SORT_FIELDS.includes(v as SortField);
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const skip = (page - 1) * PER_PAGE;
  const search = (searchParams.get('search') ?? '').trim();
  const sortBy = isValidSortField(searchParams.get('sortBy')) ? searchParams.get('sortBy')! : 'createdAt';
  const orderParam = searchParams.get('order');
  const order = orderParam === 'asc' ? 1 : -1;

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({
        todayCount: 0,
        totalCount: 0,
        activeUserCount: 0,
        diagnoses: [],
        diagnosisTotalCount: 0,
        diagnosisPage: 1,
        totalPages: 0,
        dbStatus: 'error',
        dbMessage: 'Database not connected',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Mongoose の find で診断データを取得（集約を使わない確実な方式）
    // ソートは createdAt のみ対応（name/email/summary は集約が必要なため後で対応）
    const sortField = sortBy === 'createdAt' ? 'createdAt' : 'createdAt';

    let findQuery: Record<string, unknown> = {};
    if (search) {
      // 名前・メールでヒットする user の _id を取得
      const matchingUsers = await db
        .collection('users')
        .find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        })
        .project({ _id: 1 })
        .toArray();
      const matchingIds = matchingUsers.map((u) => u._id);
      findQuery = {
        $or: [
          { 'result.summary': { $regex: search, $options: 'i' } },
          ...(matchingIds.length > 0 ? [{ userId: { $in: matchingIds } }] : []),
        ],
      };
    }

    const [todayCount, totalCount, activeUserCount, diagnosisTotalCount, recentRaw] = await Promise.all([
      Diagnosis.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      Diagnosis.countDocuments(),
      db.collection('users').countDocuments(),
      Diagnosis.countDocuments(findQuery),
      Diagnosis.find(findQuery).sort({ [sortField]: order }).skip(skip).limit(PER_PAGE).lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(diagnosisTotalCount / PER_PAGE));

    const userIds = (recentRaw as Array<{ userId?: unknown }>)
      .map((d) => {
        const uid = d.userId;
        if (!uid) return null;
        try {
          return uid instanceof Types.ObjectId ? uid : new Types.ObjectId(String(uid));
        } catch {
          return null;
        }
      })
      .filter((id): id is Types.ObjectId => id != null);

    const userMap = new Map<string, { name: string; email: string }>();
    if (userIds.length > 0) {
      const users = await db.collection('users').find({ _id: { $in: userIds } }).project({ _id: 1, name: 1, email: 1 }).toArray();
      for (const u of users) {
        userMap.set(String(u._id), {
          name: (u.name as string) ?? '-',
          email: (u.email as string) ?? '-',
        });
      }
    }

    const diagnoses = (recentRaw as unknown as Array<Record<string, unknown>>).map((d) => {
      const uid = d.userId;
      const idStr = typeof uid === 'object' && uid && 'toString' in uid ? (uid as { toString: () => string }).toString() : String(uid);
      const user = userMap.get(idStr) ?? { name: '-', email: '-' };
      const summary = (d.result as Record<string, unknown> | undefined)?.summary;
      const summaryStr = typeof summary === 'string' ? summary.slice(0, 80) || '-' : '-';
      return {
        _id: String(d._id),
        userId: idStr,
        userName: user.name,
        userEmail: user.email,
        createdAt: d.createdAt,
        summary: summaryStr,
      };
    });

    const start = Date.now();
    await db.collection('users').findOne({});
    const apiResponseTime = Date.now() - start;

    return NextResponse.json({
      todayCount,
      totalCount,
      activeUserCount,
      diagnoses,
      diagnosisTotalCount,
      diagnosisPage: page,
      totalPages,
      dbStatus: 'ok',
      apiResponseTime,
    });
  } catch (error) {
    console.error('[admin/stats]', error);
    return NextResponse.json(
      {
        todayCount: 0,
        totalCount: 0,
        activeUserCount: 0,
        diagnoses: [],
        diagnosisTotalCount: 0,
        diagnosisPage: 1,
        totalPages: 0,
        dbStatus: 'error',
        dbMessage: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
