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
      <span className="eyebrow">LET’S GET STARTED</span>
      <h2>A new skill is waiting.</h2>
      <p>Create your account. Your first small win is next.</p>
      <AuthForm mode="signup" destination={destination} />
    </>
  );
}
