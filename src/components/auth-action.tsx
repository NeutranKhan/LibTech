'use client';
import { useState } from 'react';
import Link from 'next/link';
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { browserAuth } from '@/lib/firebase-client';
import { authError } from '@/lib/auth-errors';
import { parseEmailActionLink } from '@/lib/email-action';
import { authHref, destinationFromContinueUrl } from '@/lib/navigation';
export function AuthAction({
  mode,
  code,
  destination = '/dashboard',
}: {
  mode: string;
  code: string;
  destination?: string;
}) {
  const [action, setAction] = useState({ mode, code });
  const [next, setNext] = useState(destination);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function act(form: FormData) {
    setBusy(true);
    try {
      const auth = browserAuth();
      if (action.mode === 'verifyEmail') await applyActionCode(auth, action.code);
      else {
        await verifyPasswordResetCode(auth, action.code);
        await confirmPasswordReset(auth, action.code, String(form.get('password')));
      }
      setDone(true);
      setMessage(
        action.mode === 'verifyEmail'
          ? 'Your email is verified. You can sign in now.'
          : 'Your password has been reset. Sign in with your new password.',
      );
    } catch (error) {
      setMessage(authError(error));
    } finally {
      setBusy(false);
    }
  }
  if (!action.code || !['verifyEmail', 'resetPassword'].includes(action.mode))
    return (
      <>
        <h2>Open your email link here</h2>
        <p>
          If your verification or password-reset link will not open, copy the complete link from
          your email and paste it below. LibTech will check it directly with Firebase.
        </p>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage('');
            try {
              const pasted = String(new FormData(event.currentTarget).get('link'));
              setAction(
                parseEmailActionLink(
                  pasted,
                  window.location.origin,
                  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
                ),
              );
              const continued = destinationFromContinueUrl(
                new URL(pasted).searchParams.get('continueUrl') || undefined,
                window.location.origin,
              );
              if (continued !== '/dashboard') setNext(continued);
            } catch (error) {
              setMessage(authError(error));
            }
          }}
        >
          <label>
            Email link
            <textarea
              name="link"
              required
              maxLength={8192}
              autoComplete="off"
              spellCheck={false}
              rows={4}
            />
          </label>
          <button className="button">Continue with email link</button>
        </form>
        {message && (
          <p role="alert" className="alert error">
            {message}
          </p>
        )}
        <Link href={authHref('login', next)} className="text-link">
          Back to sign in
        </Link>
      </>
    );
  return (
    <>
      <h2>{action.mode === 'verifyEmail' ? 'Verify your email' : 'Choose a new password'}</h2>
      {!done && (
        <form action={act} className="form-stack">
          {action.mode !== 'verifyEmail' && (
            <label>
              New password
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                required
              />
            </label>
          )}
          <button className="button" disabled={busy}>
            {busy
              ? 'Please wait…'
              : action.mode === 'verifyEmail'
                ? 'Verify email'
                : 'Reset password'}
          </button>
        </form>
      )}
      {message && (
        <p className="alert" role="status">
          {message}
        </p>
      )}
      <Link href={authHref('login', next)} className="text-link">
        Back to sign in
      </Link>
    </>
  );
}
