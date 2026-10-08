import { ensure, type Course, type User, type Enrollment } from '@/lib/domain';
import type { Store } from './store';
import { key } from './learning';
export async function enrollFree(db: Store, actor: User, courseId: string) {
  return db.transaction(async (tx) => {
    const user = await tx.get<User>('users', actor.id);
    ensure(user && !user.suspended, 403, 'Account unavailable.');
    const course = await tx.get<Course>('courses', courseId);
    ensure(course?.status === 'PUBLISHED', 404, 'Course unavailable.');
    const id = key(user.id, courseId);
    const existing = await tx.get<Enrollment>('enrollments', id);
    if (existing?.active) return existing;
    const enrollment: Enrollment = {
      id,
      userId: user.id,
      courseId,
      active: true,
      source: 'FREE',
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    tx.set('enrollments', id, enrollment);
    return enrollment;
  });
}
