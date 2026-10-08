'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
export function Checkout({
  courseId,
  title,
  priceCents,
  lessonCount,
}: {
  courseId: string;
  title: string;
  priceCents: number;
  lessonCount: number;
}) {
  const [settings, setSettings] = useState<{
    paymentsEnabled: boolean;
    paymentInstructions: string;
  }>();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ paymentsEnabled: boolean; paymentInstructions: string }>('settings/public')
      .then(setSettings)
      .catch((e) => setError(e.message));
  }, []);
  async function submit(form: FormData) {
    setBusy(true);
    setError('');
    try {
      await api('payments', { courseId, reference: String(form.get('reference')) });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <span className="eyebrow">ONE STEP CLOSER</span>
      <h1 className="page-title">{done ? 'You’re on the list.' : 'Join your course.'}</h1>
      <div className="checkout-summary">
        <div className="checkout-course-icon">✳</div>
        <div className="grow">
          <span className="eyebrow">YOUR COURSE</span>
          <h3>{title}</h3>
          <p>{lessonCount} interactive lessons · lifetime access</p>
        </div>
        <strong>
          ${(priceCents / 100).toFixed(2)}
          <small>USD · one time</small>
        </strong>
      </div>
      {done ? (
        <div className="card card-body">
          <span className="badge orange">PAYMENT PENDING</span>
          <h2 className="subheading">Your reference has been submitted.</h2>
          <p>
            An administrator will verify your payment. Your course appears in My learning when
            approved.
          </p>
          <Link href="/dashboard" className="button">
            Go to My learning
          </Link>
        </div>
      ) : (
        <div className="card card-body">
          <h2 className="subheading">Manual payment</h2>
          {settings?.paymentsEnabled ? (
            <>
              <p>
                Follow these payment instructions, then submit the exact transaction reference.
                Access starts after verification.
              </p>
              <div className="payment-instructions">{settings.paymentInstructions}</div>
              <form action={submit} className="form-stack">
                <label>
                  Transaction / payment reference
                  <input
                    name="reference"
                    minLength={5}
                    maxLength={120}
                    required
                    placeholder="Reference from your payment receipt"
                  />
                </label>
                <p className="small-text">
                  Submit only after you have paid. Keep your original receipt for verification.{' '}
                  Review our{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    payment and refund terms
                  </a>{' '}
                  before paying.
                </p>
                <button className="button" disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit payment reference'}
                </button>
              </form>
            </>
          ) : (
            <div className="alert">
              Payments are not open yet. Please check back soon. No payment has been collected.
            </div>
          )}
          {error && (
            <p className="alert error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
