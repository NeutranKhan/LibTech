import { appOrigin } from '@/server/origin';
import { notFound } from 'next/navigation';
import { store, configured } from '@/server/store';
import type { Certificate } from '@/lib/domain';
import { Brand } from '@/components/public-shell';
import { PrintButton } from '@/components/print-button';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify certificate', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) notFound();
  const c = configured() ? await store().get<Certificate>('certificates', id) : null;
  if (!c || c.revoked) notFound();
  return (
    <main className="certificate-page">
      <div className="certificate-toolbar">
        <Brand />
        <PrintButton />
      </div>
      <article className="certificate">
        <span className="eyebrow">LIBTECH · PRACTICAL SKILLS, NEW POSSIBILITIES</span>
        <div className="certificate-seal">✧</div>
        <p>CERTIFICATE OF COMPLETION</p>
        <h1>{c.studentName}</h1>
        <p>has successfully completed</p>
        <h2>{c.courseName}</h2>
        <p>and fulfilled the required lessons and final assessment.</p>
        <div className="certificate-signature">
          <strong>{c.organization} Learning Team</strong>
          <span>
            {new Date(c.issuedAt).toLocaleDateString('en', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="certificate-verification">
          <span>✓ Verified completion</span>
          <span>Certificate ID: {c.id}</span>
          <span>
            {appOrigin()}/certificate/{c.id}
          </span>
        </div>
      </article>
      <p className="small-text muted no-print">
        This certificate confirms completion of a LibTech course. It is not an accredited
        professional qualification.
      </p>
    </main>
  );
}
