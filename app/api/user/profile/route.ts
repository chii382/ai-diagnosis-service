import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MongoClient } from 'mongodb';

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

const dbName = process.env.MONGODB_DB_NAME || 'auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getMongoClient();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
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
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await usersCollection.findOne({ email: session.user.email });

    return NextResponse.json({
      name: updatedUser?.name,
      email: updatedUser?.email,
      image: updatedUser?.image,
      emailVerified: updatedUser?.emailVerified,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
