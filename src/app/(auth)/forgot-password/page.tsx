import { AuthForm } from '@/components/auth-form';
import { safeDestination } from '@/lib/navigation';
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const destination = safeDestination((await searchParams).next);
  return (
    <>
      <h2>Let’s get you back in.</h2>
      <p>We’ll email a link to reset your password.</p>
      <AuthForm mode="forgot" destination={destination} />
    </>
  );
}
