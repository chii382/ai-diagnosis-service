import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { connectDB } from '@/lib/db';
import { Types } from 'mongoose';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const { id } = await params;
    let oid: Types.ObjectId;
    try {
      oid = new Types.ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const user = await db.collection('users').findOne({ _id: oid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name ?? '',
      email: user.email ?? '',
      image: user.image ?? null,
      gender: user.gender ?? '',
      ageGroup: user.ageGroup ?? '',
      jobType: user.jobType ?? '',
      industry: user.industry ?? '',
      other: user.other ?? '',
      role: user.role ?? 'user',
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[admin/users GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const { id } = await params;
    const body = await request.json();
    const { role } = body as { role?: string };

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    let oid: Types.ObjectId;
    try {
      oid = new Types.ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const result = await db.collection('users').updateOne(
      { _id: oid },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error('[admin/users PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const { id } = await params;
    let oid: Types.ObjectId;
    try {
      oid = new Types.ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const user = await db.collection('users').findOne({ _id: oid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentEmail = (admin.session.user.email ?? '').toLowerCase().trim();
    const targetEmail = ((user.email as string) ?? '').toLowerCase().trim();
    if (currentEmail && currentEmail === targetEmail) {
      return NextResponse.json(
        { error: '自分のユーザーは削除できません。' },
        { status: 400 }
      );
    }

    await Promise.all([
      db.collection('diagnoses').deleteMany({ userId: oid }),
      db.collection('users').deleteOne({ _id: oid }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/users DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
