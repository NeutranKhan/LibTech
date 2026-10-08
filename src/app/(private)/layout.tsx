import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { AppShell } from '@/components/app-shell';
import { headers } from 'next/headers';
import { authHref } from '@/lib/navigation';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect(authHref('login', (await headers()).get('x-libtech-path')));
  return <AppShell user={user}>{children}</AppShell>;
}
