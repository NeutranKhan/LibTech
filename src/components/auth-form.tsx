'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/client';
import { browserAuth } from '@/lib/firebase-client';
import { authError } from '@/lib/auth-errors';
import { authHref, safeDestination } from '@/lib/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  reload,
  type User,
} from 'firebase/auth';
export function AuthForm({
  mode,
  destination = '/dashboard',
}: {
  mode: 'login' | 'signup' | 'forgot';
  destination?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [verify, setVerify] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  async function finish(user: User) {
    await api('session', {
      idToken: await user.getIdToken(true),
      name: user.displayName || 'Learner',
    });
    await signOut(browserAuth());
    router.replace(safeDestination(destination));
    router.refresh();
  }
  async function verificationAction(resend: boolean) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const user = browserAuth().currentUser;
      if (!user) throw new Error('Enter your email and password again, then retry verification.');
      if (resend) {
        await sendEmailVerification(user, {
          url: window.location.origin + authHref('login', destination),
        });
        setMessage('Verification email sent. Check your inbox and spam folder, then return here.');
      } else {
        await reload(user);
        if (!user.emailVerified)
          throw new Error(
            'Your email is not verified yet. Open the verification link in your inbox, then try again.',
          );
        await finish(user);
      }
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit(form: FormData) {
    setBusy(true);
    setError('');
    setMessage('');
    setVerify(false);
    try {
      const auth = browserAuth();
      const email = String(form.get('email')).trim();
      const password = String(form.get('password'));
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email, {
          url: window.location.origin + authHref('login', destination),
        });
        setMessage('If an account exists for this email, a reset link will arrive shortly.');
        return;
      }
      if (mode === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        setVerify(true);
        setVerificationEmail(user.email || email);
        await updateProfile(user, { displayName: String(form.get('name')).trim() }).catch(() => {});
        try {
          await sendEmailVerification(user, {
            url: window.location.origin + authHref('login', destination),
          });
          setMessage(
            'Your account is created. Check your inbox and spam folder for the verification link, then choose “I have verified my email” below.',
          );
        } catch (e) {
          setMessage(
            'Your account is created, but the verification email could not be sent. You can resend it below; you do not need to create another account.',
          );
          setError(authError(e));
        }
        return;
      }
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (!user.emailVerified) {
        setVerify(true);
        setVerificationEmail(user.email || email);
        setMessage(
          'Your password was accepted. Verify your email to finish signing in. Use the buttons below to resend the link or continue after verification.',
        );
        return;
      }
      await finish(user);
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
        className="form-stack"
      >
        {mode === 'signup' && (
          <label>
            Full name
            <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
        )}
        <label>
          Email address
          <input name="email" type="email" required autoComplete="email" />
        </label>
        {mode !== 'forgot' && (
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={mode === 'signup' ? 10 : undefined}
              maxLength={128}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            {mode === 'signup' && <small>Use at least 10 characters.</small>}
          </label>
        )}
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="alert success" role="status">
            {message}
          </div>
        )}
        <button className="button wide" disabled={busy}>
          {busy
            ? 'Please wait…'
            : mode === 'signup'
              ? 'Create your account'
              : mode === 'forgot'
                ? 'Send reset link'
                : 'Log in'}
        </button>
        {verify && (
          <section className="form-stack" aria-label="Email verification">
            <p>
              Verify <strong>{verificationEmail}</strong> to continue.
            </p>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => verificationAction(false)}
            >
              I have verified my email
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => verificationAction(true)}
            >
              Resend verification email
            </button>
          </section>
        )}
      </form>
      <p className="auth-links">
        <Link href={authHref('auth/action', destination)}>
          Email link won’t open? Complete it here
        </Link>
      </p>
      {mode === 'login' ? (
        <div className="auth-links">
          <Link href={authHref('forgot-password', destination)}>Forgot password?</Link>
          <p>
            New to LibTech?{' '}
            <Link className="text-link" href={authHref('signup', destination)}>
              Create an account
            </Link>
          </p>
        </div>
      ) : (
        <p className="auth-links">
          <Link href={authHref('login', destination)}>Back to log in</Link>
        </p>
      )}
    </>
  );
}
