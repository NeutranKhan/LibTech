'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import type { User } from '@/lib/domain';
export function AccountNavigation() {
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    let live = true;
    api<{ user: User | null }>('me')
      .then((result) => {
        if (live) setUser(result.user);
      })
      .catch(() => {
        if (live) setUser(null);
      });
    return () => {
      live = false;
    };
  }, []);
  if (user === undefined)
    return (
      <span className="small-text muted" aria-label="Checking your session">
        …
      </span>
    );
  return user ? (
    <>
      <Link href="/profile" className="button secondary small">
        My profile
      </Link>
      <Link href="/dashboard" className="button small">
        Dashboard
      </Link>
    </>
  ) : (
    <>
      <Link href="/login" className="button secondary small">
        Log in
      </Link>
      <Link href="/signup" className="button small">
        Start learning
      </Link>
    </>
  );
}
