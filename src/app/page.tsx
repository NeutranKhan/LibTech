import Link from 'next/link';
import { MiniLesson } from '@/components/mini-lesson';
import { Header, Footer } from '@/components/public-shell';
import { catalog } from '@/server/catalog';
import { currentUser } from '@/server/auth';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Home() {
  if (await currentUser()) redirect('/dashboard');
  const courses = await catalog();
  const featured = courses[0];
  const price = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  return (
    <>
      <Header />
      <main className="marketing-main">
        <section className="hero wrap">
          <div className="hero-intro">
            <span className="eyebrow">THE FUTURE IS A SKILL YOU CAN LEARN</span>
            <h1>
              Learn AI.
              <br />
              Build what’s
              <br />
              <span>next.</span>
            </h1>
            <p className="hero-copy">
              Turn your curiosity into capability. Build practical AI skills through short lessons,
              real-world challenges, and feedback that moves you forward.
            </p>
            <div className="actions">
              <Link className="button" href="/courses">
                Find your first course
              </Link>
              <a className="text-link" href="#try-it">
                Try a quick lesson ↗
              </a>
            </div>
            <div className="hero-facts">
              <span>◎ No experience needed</span>
              <span>◷ Learn at your pace</span>
              <span>✧ One-time course access</span>
            </div>
          </div>
          <div className="hero-lesson" id="try-it">
            <MiniLesson />
            <div className="lesson-bottom">
              <span>✦ Learn by doing</span>
              <span>About 1 minute</span>
            </div>
          </div>
        </section>
        <div className="skills-strip">
          <div className="wrap">
            <span>LESS SCROLLING. MORE DOING.</span>
            <strong>Write better prompts</strong>
            <span>✳</span>
            <strong>Make work lighter</strong>
            <span>✳</span>
            <strong>Think critically</strong>
            <span>✳</span>
            <strong>Build with confidence</strong>
          </div>
        </div>
        <section className="wrap section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
              <h2>Your next skill starts here.</h2>
            </div>
            <Link href="/courses" className="text-link">
              Explore courses ↗
            </Link>
          </div>
          {featured ? (
            <div className="feature-course">
              <div className="course-art">
                <span className="eyebrow">THE FOUNDATIONS COLLECTION</span>
                <div className="abstract-grid" aria-hidden="true">
                  AI<span>✳</span>
                  <span>↗</span>
                  <span>01</span>
                </div>
                <span>LESS THEORY. MORE “I DID THAT.”</span>
              </div>
              <div className="course-content">
                <div className="tags">
                  <span className="badge">{featured.difficulty}</span>
                  <span className="muted">
                    {featured.modules.length} modules ·{' '}
                    {featured.modules.reduce((count, module) => count + module.lessons.length, 0)}{' '}
                    lessons
                  </span>
                </div>
                <h3>{featured.title}</h3>
                <p>{featured.description}</p>
                <div className="course-skills">
                  <span>Prompt writing</span>
                  <span>Everyday productivity</span>
                  <span>Responsible AI</span>
                </div>
                <div className="course-bottom">
                  <div>
                    <strong className="price">{price(featured.priceCents, 'USD')}</strong>
                    <span className="muted">One-time payment · lifetime access</span>
                  </div>
                  <Link href={'/courses/' + featured.slug} className="button">
                    Explore this course
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">New courses are on the way. Check back soon.</p>
          )}
        </section>
        <section className="wrap section" id="how-it-works">
          <span className="eyebrow">BUILT FOR YOUR EVERYDAY</span>
          <h2>
            A little practice.
            <br />A lot more possibility.
          </h2>
          <div className="three-grid">
            {[
              [
                '01',
                'Learn something useful',
                'Short, clear explanations that respect your time. No long videos to sit through.',
              ],
              [
                '02',
                'Put it into practice',
                'Try prompts, work through real scenarios, and get feedback while you learn.',
              ],
              [
                '03',
                'Make your progress count',
                'Earn XP, build a learning streak, and finish with a verifiable certificate.',
              ],
            ].map(([n, t, d]) => (
              <article className="step-card" key={n}>
                <span className="step-number">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="wrap section faq-section">
          <div>
            <span className="eyebrow">A FEW THINGS TO KNOW</span>
            <h2>
              Curious? Good.
              <br />
              You’ll fit right in.
            </h2>
            <p className="muted">
              For students, professionals, teachers, and anyone ready to make AI useful.
            </p>
          </div>
          <div>
            {[
              [
                'Do I need to know how to code?',
                'No. AI Essentials starts with the basics and uses everyday examples. All you need is curiosity and a browser.',
              ],
              [
                'Is this a subscription?',
                'No. Each course is a one-time purchase at its displayed price, with access for as long as LibTech operates the service.',
              ],
              [
                'Can I learn on my phone?',
                'Yes. Lessons are text-first, mobile-friendly, and designed to use little data. Your progress saves as you go when online.',
              ],
              [
                'How do payments work?',
                'Submit your payment reference using the course payment instructions. Access begins after an administrator verifies your payment.',
              ],
              [
                'Will I get a certificate?',
                'Complete every lesson and pass the final assessment to earn a LibTech course-completion certificate. It can be verified with its unique link.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="wrap closing">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>
            Start small.
            <br />
            Build something bigger.
          </h2>
          <Link href="/courses" className="button light">
            Let’s learn something
          </Link>
          <p>No subscription. No rush. Just progress.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
