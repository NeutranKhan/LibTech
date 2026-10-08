'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { authHref } from '@/lib/navigation';
export function FreeEnrollment({ courseId, slug }: { courseId: string; slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function enroll() {
    setBusy(true);
    setError('');
    try {
      const { user } = await api<{ user: unknown }>('me');
      if (!user) {
        router.push(authHref('login', '/courses/' + slug));
        return;
      }
      await api('enroll', { courseId });
      router.push('/learn/' + courseId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="button wide" onClick={enroll} disabled={busy}>
        {busy ? 'Opening your course…' : 'Start learning for free'}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
