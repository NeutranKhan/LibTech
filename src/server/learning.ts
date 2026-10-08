import { randomUUID, createHash } from 'node:crypto';
import {
  ensure,
  canAccess,
  canManage,
  isExercise,
  grade,
  lessons,
  nextStreak,
  defaultSettings,
  type Course,
  type User,
  type Enrollment,
  type Progress,
  type Attempt,
  type Feedback,
  type Settings,
  type Certificate,
  type Notification,
} from '@/lib/domain';
import type { Store, Transaction } from './store';
const now = () => new Date().toISOString();
export const key = (userId: string, courseId: string) => userId + '__' + courseId;
export function audit(tx: Transaction, actorId: string, action: string, targetId: string) {
  const id = randomUUID();
  tx.set('auditLogs', id, { id, actorId, action, targetId, createdAt: now() });
}
export function notify(
  tx: Transaction,
  userId: string,
  title: string,
  message: string,
  href: string,
) {
  const id = randomUUID();
  tx.set<Notification>('notifications', id, {
    id,
    userId,
    title,
    message,
    href,
    createdAt: now(),
    read: false,
  });
}
export async function access(reader: Pick<Store, 'get'>, actor: User, courseId: string) {
  const user = await reader.get<User>('users', actor.id);
  ensure(user && !user.suspended, 403, 'Account unavailable.');
  const course = await reader.get<Course>('courses', courseId);
  ensure(course, 404, 'Course unavailable.');
  const enrollment = await reader.get<Enrollment>('enrollments', key(user.id, courseId));
  ensure(canAccess(user, course, enrollment), 403, 'Enroll in this course to access the lessons.');
  ensure(
    course.status === 'PUBLISHED' || course.status === 'ARCHIVED' || canManage(user, course),
    403,
    'This course is currently unavailable.',
  );
  return { user, course };
}
export function emptyProgress(uid: string, cid: string): Progress {
  return {
    id: key(uid, cid),
    userId: uid,
    courseId: cid,
    completed: [],
    passedModules: [],
    drafts: {},
    lastLessonId: '',
    updatedAt: now(),
  };
}
export async function saveDraft(
  db: Store,
  actor: User,
  courseId: string,
  lessonId: string,
  blockId: string,
  answer: string,
) {
  return db.transaction(async (tx) => {
    const { course } = await access(tx, actor, courseId);
    const lesson = lessons(course).find((l) => l.id === lessonId);
    ensure(
      lesson?.blocks.some((b) => b.id === blockId && isExercise(b)),
      404,
      'Exercise unavailable.',
    );
    const p =
      (await tx.get<Progress>('progress', key(actor.id, courseId))) ??
      emptyProgress(actor.id, courseId);
    p.drafts[lessonId + '__' + blockId] = answer;
    p.lastLessonId = lessonId;
    p.updatedAt = now();
    tx.set('progress', p.id, p);
    return { saved: true };
  });
}
export async function submitAnswer(
  db: Store,
  actor: User,
  courseId: string,
  lessonId: string,
  blockId: string,
  answer: string,
  ai?: Feedback,
) {
  return db.transaction(async (tx) => {
    const { course } = await access(tx, actor, courseId);
    const lesson = lessons(course).find((l) => l.id === lessonId);
    ensure(lesson, 404, 'Lesson unavailable.');
    const b = lesson.blocks.find((x) => x.id === blockId);
    ensure(b && isExercise(b), 404, 'Exercise unavailable.');
    const feedback = ai ?? grade(b, answer);
    const id = key(actor.id, courseId) + '__' + lessonId + '__' + blockId;
    const prior = await tx.get<Attempt>('exerciseAttempts', id);
    const attempt: Attempt = {
      id,
      userId: actor.id,
      courseId,
      lessonId,
      blockId,
      answer,
      feedback,
      passed: feedback.score >= 7,
      createdAt: now(),
    };
    // Keep the strongest result; retries cannot erase a successful completion requirement.
    if (!prior || feedback.score >= prior.feedback.score) tx.set('exerciseAttempts', id, attempt);
    return feedback;
  });
}
export async function completeLesson(db: Store, actor: User, courseId: string, lessonId: string) {
  return db.transaction(async (tx) => {
    const { course, user } = await access(tx, actor, courseId);
    const all = lessons(course);
    const lesson = all.find((l) => l.id === lessonId);
    ensure(lesson, 404, 'Lesson unavailable.');
    const p =
      (await tx.get<Progress>('progress', key(user.id, courseId))) ??
      emptyProgress(user.id, courseId);
    if (p.completed.includes(lessonId)) return { xp: 0, progress: p, alreadyCompleted: true };
    const required = lesson.blocks.filter((b) => isExercise(b) && b.required);
    const attempts = await Promise.all(
      required.map((b) =>
        tx.get<Attempt>('exerciseAttempts', key(user.id, courseId) + '__' + lessonId + '__' + b.id),
      ),
    );
    const score = required.length
      ? Math.round((attempts.filter((a) => a?.passed).length / required.length) * 100)
      : 100;
    ensure(
      lesson.final ? score >= course.passingPercent : attempts.every((a) => a?.passed),
      409,
      lesson.final
        ? 'Your quiz needs ' + course.passingPercent + '% to pass. Review your answers and retry.'
        : 'Complete the required exercises first.',
    );
    if (lesson.final)
      ensure(
        all.filter((l) => !l.final).every((l) => p.completed.includes(l.id)),
        409,
        'Complete the preceding lessons before finishing the final assessment.',
      );
    const settings = (await tx.get<Settings>('settings', 'platform')) ?? defaultSettings;
    const instant = now();
    let xp = settings.lessonXP + attempts.filter((a) => a?.passed).length * settings.exerciseXP;
    p.completed.push(lessonId);
    p.lastLessonId = all[all.findIndex((l) => l.id === lessonId) + 1]?.id ?? lessonId;
    p.updatedAt = instant;
    for (const m of course.modules) {
      const ml = m.lessons.filter((l) => l.published);
      if (
        ml.length &&
        ml.every((l) => p.completed.includes(l.id)) &&
        !p.passedModules.includes(m.id)
      ) {
        p.passedModules.push(m.id);
        xp += settings.moduleXP;
      }
    }
    const newly: string[] = [];
    const add = (name: string) => {
      if (!user.achievements.includes(name)) {
        user.achievements.push(name);
        newly.push(name);
      }
    };
    add('First Lesson');
    if (lesson.final && score === 100) add('Perfect Quiz');
    if (lesson.blocks.some((b) => b.type === 'AI_EXERCISE')) add('Prompt Builder');
    if (all.length && all.every((l) => p.completed.includes(l.id)) && !p.certificateId) {
      xp += settings.courseXP;
      const certificateId = randomUUID();
      p.certificateId = certificateId;
      const cert: Certificate = {
        id: certificateId,
        userId: user.id,
        courseId,
        studentName: user.name,
        courseName: course.title,
        issuedAt: instant,
        organization: 'LibTech',
        revoked: false,
      };
      tx.set('certificates', certificateId, cert);
      add('First Course');
      add('AI Graduate');
      notify(
        tx,
        user.id,
        'Certificate earned',
        'You completed ' + course.title,
        '/certificate/' + certificateId,
      );
    }
    user.xp += xp;
    user.streak = nextStreak(user.lastLearned, user.streak, instant);
    user.lastLearned = instant.slice(0, 10);
    if (user.streak >= 7) add('7-Day Learner');
    for (const name of newly) notify(tx, user.id, 'Achievement unlocked', name, '/dashboard');
    tx.set('users', user.id, user);
    tx.set('progress', p.id, p);
    if (lesson.final) {
      const id = key(user.id, courseId) + '__' + lessonId;
      tx.set('quizAttempts', id, {
        id,
        userId: user.id,
        courseId,
        lessonId,
        score,
        passed: true,
        createdAt: instant,
      });
    }
    return { xp, progress: p, score, alreadyCompleted: false };
  });
}
export async function reserveAI(
  db: Store,
  actor: User,
  courseId: string,
  lessonId: string,
  blockId: string,
  answer: string,
) {
  return db.transaction(async (tx) => {
    const { course } = await access(tx, actor, courseId);
    const lesson = lessons(course).find((l) => l.id === lessonId);
    const block = lesson?.blocks.find((b) => b.id === blockId);
    ensure(
      block?.type === 'AI_EXERCISE',
      400,
      'AI feedback is only available for designated exercises.',
    );
    const hash = createHash('sha256')
      .update(JSON.stringify([actor.id, courseId, course.revision, lessonId, blockId, answer]))
      .digest('hex');
    const cached = await tx.get<{ feedback?: Feedback; status: string }>('aiUsage', hash);
    if (cached?.feedback) return { cached: cached.feedback, id: hash, block };
    ensure(
      !cached || cached.status === 'FAILED',
      429,
      'This answer is already being evaluated. Please wait.',
    );
    const day = now().slice(0, 10);
    const dailyId = actor.id + '__' + day;
    const lessonKey = key(actor.id, courseId) + '__' + lessonId;
    const daily = await tx.get<{ count: number }>('aiCounters', dailyId);
    const total = await tx.get<{ count: number }>('aiCounters', lessonKey);
    const limits = (await tx.get<Settings>('settings', 'platform')) ?? defaultSettings;
    ensure(
      (daily?.count ?? 0) < limits.aiDailyLimit && (total?.count ?? 0) < limits.aiLessonLimit,
      429,
      'Your AI feedback limit has been reached. You can still use the practice checklist.',
    );
    tx.set('aiCounters', dailyId, { count: (daily?.count ?? 0) + 1 });
    tx.set('aiCounters', lessonKey, { count: (total?.count ?? 0) + 1 });
    tx.set('aiUsage', hash, {
      id: hash,
      userId: actor.id,
      courseId,
      lessonId,
      blockId,
      status: 'PENDING',
      createdAt: now(),
      tokens: 0,
    });
    return { id: hash, block, cached: undefined };
  });
}
