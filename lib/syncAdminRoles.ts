import { connectDB } from './db';

/**
 * .env.local の ADMIN_EMAILS を正として DB の users コレクションの role を同期する。
 * 起動時および既存ユーザー取得時に呼び出し。
 */
export async function syncAdminRoles(): Promise<{ updated: number }> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const mongoose = await connectDB();
  const db = mongoose.connection.db;
  if (!db) return { updated: 0 };

  const users = await db.collection('users').find({}).toArray();
  const bulkOps: { updateOne: { filter: { _id: unknown }; update: { $set: { role: string; updatedAt: Date } } } }[] =
    [];

  for (const user of users) {
    const email = user.email as string | undefined;
    if (!email) continue;
    const emailLower = email.toLowerCase();
    const shouldBeAdmin = adminEmails.includes(emailLower);
    const currentRole = user.role === 'admin' ? 'admin' : 'user';
    const targetRole = shouldBeAdmin ? 'admin' : 'user';
    if (currentRole !== targetRole) {
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { role: targetRole, updatedAt: new Date() } },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('users').bulkWrite(bulkOps as any);
    if (process.env.NODE_ENV === 'development') {
      console.log('[syncAdminRoles] updated', bulkOps.length, 'user(s) to match ADMIN_EMAILS');
    }
  }
  return { updated: bulkOps.length };
}
