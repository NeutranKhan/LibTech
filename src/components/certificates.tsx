'use client';
import Link from 'next/link';
import { useDashboard } from './dashboard';
export function Certificates() {
  const { data, error } = useDashboard();
  return (
    <>
      <span className="eyebrow">PROGRESS YOU CAN SHARE</span>
      <h1 className="page-title">Your certificates</h1>
      <p>Every certificate represents lessons completed and skills put into practice.</p>
      {error && <p className="alert error">{error}</p>}
      {!data ? (
        <div className="skeleton" />
      ) : data.certificates.filter((c) => !c.revoked).length ? (
        <div className="catalog-grid">
          {data.certificates
            .filter((c) => !c.revoked)
            .map((c) => (
              <article className="card certificate-card" key={c.id}>
                <span className="certificate-seal">✧</span>
                <span className="eyebrow">CERTIFICATE OF COMPLETION</span>
                <h2>{c.courseName}</h2>
                <p>Earned {new Date(c.issuedAt).toLocaleDateString()}</p>
                <Link className="button" href={'/certificate/' + c.id}>
                  View and download
                </Link>
              </article>
            ))}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon">✧</span>
          <h3>Your first certificate is ahead of you.</h3>
          <p>Finish every lesson and pass the final assessment to earn it.</p>
          <Link className="button" href="/dashboard">
            Keep learning
          </Link>
        </div>
      )}
    </>
  );
}
