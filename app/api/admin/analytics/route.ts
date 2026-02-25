import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';

function getDateKey(d: Date, type: 'day' | 'week' | 'month'): string {
  if (type === 'day') {
    return d.toISOString().slice(0, 10);
  }
  if (type === 'week') {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 7);
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const raw = await Diagnosis.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('createdAt result answers userId')
      .lean();
    const allDiagnoses = raw as unknown as Array<{
      createdAt: Date;
      userId?: unknown;
      result?: {
        suitableJobsAnalysis?: string;
        aptitudeScores?: {
          業種?: Array<{ name: string; score?: number }>;
          職種?: Array<{ name: string; score?: number }>;
        };
      };
      answers?: Record<string, string>;
    }>;

    const userIdsRaw = allDiagnoses.map((d) => d.userId).filter(Boolean);
    const userIds = userIdsRaw
      .map((id) => {
        try {
          return id instanceof Types.ObjectId ? id : new Types.ObjectId(String(id));
        } catch {
          return null;
        }
      })
      .filter((id): id is Types.ObjectId => id != null);
    const uniqueIds = [...new Set(userIds.map((id) => id.toString()))].map((s) => new Types.ObjectId(s));
    const userProfileMap = new Map<string, { ageGroup?: string; jobType?: string; industry?: string }>();
    if (uniqueIds.length > 0) {
      const users = await db
        .collection('users')
        .find({ _id: { $in: uniqueIds } })
        .project({ _id: 1, ageGroup: 1, jobType: 1, industry: 1 })
        .toArray();
      for (const u of users) {
        const idStr = String(u._id);
        userProfileMap.set(idStr, {
          ageGroup: (u.ageGroup as string) ?? undefined,
          jobType: (u.jobType as string) ?? undefined,
          industry: (u.industry as string) ?? undefined,
        });
      }
    }

    const daily: Record<string, number> = {};
    const weekly: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    let withProfile = 0;
    const byJobTypeProfile: Record<string, number> = {};
    const byIndustryProfile: Record<string, number> = {};
    const bySuitableJobType: Record<string, number> = {};
    const bySuitableIndustry: Record<string, number> = {};
    const byAgeGroup: Record<string, number> = {};

    for (const d of allDiagnoses) {
      const dt = new Date(d.createdAt);
      const dk = getDateKey(dt, 'day');
      const wk = getDateKey(dt, 'week');
      const mk = getDateKey(dt, 'month');
      daily[dk] = (daily[dk] ?? 0) + 1;
      weekly[wk] = (weekly[wk] ?? 0) + 1;
      monthly[mk] = (monthly[mk] ?? 0) + 1;

      if (d.answers && Object.values(d.answers).some((v) => v && String(v).trim().length > 0)) {
        withProfile++;
      }

      const uid = d.userId;
      const uidStr = uid && typeof uid === 'object' && 'toString' in uid ? (uid as { toString: () => string }).toString() : String(uid ?? '');
      const profile = uidStr ? userProfileMap.get(uidStr) : undefined;

      // プロフィールから現状の年代・職種・業種を集計
      const ageGroup = profile?.ageGroup?.trim() || '未入力';
      byAgeGroup[ageGroup] = (byAgeGroup[ageGroup] ?? 0) + 1;
      const jobTypeProfile = profile?.jobType?.trim() || '未入力';
      byJobTypeProfile[jobTypeProfile] = (byJobTypeProfile[jobTypeProfile] ?? 0) + 1;
      const industryProfile = profile?.industry?.trim() || '未入力';
      byIndustryProfile[industryProfile] = (byIndustryProfile[industryProfile] ?? 0) + 1;

      // 診断結果の aptitudeScores から向いている業種・職種を集計
      const aptitude = d.result?.aptitudeScores;
      const industries = aptitude?.業種;
      if (Array.isArray(industries)) {
        for (const item of industries) {
          const name = item?.name?.trim();
          if (name) {
            bySuitableIndustry[name] = (bySuitableIndustry[name] ?? 0) + 1;
          }
        }
      }
      const jobTypes = aptitude?.職種;
      if (Array.isArray(jobTypes)) {
        for (const item of jobTypes) {
          const name = item?.name?.trim();
          if (name) {
            bySuitableJobType[name] = (bySuitableJobType[name] ?? 0) + 1;
          }
        }
      }
    }

    const totalCount = await Diagnosis.countDocuments();
    const completionRate = 100;

    const dailyChart = Object.entries(daily)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    const weeklyChart = Object.entries(weekly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    const monthlyChart = Object.entries(monthly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      dailyChart,
      weeklyChart,
      monthlyChart,
      completionRate: Math.min(100, completionRate),
      totalDiagnoses: totalCount,
      withProfileCount: withProfile,
      byAgeGroup: Object.entries(byAgeGroup).map(([name, value]) => ({ name, value })),
      byJobTypeProfile: Object.entries(byJobTypeProfile).map(([name, value]) => ({ name, value })),
      byIndustryProfile: Object.entries(byIndustryProfile).map(([name, value]) => ({ name, value })),
      bySuitableJobType: Object.entries(bySuitableJobType).map(([name, value]) => ({ name, value })),
      bySuitableIndustry: Object.entries(bySuitableIndustry).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    console.error('[admin/analytics]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
