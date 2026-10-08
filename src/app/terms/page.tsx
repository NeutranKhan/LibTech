import { Header, Footer } from '@/components/public-shell';
import { OperatorContact } from '@/components/operator-contact';
import { site } from '@/lib/site';
export const metadata = { title: 'Learning terms' };
export default function Page() {
  return (
    <>
      <Header />
      <main className="wrap section legal">
        <span className="eyebrow">CLEAR EXPECTATIONS</span>
        <h1 className="page-title">Learning with LibTech</h1>
        <h2>Course access</h2>
        <p>
          Each course is a one-time purchase at the displayed price. Approved purchases grant
          lifetime access to that course while LibTech operates the service. Manual payments require
          independent verification before access is granted.
        </p>
        <h2>Learning and certificates</h2>
        <p>
          Complete the required lessons and pass the final assessment to earn a course-completion
          certificate. These certificates are evidence of completion, not accredited qualifications
          or guarantees of employment.
        </p>
        <h2>Responsible use</h2>
        <p>
          Keep your login details private. Do not submit confidential information, abuse the
          exercise service, or attempt to manipulate payments, progress, or certificates. AI
          feedback may contain mistakes and should be reviewed critically.
        </p>
        <h2>Payments and refunds</h2>
        <p>
          Only follow the payment instructions shown inside the signed-in course checkout. Refunds
          must be arranged with the operator.
        </p>
        <p>{site.refundPolicy}</p>
        <OperatorContact />
      </main>
      <Footer />
    </>
  );
}
