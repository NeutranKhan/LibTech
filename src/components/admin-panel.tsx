'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import type { Settings, User, Enrollment, Progress, Certificate } from '@/lib/domain';
type Row = Record<string, unknown>;
type PageData = { items: Row[]; nextCursor: string | null };
const sections = [
  ['overview', 'Overview'],
  ['courses', 'Courses & lessons'],
  ['users', 'Students'],
  ['enrollments', 'Enrollments'],
  ['payments', 'Payments'],
  ['certificates', 'Certificates'],
  ['aiUsage', 'AI usage'],
  ['auditLogs', 'Audit log'],
  ['settings', 'Settings'],
] as const;
function text(v: unknown) {
  return typeof v === 'string' || typeof v === 'number'
    ? String(v)
    : typeof v === 'boolean'
      ? v
        ? 'Yes'
        : 'No'
      : '';
}
export function AdminPanel({ role }: { role: User['role'] }) {
  const [section, setSection] = useState(role === 'ADMIN' ? 'overview' : 'courses');
  const [data, setData] = useState<PageData>();
  const [metrics, setMetrics] = useState<Record<string, number>>();
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<{
    user: User;
    enrollments: Enrollment[];
    progress: Progress[];
    certificates: Certificate[];
  }>();
  const load = useCallback(
    async (cursor = '') => {
      setBusy(true);
      setError('');
      try {
        if (section === 'overview') {
          setMetrics(await api('admin/analytics'));
        } else if (section !== 'settings')
          setData(
            await api<PageData>('admin?section=' + section + (cursor ? '&cursor=' + cursor : '')),
          );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [section],
  );
  useEffect(() => {
    if (section === 'settings') return;
    let live = true;
    api(section === 'overview' ? 'admin/analytics' : 'admin?section=' + section)
      .then((value) => {
        if (!live) return;
        if (section === 'overview') setMetrics(value as Record<string, number>);
        else setData(value as PageData);
        setBusy(false);
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setBusy(false);
        }
      });
    return () => {
      live = false;
    };
  }, [section]);
  async function action(path: string, payload: unknown, question: string) {
    if (!window.confirm(question)) return;
    setBusy(true);
    try {
      await api(path, payload);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const allowed = role === 'ADMIN' ? sections : sections.filter((s) => s[0] === 'courses');
  const columns: Record<string, string[]> = {
    courses: ['title', 'status', 'difficulty', 'priceCents'],
    users: ['name', 'email', 'role', 'xp', 'suspended'],
    enrollments: ['userId', 'courseId', 'active', 'createdAt'],
    payments: ['userId', 'courseId', 'amountCents', 'reference', 'status'],
    certificates: ['studentName', 'courseName', 'issuedAt', 'revoked'],
    aiUsage: ['userId', 'lessonId', 'status', 'tokens', 'createdAt'],
    auditLogs: ['actorId', 'action', 'targetId', 'createdAt'],
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">BEHIND THE LEARNING</span>
          <h1>Manage LibTech</h1>
          <p>Useful courses. Thoughtful teaching. A clear view of your platform.</p>
        </div>
        {section === 'courses' && (
          <Link href="/admin/courses/new" className="button">
            Create course
          </Link>
        )}
      </div>
      <div className="admin-tabs" role="navigation" aria-label="Administration">
        {allowed.map(([id, label]) => (
          <button
            key={id}
            className={section === id ? 'active' : ''}
            onClick={() => {
              setSection(id);
              setError('');
              setData(undefined);
              setSearch('');
              setDetail(undefined);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}
          <button className="button secondary small" disabled={busy} onClick={() => load()}>
            Retry loading
          </button>
        </div>
      )}
      {section === 'settings' ? (
        <SettingsForm />
      ) : section === 'overview' ? (
        <>
          {metrics ? (
            <>
              <div className="stats-grid">
                {Object.entries({
                  Students: metrics.students,
                  'Active accounts': metrics.activeStudents,
                  Courses: metrics.courses,
                  Enrollments: metrics.enrollments,
                  'Courses completed': metrics.completed,
                  'Revenue (USD)': '$' + (metrics.revenueCents / 100).toFixed(2),
                  'Pending payments': metrics.pending,
                  'Valid certificates': metrics.certificates,
                  'AI requests': metrics.aiRequests,
                  'AI tokens': metrics.aiTokens,
                }).map(([k, v]) => (
                  <div className="stat-card" key={k}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div className="card card-body">
                <h3>Your platform at a glance</h3>
                <p>
                  Revenue includes approved payments and excludes requests marked refunded. Active
                  accounts means student accounts that are not suspended.
                </p>
                {metrics.students === 0 && (
                  <p>
                    No students have joined yet. Publish your first course and open enrollment when
                    payment instructions are ready.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="skeleton" />
          )}
        </>
      ) : (
        <>
          <div className="filter-bar">
            <label className="grow">
              Search this page
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the records below…"
              />
            </label>
            <button disabled={busy} className="button secondary" onClick={() => load()}>
              Refresh
            </button>
          </div>
          {busy && !data ? (
            <div className="skeleton" />
          ) : data?.items.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {(columns[section] ?? []).map((c) => (
                      <th key={c}>{c.replace(/([A-Z])/g, ' $1')}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items
                    .filter((row) =>
                      JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((row) => (
                      <tr key={text(row.id)}>
                        {(columns[section] ?? []).map((c) => (
                          <td key={c}>
                            {c.includes('Cents')
                              ? '$' + (Number(row[c]) / 100).toFixed(2)
                              : c === 'createdAt' || c === 'issuedAt'
                                ? new Date(text(row[c])).toLocaleDateString()
                                : text(row[c])}
                          </td>
                        ))}
                        <td>
                          <div className="table-actions">
                            {section === 'courses' && (
                              <Link
                                className="button secondary small"
                                href={'/admin/courses/' + text(row.id)}
                              >
                                Edit
                              </Link>
                            )}
                            {section === 'payments' && row.status === 'PENDING' && (
                              <>
                                <button
                                  disabled={busy}
                                  className="button small"
                                  onClick={() =>
                                    action(
                                      'admin/payment',
                                      { id: row.id, status: 'APPROVED', reason: '' },
                                      'Confirm that you have independently verified this payment. Approve and grant course access?',
                                    )
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  disabled={busy}
                                  className="button secondary small"
                                  onClick={() => {
                                    const reason = window.prompt(
                                      'Why is this payment being rejected?',
                                    );
                                    if (reason !== null)
                                      void action(
                                        'admin/payment',
                                        { id: row.id, status: 'REJECTED', reason },
                                        'Reject this payment request?',
                                      );
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {section === 'payments' && row.status === 'APPROVED' && (
                              <button
                                className="button secondary small"
                                onClick={() =>
                                  action(
                                    'admin/payment',
                                    {
                                      id: row.id,
                                      status: 'REFUNDED',
                                      reason: 'Refund processed outside LibTech.',
                                    },
                                    'Have you already returned the funds outside LibTech? This records the refund and removes access; it does not transfer money.',
                                  )
                                }
                              >
                                Record refund
                              </button>
                            )}
                            {section === 'users' && (
                              <>
                                <button
                                  className="button secondary small"
                                  onClick={async () => {
                                    try {
                                      setDetail(await api('admin/student?id=' + text(row.id)));
                                    } catch (e) {
                                      setError((e as Error).message);
                                    }
                                  }}
                                >
                                  View
                                </button>
                                <button
                                  className="button secondary small"
                                  onClick={() =>
                                    action(
                                      'admin/user',
                                      {
                                        id: row.id,
                                        action: row.suspended ? 'restore' : 'suspend',
                                        value: '',
                                      },
                                      (row.suspended ? 'Restore' : 'Suspend') + ' this account?',
                                    )
                                  }
                                >
                                  {row.suspended ? 'Restore' : 'Suspend'}
                                </button>
                                <select
                                  aria-label={'Change role for ' + text(row.name)}
                                  value={text(row.role)}
                                  onChange={(e) =>
                                    action(
                                      'admin/user',
                                      { id: row.id, action: 'role', value: e.target.value },
                                      'Change this account’s permissions to ' +
                                        e.target.value +
                                        '?',
                                    )
                                  }
                                >
                                  {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map((r) => (
                                    <option key={r}>{r}</option>
                                  ))}
                                </select>
                                <button
                                  className="button secondary small"
                                  onClick={() => {
                                    const id = window.prompt(
                                      'Enter the course ID to grant access:',
                                    );
                                    if (id)
                                      void action(
                                        'admin/user',
                                        { id: row.id, action: 'enroll', value: id },
                                        'Grant this student access to ' + id + '?',
                                      );
                                  }}
                                >
                                  Enroll
                                </button>
                              </>
                            )}
                            {section === 'enrollments' && row.active === true && (
                              <button
                                className="button secondary small"
                                onClick={() =>
                                  action(
                                    'admin/user',
                                    { id: row.userId, action: 'remove', value: row.courseId },
                                    'Remove this student’s access to the course?',
                                  )
                                }
                              >
                                Remove access
                              </button>
                            )}
                            {section === 'certificates' && !row.revoked && (
                              <button
                                className="button secondary small"
                                onClick={() =>
                                  action(
                                    'admin/certificate',
                                    { id: row.id },
                                    'Revoke this certificate? Its public verification page will no longer be valid.',
                                  )
                                }
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <h3>No {sections.find((s) => s[0] === section)?.[1].toLowerCase()} yet.</h3>
              <p>Real activity will appear here as people use LibTech.</p>
            </div>
          )}
          {data?.nextCursor && (
            <button
              disabled={busy}
              className="button secondary"
              onClick={() => load(data.nextCursor!)}
            >
              Next 50 records
            </button>
          )}
          {detail && (
            <section className="card card-body student-detail">
              <button className="text-link" onClick={() => setDetail(undefined)}>
                Close details
              </button>
              <h2 className="subheading">{detail.user.name}</h2>
              <p>
                {detail.user.email} · {detail.user.xp} XP ·{' '}
                {detail.user.achievements.join(', ') || 'No achievements yet'}
              </p>
              <h3>Course progress</h3>
              {detail.progress.length ? (
                detail.progress.map((p) => (
                  <p key={p.id}>
                    {p.courseId}: {p.completed.length} completed lessons · Updated{' '}
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                ))
              ) : (
                <p>No learning progress yet.</p>
              )}
              <h3>Certificates</h3>
              {detail.certificates.map((c) => (
                <p key={c.id}>
                  <Link className="text-link" href={'/certificate/' + c.id}>
                    {c.courseName}
                  </Link>
                </p>
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}
function SettingsForm() {
  const [settings, setSettings] = useState<Settings>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<Settings>('admin/settings')
      .then(setSettings)
      .catch((e) => setMessage(e.message));
  }, []);
  async function save(form: FormData) {
    setBusy(true);
    try {
      const values = {
        paymentInstructions: String(form.get('paymentInstructions')),
        paymentsEnabled: false,
        aiDailyLimit: Number(form.get('aiDailyLimit')),
        aiLessonLimit: Number(form.get('aiLessonLimit')),
        lessonXP: Number(form.get('lessonXP')),
        exerciseXP: Number(form.get('exerciseXP')),
        moduleXP: Number(form.get('moduleXP')),
        courseXP: Number(form.get('courseXP')),
      };
      setSettings(await api('admin/settings', values));
      setMessage('Settings saved.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card card-body narrow">
      <h2 className="subheading">Platform settings</h2>
      {message && (
        <div className="alert" role="status">
          {message}
        </div>
      )}
      {settings ? (
        <form action={save} className="form-stack">
          <label>
            Manual payment instructions
            <textarea
              name="paymentInstructions"
              rows={6}
              maxLength={3000}
              defaultValue={settings.paymentInstructions}
              placeholder="Provide your payment method, recipient, currency, amount instructions, and support contact."
            />
          </label>
          <label className="check-label">
            <input type="checkbox" name="paymentsEnabled" checked={false} disabled />
            Accept manual payment requests
          </label>
          <h3>AI usage limits</h3>
          <div className="two-grid">
            <label>
              Requests per student per day
              <input
                type="number"
                name="aiDailyLimit"
                min={0}
                max={100}
                defaultValue={settings.aiDailyLimit}
              />
            </label>
            <label>
              Requests per student per lesson
              <input
                type="number"
                name="aiLessonLimit"
                min={0}
                max={20}
                defaultValue={settings.aiLessonLimit}
              />
            </label>
          </div>
          <p className="small-text">
            Failed requests count toward the limits to prevent repeated expensive calls. Cached
            results do not consume another request.
          </p>
          <h3>XP rewards</h3>
          <div className="two-grid">
            {(['lessonXP', 'exerciseXP', 'moduleXP', 'courseXP'] as const).map((k) => (
              <label key={k}>
                {k.replace('XP', ' XP')}
                <input
                  name={k}
                  type="number"
                  min={0}
                  max={k === 'courseXP' ? 500 : k === 'moduleXP' ? 200 : 100}
                  defaultValue={settings[k]}
                />
              </label>
            ))}
          </div>
          <button className="button" disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      ) : (
        <div className="skeleton" />
      )}
    </div>
  );
}
