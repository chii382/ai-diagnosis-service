import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminLayoutNav from './AdminLayoutNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== 'admin') {
    redirect('/?adminDenied=1');
  }
  return <AdminLayoutNav>{children}</AdminLayoutNav>;
}
