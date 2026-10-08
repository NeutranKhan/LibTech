'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty wrap section">
      <h1 className="page-title">Let’s try that again.</h1>
      <p>Something interrupted this page. Your saved progress is safe.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
