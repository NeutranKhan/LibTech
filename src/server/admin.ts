import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import {
  ensure,
  canManage,
  courseSchema,
  defaultSettings,
  type User,
  type Course,
  type Settings,
  type Enrollment,
  type Progress,
  type Certificate,
} from '@/lib/domain';
import type { Store } from './store';
import { audit, key, notify } from './learning';
export async function saveCourse(db: Store, actor: User, input: unknown) {
  const course = courseSchema.parse(input);
  ensure(
    Buffer.byteLength(JSON.stringify(course)) < 300000,
    400,
    'Course content exceeds the 300 KB limit. Split it into smaller courses.',
  );
  const ids = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  ensure(new Set(ids).size === ids.length, 400, 'Lesson IDs must be unique.');
  ensure(
    new Set(course.modules.map((m) => m.id)).size === course.modules.length,
    400,
    'Module IDs must be unique.',
  );
  for (const m of course.modules)
    for (const l of m.lessons) {
      ensure(
        new Set(l.blocks.map((b) => b.id)).size === l.blocks.length,
        400,
        'Block IDs must be unique within a lesson.',
      );
      for (const b of l.blocks) {
        if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKPOINT'].includes(b.type))
          ensure(
            b.options.includes(b.answer),
            400,
            'A choice exercise must have a correct option.',
          );
        if (['FILL_BLANK', 'MATCHING', 'ORDERING'].includes(b.type))
          ensure(b.answer.trim(), 400, 'Add an accepted answer.');
        if (['SHORT_ANSWER', 'SCENARIO', 'PRACTICE_EXERCISE', 'AI_EXERCISE'].includes(b.type))
          ensure(b.rubric.length > 0, 400, 'Add a practice rubric.');
        if (b.type === 'IMAGE')
          ensure(/^https:\/\//.test(b.text), 400, 'Images require an HTTPS URL.');
      }
    }
  if (course.status === 'PUBLISHED') {
    ensure(
      course.modules.length && ids.length,
      400,
      'Add a module and a lesson before publishing.',
    );
    ensure(
      course.modules.some((m) => m.lessons.some((l) => l.final && l.published)),
      400,
      'A published course needs a final assessment.',
    );
    ensure(
      course.modules.every((m) => m.lessons.some((l) => l.published)),
      400,
      'Each module needs a published lesson.',
    );
    ensure(
      course.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.published)
        .every((l) =>
          l.blocks.some(
            (b) =>
              b.required &&
              [
                'MULTIPLE_CHOICE',
                'TRUE_FALSE',
                'FILL_BLANK',
                'SHORT_ANSWER',
                'MATCHING',
                'ORDERING',
                'SCENARIO',
                'PRACTICE_EXERCISE',
                'AI_EXERCISE',
                'CHECKPOINT',
              ].includes(b.type),
          ),
        ),
      400,
      'Every published lesson needs a required exercise.',
    );
  }
  return db.transaction(async (tx) => {
    const user = await tx.get<User>('users', actor.id);
    ensure(
      user && !user.suspended && user.role !== 'STUDENT',
      403,
      'Course author access required.',
    );
    const old = await tx.get<Course>('courses', course.id);
    ensure(!old || canManage(user, old), 403, 'You can only edit your own courses.');
    ensure(
      !old || old.revision === course.revision,
      409,
      'This course changed elsewhere. Reload before saving.',
    );
    const slug = await tx.get<{ courseId: string }>('courseSlugs', course.slug);
    const sameSlug = await tx.list<Course>('courses', { field: 'slug', value: course.slug }, 2);
    ensure(
      (!slug || slug.courseId === course.id) && !sameSlug.some((c) => c.id !== course.id),
      409,
      'This course address is already in use.',
    );
    const enrollments = await tx.list<Enrollment>(
      'enrollments',
      { field: 'courseId', value: course.id },
      1,
    );
    if (old && enrollments.length)
      ensure(
        JSON.stringify(old.modules) === JSON.stringify(course.modules),
        409,
        'This course has enrollments. Create a new course edition to change its curriculum.',
      );
    const saved = {
      ...course,
      ownerId: old?.ownerId ?? user.id,
      revision: (old?.revision ?? 0) + 1,
    };
    tx.set('courses', saved.id, saved);
    tx.set('courseSlugs', course.slug, { courseId: course.id });
    if (old && old.slug !== course.slug) tx.delete('courseSlugs', old.slug);
    audit(tx, user.id, 'COURSE_SAVED', course.id);
    return saved;
  });
}
export const settingsSchema = z.object({
  paymentInstructions: z.string().max(3000),
  paymentsEnabled: z.boolean(),
  aiDailyLimit: z.number().int().min(0).max(100),
  aiLessonLimit: z.number().int().min(0).max(20),
  lessonXP: z.number().int().min(0).max(100),
  exerciseXP: z.number().int().min(0).max(100),
  moduleXP: z.number().int().min(0).max(200),
  courseXP: z.number().int().min(0).max(500),
});
export async function saveSettings(db: Store, actor: User, input: unknown) {
  const data = settingsSchema.parse(input);
  ensure(
    !data.paymentsEnabled || data.paymentInstructions.trim().length >= 20,
    400,
    'Add clear payment instructions before enabling payments.',
  );
  return db.transaction(async (tx) => {
    const u = await tx.get<User>('users', actor.id);
    ensure(u?.role === 'ADMIN' && !u.suspended, 403, 'Administrator access required.');
    const value: Settings = { ...defaultSettings, ...data, id: 'platform' };
    tx.set('settings', 'platform', value);
    audit(tx, u.id, 'SETTINGS_UPDATED', 'platform');
    return value;
  });
}
export async function manageUser(
  db: Store,
  actor: User,
  targetId: string,
  action: 'suspend' | 'restore' | 'role' | 'enroll' | 'remove',
  value: string,
) {
  return db.transaction(async (tx) => {
    const user = await tx.get<User>('users', actor.id);
    const target = await tx.get<User>('users', targetId);
    ensure(user?.role === 'ADMIN' && !user.suspended, 403, 'Administrator access required.');
    ensure(target, 404, 'Student not found.');
    ensure(target.id !== user.id, 400, 'You cannot change your own account here.');
    if (action === 'enroll' || action === 'remove') {
      const course = await tx.get<Course>('courses', value);
      ensure(course, 404, 'Course not found.');
      const id = key(target.id, value);
      const old = await tx.get<Enrollment>('enrollments', id);
      tx.set<Enrollment>('enrollments', id, {
        id,
        userId: target.id,
        courseId: value,
        active: action === 'enroll',
        createdAt: old?.createdAt ?? new Date().toISOString(),
        source: old?.source ?? 'ADMIN',
      });
      notify(
        tx,
        target.id,
        action === 'enroll' ? 'Course access granted' : 'Course access removed',
        course.title,
        '/dashboard',
      );
    } else {
      if (action === 'role') {
        ensure(['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(value), 400, 'Invalid role.');
        target.role = value as User['role'];
      } else target.suspended = action === 'suspend';
      tx.set('users', target.id, target);
    }
    audit(tx, user.id, 'USER_' + action.toUpperCase(), target.id);
    return { ok: true };
  });
}
export async function revokeCertificate(db: Store, actor: User, id: string) {
  return db.transaction(async (tx) => {
    const u = await tx.get<User>('users', actor.id);
    const c = await tx.get<Certificate>('certificates', id);
    ensure(u?.role === 'ADMIN' && !u.suspended, 403, 'Administrator access required.');
    ensure(c, 404, 'Certificate not found.');
    tx.set('certificates', id, { ...c, revoked: true });
    audit(tx, u.id, 'CERTIFICATE_REVOKED', id);
    return { ok: true };
  });
}
export async function studentDetail(db: Store, id: string) {
  const [user, enrollments, progress, certificates] = await Promise.all([
    db.get<User>('users', id),
    db.list<Enrollment>('enrollments', { field: 'userId', value: id }),
    db.list<Progress>('progress', { field: 'userId', value: id }),
    db.list<Certificate>('certificates', { field: 'userId', value: id }),
  ]);
  return { user, enrollments, progress, certificates };
}
export function newCourse(ownerId: string): Course {
  return {
    id: randomUUID(),
    slug: 'new-course-' + Date.now(),
    title: 'New course',
    description: 'Describe the practical skills learners will develop in this course.',
    category: 'AI foundations',
    difficulty: 'Beginner',
    priceCents: 0,
    duration: '2 hours',
    instructor: 'LibTech Learning Team',
    ownerId,
    status: 'DRAFT',
    order: 0,
    revision: 0,
    thumbnail: '',
    outcomes: [],
    requirements: 'A browser and internet connection.',
    passingPercent: 80,
    modules: [],
  };
}
