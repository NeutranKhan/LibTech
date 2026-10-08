import Link from 'next/link';
import { Header } from '@/components/public-shell';
export default function Page() {
  return (
    <>
      <Header />
      <main className="empty wrap section">
        <span className="eyebrow">A SMALL DETOUR</span>
        <h1 className="page-title">This page isn’t here.</h1>
        <p>The link may have changed, or the certificate may be unavailable.</p>
        <Link href="/" className="button">
          Back to LibTech
        </Link>
      </main>
    </>
  );
}
