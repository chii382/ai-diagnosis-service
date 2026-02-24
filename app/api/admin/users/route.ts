import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { connectDB } from '@/lib/db';

const PER_PAGE = 20;

/** 名前・メールのソート用: 大文字小文字を区別しない（strength: 1） */
const CASE_INSENSITIVE_COLLATION = { locale: 'ja', strength: 1 };

const SORT_FIELDS = ['name', 'email', 'role', 'createdAt', 'diagnosisCount'] as const;
type SortField = (typeof SORT_FIELDS)[number];

function isValidSortField(v: string | null): v is SortField {
  return v != null && SORT_FIELDS.includes(v as SortField);
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const search = searchParams.get('search') ?? '';
    const role = searchParams.get('role') ?? '';
    const sortBy = isValidSortField(searchParams.get('sortBy')) ? searchParams.get('sortBy')! : 'createdAt';
    const orderParam = searchParams.get('order');
    const order = orderParam === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (search.trim()) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (role === 'admin' || role === 'user') {
      filter.role = role;
    }

    if (sortBy === 'diagnosisCount') {
      const pipeline: object[] = [
        { $match: filter },
        {
          $lookup: { from: 'diagnoses', localField: '_id', foreignField: 'userId', as: 'diagnoses' },
        },
        { $addFields: { diagnosisCount: { $size: '$diagnoses' } } },
        { $sort: { diagnosisCount: order } },
        { $skip: (page - 1) * PER_PAGE },
        { $limit: PER_PAGE },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            image: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1,
            diagnosisCount: 1,
          },
        },
      ];
      const [countResult, users] = await Promise.all([
        db
          .collection('users')
          .aggregate([
            { $match: filter },
            { $lookup: { from: 'diagnoses', localField: '_id', foreignField: 'userId', as: 'diagnoses' } },
            { $addFields: { diagnosisCount: { $size: '$diagnoses' } } },
            { $count: 'total' },
          ])
          .toArray(),
        db.collection('users').aggregate(pipeline).toArray(),
      ]);
      const total = (countResult[0] as { total?: number } | undefined)?.total ?? 0;
      const items = (users as Array<Record<string, unknown>>).map((u) => ({
        _id: String(u._id),
        name: u.name ?? '',
        email: u.email ?? '',
        image: u.image ?? null,
        role: u.role ?? 'user',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        diagnosisCount: (u.diagnosisCount as number) ?? 0,
      }));
      return NextResponse.json({
        items,
        total,
        page,
        perPage: PER_PAGE,
        totalPages: Math.ceil(total / PER_PAGE),
      });
    }

    const sortField = sortBy === 'name' ? 'name' : sortBy === 'email' ? 'email' : sortBy === 'role' ? 'role' : 'createdAt';

    // role でソート時: null/未設定を 'user' に正規化してソート（MongoDB は null を先頭に置くため）
    const useRoleAggregation = sortBy === 'role';
    let users: Array<Record<string, unknown>>;

    if (useRoleAggregation) {
      const [countResult, aggResult] = await Promise.all([
        db.collection('users').countDocuments(filter),
        db
          .collection('users')
          .aggregate([
            { $match: filter },
            { $addFields: { _sortRole: { $ifNull: ['$role', 'user'] } } },
            { $sort: { _sortRole: order } },
            { $skip: (page - 1) * PER_PAGE },
            { $limit: PER_PAGE },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                image: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const total = countResult;
      users = aggResult as Array<Record<string, unknown>>;
      const diagnosisCounts = (await db
        .collection('diagnoses')
        .aggregate([
          { $group: { _id: '$userId', count: { $sum: 1 } } },
          { $match: { _id: { $in: users.map((u) => u._id) } } },
        ])
        .toArray()) as Array<{ _id: unknown; count: number }>;

      const countMap = Object.fromEntries(
        diagnosisCounts.map((d) => [
          String(d._id && typeof d._id === 'object' && 'toString' in d._id ? (d._id as { toString: () => string }).toString() : d._id),
          d.count,
        ])
      );

      const items = users.map((u) => ({
        _id: String(u._id),
        name: u.name ?? '',
        email: u.email ?? '',
        image: u.image ?? null,
        role: u.role ?? 'user',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        diagnosisCount: countMap[String(u._id)] ?? 0,
      }));

      return NextResponse.json({
        items,
        total,
        page,
        perPage: PER_PAGE,
        totalPages: Math.ceil(total / PER_PAGE),
      });
    }

    const useCaseInsensitiveSort = sortBy === 'name' || sortBy === 'email';
    const findOptions = useCaseInsensitiveSort ? { collation: CASE_INSENSITIVE_COLLATION } : {};

    const [usersRaw, total] = await Promise.all([
      db
        .collection('users')
        .find(filter, findOptions)
        .sort({ [sortField]: order })
        .skip((page - 1) * PER_PAGE)
        .limit(PER_PAGE)
        .project({
          _id: 1,
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .toArray(),
      db.collection('users').countDocuments(filter),
    ]);
    users = usersRaw as Array<Record<string, unknown>>;

    const diagnosisCounts = (await db
      .collection('diagnoses')
      .aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $match: { _id: { $in: users.map((u) => u._id) } } },
      ])
      .toArray()) as Array<{ _id: unknown; count: number }>;

    const countMap = Object.fromEntries(
      diagnosisCounts.map((d) => [
        String(d._id && typeof d._id === 'object' && 'toString' in d._id ? (d._id as { toString: () => string }).toString() : d._id),
        d.count,
      ])
    );

    const items = users.map((u) => ({
      _id: String(u._id),
      name: u.name ?? '',
      email: u.email ?? '',
      image: u.image ?? null,
      role: u.role ?? 'user',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      diagnosisCount: countMap[String(u._id)] ?? 0,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      perPage: PER_PAGE,
      totalPages: Math.ceil(total / PER_PAGE),
    });
  } catch (error) {
    console.error('[admin/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
