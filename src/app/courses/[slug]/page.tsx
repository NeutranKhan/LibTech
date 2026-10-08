import { FreeEnrollment } from '@/components/free-enrollment';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/public-shell';
import { bySlug } from '@/server/catalog';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await bySlug((await params).slug);
  return {
    title: c?.title ?? 'Course unavailable',
    description: c?.description,
    openGraph: { title: c?.title, description: c?.description },
  };
}
export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await bySlug((await params).slug);
  if (!c) notFound();
  return (
    <>
      <Header />
      <main className="wrap section">
        <Link className="muted" href="/courses">
          Courses / {c.category}
        </Link>
        <div className="detail-grid">
          <div>
            <div className="tags">
              <span className="badge">{c.difficulty}</span>
              <span className="muted">{c.duration}</span>
            </div>
            <h1 className="page-title">{c.title}</h1>
            <p className="lead">{c.description}</p>
            <p>By {c.instructor}</p>
            <h2 className="subheading">What you’ll be able to do</h2>
            <ul className="outcomes">
              {c.outcomes.map((x) => (
                <li key={x}>✓ {x}</li>
              ))}
            </ul>
          </div>
          <aside className="card enrollment-card">
            <div className="course-cover">
              <span>YOUR NEXT CHAPTER</span>
              <strong>
                AI<span>✳</span>
              </strong>
            </div>
            <div className="card-body">
              <strong className="big-price">Free</strong>
              <p>Every lesson and completion certificate included. Donations are optional.</p>
              <FreeEnrollment courseId={c.id} slug={c.slug} />
              <ul className="plain-list">
                <li>✓ {c.modules.length} practical modules</li>
                <li>✓ {c.modules.reduce((n, m) => n + m.lessons.length, 0)} interactive lessons</li>
                <li>✓ Exercises and useful feedback</li>
                <li>✓ Verifiable completion certificate</li>
              </ul>
            </div>
          </aside>
        </div>
        <section className="curriculum">
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h2>One step at a time.</h2>
          {c.modules.map((m, i) => (
            <details key={m.id} open={i === 0}>
              <summary>
                <span>
                  <span className="module-index">{String(i + 1).padStart(2, '0')}</span>
                  {m.title}
                </span>
                <span>{m.lessons.length} lessons +</span>
              </summary>
              <ol>
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <span>{l.title}</span>
                    <span>{l.minutes} min</span>
                  </li>
                ))}
              </ol>
            </details>
          ))}
          <h3>What you’ll need</h3>
          <p>{c.requirements}</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
