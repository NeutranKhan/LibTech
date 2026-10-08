import { currentUser } from '@/server/auth';
import { redirect } from 'next/navigation';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  if (!u || u.role === 'STUDENT') redirect('/dashboard');
  return children;
}
