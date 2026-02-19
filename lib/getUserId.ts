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

  const email = session.user.email;
  let user = await db.collection('users').findOne({ email });
  if (!user) {
    const insertResult = await db.collection('users').insertOne({
      email,
      name: session.user.name ?? '',
      image: session.user.image ?? null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    user = { _id: insertResult.insertedId };
    if (process.env.NODE_ENV === 'development') {
      console.log('[getUserId] created new user:', { email, userId: insertResult.insertedId.toString() });
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[getUserId] found user:', { email, userId: user._id.toString() });
  }
  return user._id as Types.ObjectId;
}
