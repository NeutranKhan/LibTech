'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import {
  isExercise,
  lessons,
  type Block,
  type Course,
  type Lesson,
  type Progress,
  type User,
  type Feedback,
} from '@/lib/domain';
import { Check, ChevronLeft, ChevronRight, Lightbulb, Code, BookOpen } from 'lucide-react';
import { celebrateCompletion } from './motion-effects';
interface LessonData {
  aiEnabled: boolean;
  course: Course;
  lesson: Lesson;
  progress: Progress | null;
  user: User;
}
function Exercise({
  block,
  initial,
  draftKey,
  onSave,
  onCheck,
  aiEnabled,
}: {
  aiEnabled: boolean;
  draftKey: string;
  block: Block;
  initial: string;
  onSave: (id: string, value: string) => Promise<void>;
  onCheck: (id: string, value: string, ai: boolean) => Promise<Feedback>;
}) {
  const [answer, setAnswer] = useState(() => {
    try {
      return sessionStorage.getItem(draftKey) ?? initial;
    } catch {
      return initial;
    }
  });
  const [saved, setSaved] = useState('Saved');
  const [feedback, setFeedback] = useState<Feedback>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (answer === initial) return;
    const timer = setTimeout(() => {
      onSave(block.id, answer)
        .then(() => {
          setSaved('Saved');
          try {
            if (sessionStorage.getItem(draftKey) === answer) sessionStorage.removeItem(draftKey);
          } catch {}
        })
        .catch(() => setSaved('Not saved — check your connection.'));
    }, 700);
    return () => clearTimeout(timer);
  }, [answer, block.id, initial, onSave, draftKey]);
  const change = (value: string) => {
    setAnswer(value);
    try {
      sessionStorage.setItem(draftKey, value);
    } catch {}
    setSaved('Saving…');
    setFeedback(undefined);
  };
  async function check(ai = false) {
    setBusy(true);
    setError('');
    try {
      await onSave(block.id, answer);
      setSaved('Saved');
      setFeedback(await onCheck(block.id, answer, ai));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const choice = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKPOINT'].includes(block.type);
  const ordered = answer ? answer.split(' → ') : block.options;
  function move(index: number, direction: number) {
    const next = [...ordered];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    change(next.join(' → '));
  }
  return (
    <section className="exercise-block">
      <div className="section-heading">
        <span className="eyebrow">{block.required ? 'YOUR TURN' : 'OPTIONAL REFLECTION'}</span>
        <span className="badge">
          {block.type === 'AI_EXERCISE'
            ? 'Prompt challenge'
            : block.type.replaceAll('_', ' ').toLowerCase()}
        </span>
      </div>
      <h3>{block.text}</h3>
      {['AI_EXERCISE', 'PRACTICE_EXERCISE', 'SCENARIO', 'SHORT_ANSWER'].includes(block.type) && (
        <p className="small-text muted">
          The practice check looks for the terms named in the question. Use a complete response and
          compare your reasoning with the example.
        </p>
      )}
      {choice ? (
        <div className="choices" role="group" aria-label={block.text}>
          {block.options.map((o, i) => (
            <button
              type="button"
              aria-pressed={answer === o}
              className={'choice ' + (answer === o ? 'selected' : '')}
              key={o}
              onClick={() => change(o)}
            >
              <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          ))}
        </div>
      ) : block.type === 'ORDERING' ? (
        <div>
          {ordered.map((o, i) => (
            <div className="ordering-row" key={o}>
              <span>{o}</span>
              <button
                aria-label={'Move ' + o + ' up'}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                aria-label={'Move ' + o + ' down'}
                disabled={i === ordered.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
            </div>
          ))}
          <button className="button secondary small" onClick={() => change(ordered.join(' → '))}>
            Use this order
          </button>
        </div>
      ) : block.type === 'MATCHING' ? (
        <label>
          Match each item with its partner. Enter pairs as shown in the lesson.
          <div className="callout">{block.options.join(' · ')}</div>
          <input
            value={answer}
            maxLength={3000}
            onChange={(e) => change(e.target.value)}
            placeholder="Item = partner; Item = partner"
          />
        </label>
      ) : (
        <label className="answer-field">
          <span>{block.type === 'FILL_BLANK' ? 'Fill in the missing word' : 'Your response'}</span>
          {block.type === 'FILL_BLANK' ? (
            <input value={answer} maxLength={3000} onChange={(e) => change(e.target.value)} />
          ) : (
            <textarea
              value={answer}
              onChange={(e) => change(e.target.value)}
              maxLength={3000}
              rows={5}
              placeholder="Try it in your own words…"
            />
          )}
        </label>
      )}
      <div className="exercise-actions">
        <div className="actions">
          <button className="button" disabled={!answer.trim() || busy} onClick={() => check(false)}>
            {busy
              ? 'Checking…'
              : block.type === 'AI_EXERCISE'
                ? 'Check practice criteria'
                : 'Check my answer'}
          </button>
          {block.type === 'AI_EXERCISE' && aiEnabled && (
            <button
              className="button secondary"
              disabled={!answer.trim() || busy}
              onClick={() => check(true)}
            >
              Get AI feedback
            </button>
          )}
        </div>
        <span className="small-text muted" role="status">
          {saved}
        </span>
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      {feedback && (
        <div className={'feedback ' + (feedback.score >= 7 ? 'success' : '')} role="status">
          <div className="feedback-heading">
            <strong>
              {feedback.score >= 7 ? 'A useful step forward.' : 'You’re learning. Keep going.'}
            </strong>
            <span>{feedback.score}/10</span>
          </div>
          <p>{feedback.feedback}</p>
          {feedback.strengths.map((s) => (
            <div key={s}>✓ {s}</div>
          ))}
          {feedback.improvements.map((s) => (
            <div key={s}>· {s}</div>
          ))}
          {feedback.example && (
            <details>
              <summary>See an example answer</summary>
              <p>{feedback.example}</p>
            </details>
          )}
          <small>
            {feedback.source === 'ai'
              ? 'AI feedback can be imperfect. Use your judgment.'
              : 'Practice feedback · checked against the lesson criteria'}
          </small>
        </div>
      )}
    </section>
  );
}
function ReadingBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'HEADING':
      return (
        <h2 id={'section-' + block.id} className="subheading lesson-section-heading">
          {block.text}
        </h2>
      );
    case 'CODE':
      return (
        <div className="code-block">
          <Code size={18} />
          <pre>
            <code>{block.text}</code>
          </pre>
        </div>
      );
    case 'IMAGE':
      return (
        <figure>
          <picture>
            <img
              src={block.text}
              alt={block.explanation || 'Lesson illustration'}
              loading="lazy"
              style={{ maxWidth: '100%', borderRadius: 12 }}
              referrerPolicy="no-referrer"
            />
          </picture>
        </figure>
      );
    case 'PROMPT_EXAMPLE':
    case 'EXAMPLE':
      return (
        <div className="example-block">
          <span className="eyebrow">SEE IT IN ACTION</span>
          <p>{block.text}</p>
        </div>
      );
    case 'TIP':
    case 'CALLOUT':
    case 'WARNING':
      return (
        <div className={'callout ' + (block.type === 'WARNING' ? 'warning' : '')}>
          <Lightbulb size={20} />
          <p>{block.text}</p>
        </div>
      );
    case 'SUMMARY':
      return (
        <div className="summary-block">
          <Check size={22} />
          <div>
            <strong>Take this with you</strong>
            <p>{block.text}</p>
          </div>
        </div>
      );
    default:
      return <p className="lesson-prose">{block.text}</p>;
  }
}
export function LessonPlayer({ courseId }: { courseId: string }) {
  const [data, setData] = useState<LessonData>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [win, setWin] = useState('');
  const [menu, setMenu] = useState(false);
  const load = useCallback(
    async (lessonId?: string) => {
      try {
        const next = await api<LessonData>(
          'learn?course=' + courseId + (lessonId ? '&lesson=' + lessonId : ''),
        );
        setData(next);
        setError('');
        setWin('');
        setMenu(false);
        window.scrollTo({ top: 0 });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [courseId],
  );
  useEffect(() => {
    let live = true;
    api<LessonData>('learn?course=' + courseId)
      .then((value) => {
        if (live) setData(value);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [courseId]);
  const save = useCallback(
    async (blockId: string, answer: string) => {
      if (!data) return;
      await api('draft', { courseId, lessonId: data.lesson.id, blockId, answer });
    },
    [courseId, data],
  );
  async function check(blockId: string, answer: string, ai: boolean) {
    return api<Feedback>(ai ? 'ai' : 'answer', {
      courseId,
      lessonId: data!.lesson.id,
      blockId,
      answer,
    });
  }
  async function complete() {
    if (!data) return;
    setBusy(true);
    setError('');
    try {
      const result = await api<{ xp: number; progress: Progress; score?: number }>('complete', {
        courseId,
        lessonId: data.lesson.id,
      });
      setData({
        ...data,
        progress: result.progress,
        user: { ...data.user, xp: data.user.xp + result.xp },
      });
      setWin(
        result.xp
          ? 'Lesson complete. +' + result.xp + ' XP earned!'
          : 'You’ve already completed this lesson.',
      );
      if (result.xp > 0) celebrateCompletion();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return error ? (
      <div className="empty">
        <BookOpen size={40} />
        <h2 className="subheading">Your learning path is waiting.</h2>
        <p>{error}</p>
        <Link className="button" href="/courses">
          Explore courses
        </Link>
      </div>
    ) : (
      <div className="skeleton" />
    );
  const all = lessons(data.course);
  const index = all.findIndex((l) => l.id === data.lesson.id);
  const p = data.progress;
  const percent = Math.round(((p?.completed.length ?? 0) / all.length) * 100);
  return (
    <div className="lesson-layout">
      <aside className={'lesson-outline ' + (menu ? 'show' : '')}>
        <Link className="small-text muted" href="/dashboard">
          ← My learning
        </Link>
        <h3>{data.course.title}</h3>
        <div className="progress-label">
          <span>Your progress</span>
          <strong>{percent}%</strong>
        </div>
        <progress max={100} value={percent} />
        {data.course.modules.map((m, i) => (
          <div key={m.id}>
            <h4>
              {i + 1}. {m.title}
            </h4>
            {m.lessons.map((l) => (
              <button
                className={l.id === data.lesson.id ? 'active' : ''}
                key={l.id}
                onClick={() => load(l.id)}
              >
                <span>{p?.completed.includes(l.id) ? '✓' : '○'}</span>
                {l.title}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <div className="lesson-stage">
        <button className="button secondary mobile-outline" onClick={() => setMenu(!menu)}>
          Course contents
        </button>
        <div className="lesson-meta">
          <span className="eyebrow">
            LESSON {index + 1} OF {all.length}
          </span>
          <span>
            {data.lesson.minutes} min · {data.user.xp} XP
          </span>
        </div>
        <h1>{data.lesson.title}</h1>
        <details className="lesson-roadmap" key={'roadmap-' + data.lesson.id}>
          <summary>In this lesson · read, practice, review</summary>
          <nav aria-label="Lesson sections">
            {data.lesson.blocks
              .filter((b) => b.type === 'HEADING')
              .map((b) => (
                <a key={b.id} href={'#section-' + b.id}>
                  {b.text}
                </a>
              ))}
          </nav>
          <p className="small-text muted">
            Work at your own pace. Check each required activity before completing the lesson. Your
            answers save as you go.
          </p>
        </details>
        {data.lesson.final && (
          <div className="callout">
            Pass mark: {data.course.passingPercent}%. Review and retry as needed. XP is awarded
            once.
          </div>
        )}
        <div key={data.lesson.id}>
          {data.lesson.blocks.map((b) =>
            isExercise(b) ? (
              <Exercise
                key={b.id}
                aiEnabled={data.aiEnabled}
                draftKey={
                  'libtech-draft:' +
                  data.user.id +
                  ':' +
                  courseId +
                  ':' +
                  data.lesson.id +
                  ':' +
                  b.id
                }
                block={b}
                initial={p?.drafts[data.lesson.id + '__' + b.id] ?? ''}
                onSave={save}
                onCheck={check}
              />
            ) : (
              <ReadingBlock key={b.id} block={b} />
            ),
          )}
        </div>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {win && (
          <div className="alert success" role="status">
            {win}
            {p?.certificateId && (
              <p>
                <Link className="text-link" href={'/certificate/' + p.certificateId}>
                  View your certificate
                </Link>
              </p>
            )}
          </div>
        )}
        <div className="lesson-navigation">
          <button
            disabled={index === 0 || busy}
            className="button secondary"
            onClick={() => load(all[index - 1].id)}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          {win && index < all.length - 1 ? (
            <button className="button" onClick={() => load(all[index + 1].id)}>
              Next lesson
              <ChevronRight size={16} />
            </button>
          ) : (
            <button disabled={busy} className="button" onClick={complete}>
              {busy
                ? 'Saving…'
                : p?.completed.includes(data.lesson.id)
                  ? 'Review complete'
                  : 'Complete lesson'}
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
