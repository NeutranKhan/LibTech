import { AuthAction } from '@/components/auth-action';
import { safeDestination, destinationFromContinueUrl } from '@/lib/navigation';
import { appOrigin } from '@/server/origin';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; oobCode?: string; next?: string; continueUrl?: string }>;
}) {
  const p = await searchParams;
  return (
    <AuthAction
      mode={p.mode ?? 'resetPassword'}
      code={p.oobCode ?? ''}
      destination={
        p.next ? safeDestination(p.next) : destinationFromContinueUrl(p.continueUrl, appOrigin())
      }
    />
  );
}
