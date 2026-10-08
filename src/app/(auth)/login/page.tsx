import { AuthForm } from '@/components/auth-form';
import { safeDestination } from '@/lib/navigation';
import { currentUser } from '@/server/auth';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const destination = safeDestination((await searchParams).next);
  if (await currentUser()) redirect(destination);
  return (
    <>
      <span className="eyebrow">GOOD TO SEE YOU</span>
      <h2>Keep your curiosity going.</h2>
      <p>Log in to pick up where you left off.</p>
      <AuthForm mode="login" destination={destination} />
    </>
  );
}
