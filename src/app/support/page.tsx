import { Header, Footer } from '@/components/public-shell';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Support free learning' };
export default function Page() {
  let donationUrl = '';
  try {
    const url = new URL(process.env.DONATION_URL || '');
    if (url.protocol === 'https:' && !url.username && !url.password) donationUrl = url.href;
  } catch {}
  return (
    <>
      <Header />
      <main className="wrap section legal">
        <span className="eyebrow">LEARNING FOR EVERYONE</span>
        <h1 className="page-title">Help keep learning free.</h1>
        <p className="lead">
          All current LibTech courses are free. If you find them useful, an optional donation can
          help support hosting and new learning materials.
        </p>
        <div className="card card-body">
          <h2>Your learning comes first.</h2>
          <p>
            You never need to donate to enroll, complete lessons, or earn a completion certificate.
            Donating does not unlock extra access or benefits.
          </p>
          {donationUrl ? (
            <a className="button" href={donationUrl} target="_blank" rel="noopener noreferrer">
              Donate to LibTech
            </a>
          ) : (
            <p>
              Online donations are not available yet. You can support LibTech now by sharing it with
              someone who wants to learn.
            </p>
          )}
          <p>
            Questions about a contribution? Contact libtech1393@gmail.com. LibTech does not claim
            charitable status or tax-deductibility for contributions.
          </p>
        </div>
        <Link className="button" href="/courses">
          Explore free courses
        </Link>
      </main>
      <Footer />
    </>
  );
}
