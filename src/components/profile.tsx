'use client';
import './learning-space.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Award, BookOpen, CalendarDays, MapPin, Pencil, Sparkles, Flame } from 'lucide-react';
import { useDashboard } from './dashboard';
import { api } from '@/lib/client';
import { level, lessons } from '@/lib/domain';

export function Profile() {
  const { data, setData, error } = useDashboard();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'Overview' | 'Activity' | 'Certificates'>('Overview');
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [busy, setBusy] = useState(false);
  if (error)
    return (
      <div className="alert error" role="alert">
        {error}
      </div>
    );
  if (!data) return <div className="skeleton" aria-label="Loading your profile" />;
  const u = data.user;
  const earned = data.certificates.filter((c) => !c.revoked);
  const completed = data.progress.reduce((total, p) => total + p.completed.length, 0);
  const initials = u.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  async function save(form: FormData) {
    if (!data) return;
    setBusy(true);
    setSaveError('');
    setMessage('');
    const updates = {
      name: String(form.get('name')).trim(),
      country: String(form.get('country')).trim(),
      bio: String(form.get('bio')).trim(),
    };
    try {
      await api('profile', updates);
      setData({ ...data, user: { ...data.user, ...updates } });
      setEditing(false);
      setMessage('Your profile has been updated.');
      router.refresh();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="social-profile">
      <div className="profile-cover">
        <div className="profile-cover-orbit" aria-hidden="true">
          ✳
        </div>
        <span>CURIOUS TODAY. CAPABLE TOMORROW.</span>
        <span className="badge">Your learning story</span>
      </div>
      <section className="profile-identity card">
        <div className="profile-identity-top">
          <div className="profile-monogram" aria-label={'Initials for ' + u.name}>
            {initials}
          </div>
          <button
            className="button secondary"
            onClick={() => {
              setEditing(!editing);
              setSaveError('');
            }}
            aria-expanded={editing}
          >
            <Pencil size={16} />
            {editing ? 'Close editor' : 'Edit profile'}
          </button>
        </div>
        <h1>{u.name}</h1>
        <p className="profile-tagline">
          {level(u.xp).name} <span>·</span>{' '}
          {u.role === 'ADMIN'
            ? 'LibTech administrator'
            : u.role === 'INSTRUCTOR'
              ? 'LibTech instructor'
              : 'LibTech learner'}
        </p>
        <p className="profile-bio">
          {u.bio ||
            'Every skill starts with curiosity. Add a few words about yourself and what you want to learn.'}
        </p>
        <div className="profile-meta">
          {u.country && (
            <span>
              <MapPin size={15} />
              {u.country}
            </span>
          )}
          <span>
            <CalendarDays size={15} />
            Joined{' '}
            {new Date(u.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </span>
          <span>Visible only to you</span>
        </div>
        <div className="profile-social-stats">
          {[
            [u.xp, 'XP earned'],
            [completed, 'Lessons completed'],
            [earned.length, 'Certificates'],
            [u.streak, 'Day streak'],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      {message && (
        <p className="alert success" role="status">
          {message}
        </p>
      )}
      {editing && (
        <section className="card card-body profile-editor" aria-label="Edit your profile">
          <h2 className="subheading">Make it yours</h2>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              void save(new FormData(e.currentTarget));
            }}
          >
            <label>
              Full name
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={u.name}
                autoComplete="name"
              />
            </label>
            <label>
              Country
              <input
                name="country"
                maxLength={80}
                defaultValue={u.country}
                autoComplete="country-name"
              />
            </label>
            <label>
              About you
              <textarea
                name="bio"
                rows={4}
                maxLength={500}
                defaultValue={u.bio}
                placeholder="What are you curious about? What would you like to create?"
              />
            </label>
            <p className="small-text muted">
              Your avatar uses your initials. Your email address is private.
            </p>
            {saveError && (
              <p className="alert error" role="alert">
                {saveError}
              </p>
            )}
            <div className="actions">
              <button className="button" disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      <nav className="profile-tabs" aria-label="Profile sections">
        {(['Overview', 'Activity', 'Certificates'] as const).map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Certificates' && <span>{earned.length}</span>}
          </button>
        ))}
      </nav>
      <div className="profile-body-grid">
        <section aria-label={tab}>
          {tab === 'Overview' && (
            <>
              <section className="card card-body">
                <div className="section-heading">
                  <h2 className="subheading">My learning collection</h2>
                  <BookOpen size={20} />
                </div>
                {data.courses.length ? (
                  data.courses.map((c) => {
                    const count =
                      data.progress.find((p) => p.courseId === c.id)?.completed.length || 0;
                    const total = lessons(c).length;
                    return (
                      <article className="profile-course" key={c.id}>
                        <span className="badge">{c.category}</span>
                        <h3>{c.title}</h3>
                        <p>
                          {count} of {total} lessons completed
                        </p>
                        <progress value={count} max={Math.max(total, 1)} />
                        <Link className="text-link" href={'/learn/' + c.id}>
                          Continue learning →
                        </Link>
                      </article>
                    );
                  })
                ) : (
                  <div className="profile-empty">
                    <BookOpen size={30} />
                    <h3>Your collection starts here.</h3>
                    <p>Courses you enroll in will appear on your profile.</p>
                    <Link className="button small" href="/courses">
                      Explore courses
                    </Link>
                  </div>
                )}
              </section>
              <section className="card card-body">
                <h2 className="subheading">Achievements</h2>
                {u.achievements.length ? (
                  <div className="profile-achievements">
                    {u.achievements.map((a) => (
                      <div key={a}>
                        <Award size={24} />
                        <strong>{a}</strong>
                        <span>Earned through learning</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">
                    Complete your first lesson to earn your first achievement. Your progress belongs
                    here.
                  </p>
                )}
              </section>
            </>
          )}
          {tab === 'Activity' && (
            <section className="card card-body">
              <h2 className="subheading">Your learning timeline</h2>
              {data.notifications.length ? (
                data.notifications.slice(0, 20).map((n) => (
                  <article className="profile-timeline-item" key={n.id}>
                    <Sparkles size={18} />
                    <div>
                      <Link href={n.href}>
                        <h3>{n.title}</h3>
                      </Link>
                      <p>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="profile-empty">
                  <Sparkles size={30} />
                  <h3>Your story is just beginning.</h3>
                  <p>Course milestones and achievements will appear here as you learn.</p>
                </div>
              )}
            </section>
          )}
          {tab === 'Certificates' && (
            <section className="card card-body">
              <h2 className="subheading">Earned certificates</h2>
              {earned.length ? (
                earned.map((c) => (
                  <article className="profile-course" key={c.id}>
                    <Award size={24} />
                    <h3>{c.courseName}</h3>
                    <p>Earned {new Date(c.issuedAt).toLocaleDateString()}</p>
                    <Link className="text-link" href={'/certificate/' + c.id}>
                      View certificate →
                    </Link>
                  </article>
                ))
              ) : (
                <div className="profile-empty">
                  <Award size={30} />
                  <h3>A milestone worth working toward.</h3>
                  <p>Complete a course and pass its final assessment to earn a certificate.</p>
                </div>
              )}
            </section>
          )}
        </section>
        <aside>
          <section className="card card-body profile-level">
            <span className="eyebrow">KEEP GROWING</span>
            <Sparkles size={30} />
            <h2>Level {level(u.xp).number}</h2>
            <p>{level(u.xp).name}</p>
            <progress max={250} value={level(u.xp).number === 5 ? 250 : u.xp % 250} />
            <small>
              {level(u.xp).number === 5
                ? 'Your learning keeps going.'
                : 250 - (u.xp % 250) + ' XP until your next level'}
            </small>
          </section>
          <section className="card card-body">
            <Flame size={22} />
            <h3>{u.streak} day learning streak</h3>
            <p className="muted">Small, regular steps build lasting confidence.</p>
            <Link className="text-link" href="/dashboard">
              Back to dashboard →
            </Link>
          </section>
          <section className="card card-body">
            <h3>Account details</h3>
            <p className="profile-email">{u.email}</p>
            <Link className="text-link" href="/forgot-password">
              Reset password
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
