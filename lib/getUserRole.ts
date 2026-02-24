import { connectDB } from './db';

export async function getUserRoleByEmail(email: string | undefined | null): Promise<'admin' | 'user'> {
  if (!email) return 'user';

  // 初回ログイン時はユーザーがDBに存在しないため、ADMIN_EMAILSを先にチェックする
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.includes(email.toLowerCase())) return 'admin';

  await connectDB();
  const { default: mongoose } = await import('mongoose');
  const db = mongoose.connection.db;
  if (!db) return 'user';

  const user = await db
    .collection('users')
    .findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
  const role = user?.role;
  if (role === 'admin' || role === 'user') return role;
  return 'user';
}
