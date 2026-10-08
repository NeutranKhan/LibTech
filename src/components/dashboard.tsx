'use client';
import './learning-space.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import {
  level,
  lessons,
  type User,
  type Course,
  type Progress,
  type Payment,
  type Notification,
  type Certificate,
} from '@/lib/domain';
import { Zap, BookOpen, Award, Flame } from 'lucide-react';
import { AnimatedNumber } from './motion-effects';
export interface DashboardData {
  profilePhotosEnabled: boolean;
  user: User;
  courses: Course[];
  progress: Progress[];
  payments: Payment[];
  notifications: Notification[];
  certificates: Certificate[];
}
export function useDashboard() {
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState('');
  useEffect(() => {
    api<DashboardData>('dashboard')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  return { data, setData, error };
}
export function Dashboard() {
  const { data, setData, error } = useDashboard();
  if (error)
    return (
      <div role="alert" className="alert error">
        {error}
      </div>
    );
  if (!data) return <div className="skeleton" aria-label="Loading your learning space" />;
  const { user, courses, progress, notifications, payments, certificates } = data;
  const l = level(user.xp);
  const completed = progress.reduce((n, p) => n + p.completed.length, 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MY DASHBOARD</span>
          <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
          <p>You don’t need to know everything. Just take the next step.</p>
        </div>
        <Link href="/courses" className="button secondary">
          Explore courses
        </Link>
      </div>
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">YOUR PERSONAL LEARNING SPACE</span>
          <h2>
            {courses.length
              ? 'One lesson closer to what’s next.'
              : 'Make room for your next skill.'}
          </h2>
          <p>
            {courses.length
              ? 'Pick up your course, practice at your own pace, and keep building confidence.'
              : 'Choose a course to start your learning journey. Your progress and achievements will live here.'}
          </p>
          <div className="actions">
            <Link className="button" href={courses.length ? '/learn/' + courses[0].id : '/courses'}>
              {courses.length ? 'Continue my course' : 'Find my first course'}
            </Link>
            <Link className="button secondary" href="/profile">
              View my profile
            </Link>
          </div>
        </div>
        <div className="dashboard-orbit" aria-hidden="true">
          <span>✳</span>
          <small>LEARN · PRACTICE · GROW</small>
        </div>
      </section>
      <div className="stats-grid">
        {[
          [Zap, 'Total XP', user.xp + ' XP'],
          [BookOpen, 'Lessons completed', completed],
          [Award, 'Certificates earned', certificates.filter((c) => !c.revoked).length],
          [Flame, 'Learning streak', user.streak + (user.streak === 1 ? ' day' : ' days')],
        ].map(([Icon, label, value]) => {
          const I = Icon as typeof Zap;
          return (
            <div className="stat-card" key={String(label)}>
              <I size={21} />
              <span>{String(label)}</span>
              <strong>
                <AnimatedNumber
                  value={parseInt(String(value), 10)}
                  suffix={String(value).replace(/^\d+/, '')}
                />
              </strong>
            </div>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <div>
          <h2 className="subheading">Keep the momentum going</h2>
          {courses.length ? (
            courses.map((c) => {
              const p = progress.find((p) => p.courseId === c.id);
              const total = lessons(c).length;
              const percent = Math.round(((p?.completed.length ?? 0) / Math.max(1, total)) * 100);
              return (
                <article key={c.id} className="card learning-card">
                  <div className="learning-icon">✳</div>
                  <div className="grow">
                    <span className="badge">{c.difficulty}</span>
                    <h3>{c.title}</h3>
                    <p className="next-lesson-label">
                      {percent === 100
                        ? 'Completed. Ready whenever you want to revisit.'
                        : 'Up next: ' +
                          (lessons(c).find((l) => l.id === p?.lastLessonId)?.title ||
                            lessons(c)[0]?.title ||
                            'Your first lesson')}
                    </p>
                    <div className="progress-label">
                      <span>
                        {p?.completed.length ?? 0} / {total} lessons
                      </span>
                      <strong>{percent}%</strong>
                    </div>
                    <progress value={percent} max={100} />
                    <Link className="button small" href={'/learn/' + c.id}>
                      {percent === 100
                        ? 'Revisit your course'
                        : percent
                          ? 'Continue learning'
                          : 'Start learning'}
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty">
              <span className="empty-icon">✳</span>
              <h3>Your next chapter is wide open.</h3>
              <p>Choose a course and begin building practical AI skills.</p>
              <Link className="button" href="/courses">
                Find your first course
              </Link>
            </div>
          )}
          {payments.length > 0 && (
            <>
              <h2 className="subheading">Your payments</h2>
              {payments.map((p) => (
                <div className="card row-card" key={p.id}>
                  <div>
                    <strong>{p.courseId}</strong>
                    <p className="small-text">
                      Reference: {p.reference}
                      {p.reason && ' · ' + p.reason}
                    </p>
                  </div>
                  <span className="badge">{p.status}</span>
                </div>
              ))}
            </>
          )}
          <h2 className="subheading">Recent activity</h2>
          {notifications.length ? (
            notifications.slice(0, 8).map((n) => (
              <div className="activity" key={n.id}>
                <span>✦</span>
                <div>
                  <Link href={n.href}>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                  </Link>
                  <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                </div>
                {!n.read && (
                  <button
                    className="text-link"
                    onClick={async () => {
                      await api('notifications/read', { id: n.id });
                      setData({
                        ...data,
                        notifications: notifications.map((v) =>
                          v.id === n.id ? { ...v, read: true } : v,
                        ),
                      });
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="muted">Your learning milestones will appear here.</p>
          )}
        </div>
        <aside>
          <div className="level-card">
            <span className="eyebrow">YOUR GROWTH, RECOGNIZED</span>
            <div className="level-number">{l.number}</div>
            <h3>{l.name}</h3>
            <p>
              Level {l.number} · {user.xp} XP
            </p>
            <progress max={250} value={l.number === 5 ? 250 : user.xp % 250} />
            <small>
              {l.number === 5
                ? 'You’ve reached the highest level. Keep exploring.'
                : 250 - (user.xp % 250) + ' XP to your next level'}
            </small>
          </div>
          <div className="card card-body">
            <h3>Your achievements</h3>
            {user.achievements.length ? (
              <div className="achievement-list">
                {user.achievements.map((a) => (
                  <span key={a}>✧ {a}</span>
                ))}
              </div>
            ) : (
              <p>Complete your first lesson to unlock your first achievement.</p>
            )}
          </div>
          <div className="tip-card">
            <span className="eyebrow">A LITTLE ENCOURAGEMENT</span>
            <p>Five focused minutes today can make tomorrow’s work feel easier.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
