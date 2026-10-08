import { currentUser } from '@/server/auth';
import { redirect } from 'next/navigation';
import { AdminPanel } from '@/components/admin-panel';
export const metadata = { title: 'Manage LibTech' };
export default async function Page() {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.role === 'STUDENT') redirect('/dashboard');
  return <AdminPanel role={user.role} />;
}
