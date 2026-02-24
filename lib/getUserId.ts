import { Session } from 'next-auth';
import { connectDB } from './db';
import { Types } from 'mongoose';

export async function getUserIdFromSession(session: Session | null): Promise<Types.ObjectId | null> {
  if (!session?.user?.email) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getUserId] session or email missing:', {
        hasSession: !!session,
        hasEmail: !!session?.user?.email,
      });
    }
    return null;
  }

  await connectDB();
  const { default: mongoose } = await import('mongoose');
  const db = mongoose.connection.db;
  if (!db) {
    if (process.env.NODE_ENV === 'development') console.log('[getUserId] db is null');
    return null;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const defaultRole = adminEmails.includes(session.user.email.toLowerCase()) ? 'admin' : 'user';

  const email = session.user.email;
  let user = await db.collection('users').findOne({ email });
  if (!user) {
    const insertResult = await db.collection('users').insertOne({
      email,
      name: session.user.name ?? '',
      image: session.user.image ?? null,
      emailVerified: null,
      role: defaultRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    user = { _id: insertResult.insertedId };
    if (process.env.NODE_ENV === 'development') {
      console.log('[getUserId] created new user:', { email, userId: insertResult.insertedId.toString() });
    }
  } else {
    // 既存ユーザー: ADMIN_EMAILS と DB の role が一致しない場合は更新
    const currentRole = user.role === 'admin' ? 'admin' : 'user';
    if (currentRole !== defaultRole) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { role: defaultRole, updatedAt: new Date() } }
      );
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[getUserId] found user:', { email, userId: user._id.toString() });
    }
  }
  return user._id as Types.ObjectId;
}
