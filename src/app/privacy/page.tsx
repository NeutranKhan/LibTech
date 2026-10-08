import { Header, Footer } from '@/components/public-shell';
import { OperatorContact } from '@/components/operator-contact';
import { site } from '@/lib/site';
export const metadata = { title: 'Privacy' };
export default function Page() {
  return (
    <>
      <Header />
      <main className="wrap section legal">
        <span className="eyebrow">YOUR DATA, WITH CARE</span>
        <h1 className="page-title">Privacy at LibTech</h1>
        <p>
          LibTech uses account information to provide course access, save learning progress, and
          issue certificates.
        </p>
        <h2>Information used by the platform</h2>
        <p>
          Your account includes your name and email. We store enrollment, payment references,
          exercise responses, progress, XP, achievements, and certificate records. Optional profile
          information stays within your account and authorized administration screens.
        </p>
        <h2>AI feedback</h2>
        <p>
          When you choose “Get AI feedback,” your submitted exercise response and the lesson rubric
          are sent to OpenAI for evaluation. Do not include sensitive personal information,
          passwords, or confidential business data. Standard practice checks do not send your
          response to an AI provider.
        </p>
        <h2>Public certificates</h2>
        <p>
          Anyone with a valid certificate link can view the learner’s name, course title, completion
          date, and certificate ID. Email addresses and exercise answers are not included.
        </p>
        <h2>Account security and cookies</h2>
        <p>
          A session cookie keeps you signed in. It is used for authentication, not advertising. Your
          data is stored using Firebase. Access is limited by account permissions.
        </p>
        {site.retentionPolicy && (
          <section>
            <h2>Retention and data requests</h2>
            <p>{site.retentionPolicy}</p>
          </section>
        )}
        <OperatorContact />
      </main>
      <Footer />
    </>
  );
}
