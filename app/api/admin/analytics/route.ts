import { NextRequest, NextResponse } from 'next/server';
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
    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const raw = await Diagnosis.find({ createdAt: { $gte: thirtyDaysAgo } }).lean();
    const allDiagnoses = raw as unknown as Array<{ createdAt: Date; result?: { suitableJobsAnalysis?: string }; answers?: Record<string, string> }>;

    const daily: Record<string, number> = {};
    const weekly: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    const careerPaths: Record<string, number> = {};
    let withProfile = 0;
    const byJobType: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};
    const byAgeGroup: Record<string, number> = {};

    for (const d of allDiagnoses) {
      const dt = new Date(d.createdAt);
      const dk = getDateKey(dt, 'day');
      const wk = getDateKey(dt, 'week');
      const mk = getDateKey(dt, 'month');
      daily[dk] = (daily[dk] ?? 0) + 1;
      weekly[wk] = (weekly[wk] ?? 0) + 1;
      monthly[mk] = (monthly[mk] ?? 0) + 1;

      const summary = d.result?.suitableJobsAnalysis ?? '';
      if (summary && summary.length > 2) {
        const sentences = summary.split(/[。．]/).filter(Boolean);
        for (const s of sentences) {
          const m = s.match(/[^、,]+(?:職|業|分野|領域)/);
          if (m) {
            const key = m[0].trim().slice(0, 30);
            careerPaths[key] = (careerPaths[key] ?? 0) + 1;
          }
        }
      }
      if (d.answers && Object.values(d.answers).some((v) => v && String(v).trim().length > 0)) {
        withProfile++;
      }

      const ans = d.answers as Record<string, string> | undefined;
      const jobType = ans?.jobType ?? ans?.q3 ?? '未入力';
      const jobKey = String(jobType).trim() || '未入力';
      byJobType[jobKey] = (byJobType[jobKey] ?? 0) + 1;

      const industry = ans?.industry ?? ans?.q4 ?? '未入力';
      const indKey = String(industry).trim() || '未入力';
      byIndustry[indKey] = (byIndustry[indKey] ?? 0) + 1;

      const ageGroup = ans?.ageGroup ?? '未入力';
      const ageKey = String(ageGroup).trim() || '未入力';
      byAgeGroup[ageKey] = (byAgeGroup[ageKey] ?? 0) + 1;
    }

    const totalCount = await Diagnosis.countDocuments();
    const completionRate = 100;

    const topCareers = Object.entries(careerPaths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

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
      topCareers,
      completionRate: Math.min(100, completionRate),
      totalDiagnoses: totalCount,
      withProfileCount: withProfile,
      byJobType: Object.entries(byJobType).map(([name, value]) => ({ name, value })),
      byIndustry: Object.entries(byIndustry).map(([name, value]) => ({ name, value })),
      byAgeGroup: Object.entries(byAgeGroup).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    console.error('[admin/analytics]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
