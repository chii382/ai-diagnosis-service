import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MongoClient } from 'mongodb';
import { PLAN_FREE, normalizePlan } from '@/lib/plan';

// MongoDB接続を再利用するためのシングルトンパターン
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getMongoClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === 'development') {
    // 開発環境ではグローバル変数を使用してホットリロード時の接続を再利用
    if (!(global as any)._mongoClientPromiseProfile) {
      client = new MongoClient(process.env.MONGODB_URI);
      (global as any)._mongoClientPromiseProfile = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromiseProfile;
  } else {
    // 本番環境では新しい接続を作成
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise!;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getMongoClient();
    // NextAuth の MongoDB Adapter と同じデータベースを使うため
    // 接続文字列で指定されたデフォルトDBをそのまま利用する
    const db = client.db();
    const usersCollection = db.collection('users');

    let user = await usersCollection.findOne({ email: session.user.email });

    // ユーザーが未作成の場合（診断未実施でプロフィールへ直接来た場合など）、作成する
    if (!user) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
      const defaultRole = adminEmails.includes(session.user.email.toLowerCase()) ? 'admin' : 'user';
      await usersCollection.insertOne({
        email: session.user.email,
        name: session.user.name ?? '',
        image: session.user.image ?? null,
        emailVerified: null,
        role: defaultRole,
        plan: PLAN_FREE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await usersCollection.findOne({ email: session.user.email });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      plan: normalizePlan(user.plan),
      gender: user.gender ?? '',
      ageGroup: user.ageGroup ?? '',
      jobType: user.jobType ?? '',
      industry: user.industry ?? '',
      other: user.other ?? '',
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      image,
      gender,
      ageGroup,
      jobType,
      industry,
      other,
    } = body as {
      name?: string;
      image?: string | null;
      gender?: string;
      ageGroup?: string;
      jobType?: string;
      industry?: string;
      other?: string;
    };

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const client = await getMongoClient();
    // NextAuth と同じDBを利用
    const db = client.db();
    const usersCollection = db.collection('users');

    const updateFields: Record<string, unknown> = {
      name,
      updatedAt: new Date(),
    };

    // 画像が送られてきた場合のみ更新（Data URL や URL を想定）
    if (typeof image === 'string') {
      updateFields.image = image;
    }
    // 性別・年齢・職種・業種・その他は、空文字が送られても上書きして前回データを消す
    if (gender !== undefined && gender !== null) updateFields.gender = String(gender);
    if (ageGroup !== undefined && ageGroup !== null) updateFields.ageGroup = String(ageGroup);
    if (jobType !== undefined && jobType !== null) updateFields.jobType = String(jobType);
    if (industry !== undefined && industry !== null) updateFields.industry = String(industry);
    if (other !== undefined && other !== null) updateFields.other = String(other);

    const result = await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: updateFields,
      }
    );

    // ユーザーが未作成の場合（診断未実施でプロフィールへ直接来た場合など）、作成する
    if (result.matchedCount === 0) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
      const defaultRole = adminEmails.includes(session.user.email.toLowerCase()) ? 'admin' : 'user';
      await usersCollection.insertOne({
        email: session.user.email,
        name,
        image: typeof image === 'string' ? image : session.user.image ?? null,
        emailVerified: null,
        role: defaultRole,
        plan: PLAN_FREE,
        gender: gender ?? '',
        ageGroup: ageGroup ?? '',
        jobType: jobType ?? '',
        industry: industry ?? '',
        other: other ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const updatedUser = await usersCollection.findOne({ email: session.user.email });

    return NextResponse.json({
      name: updatedUser?.name,
      email: updatedUser?.email,
      image: updatedUser?.image,
      emailVerified: updatedUser?.emailVerified,
      plan: normalizePlan(updatedUser?.plan),
      gender: updatedUser?.gender ?? '',
      ageGroup: updatedUser?.ageGroup ?? '',
      jobType: updatedUser?.jobType ?? '',
      industry: updatedUser?.industry ?? '',
      other: updatedUser?.other ?? '',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
