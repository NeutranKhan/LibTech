import { Header, Footer } from '@/components/public-shell';
import { OperatorContact } from '@/components/operator-contact';
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
          All current courses are free. Create an account to save progress and enroll. Donations are
          voluntary and do not affect course access, assessments, or certificates. Access remains
          subject to these terms while LibTech operates the service.
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
        <h2>Optional donations</h2>
        <p>
          Donations support LibTech and are not course purchases. For duplicate, mistaken, or
          unauthorized contributions, contact libtech1393@gmail.com with your payment reference. Do
          not send passwords or card details. Requests are reviewed individually; applicable legal
          rights remain unchanged. We do not claim contributions are tax-deductible.
        </p>
        <OperatorContact />
      </main>
      <Footer />
    </>
  );
}
