import { LessonPlayer } from '@/components/lesson-player';
import { currentUser } from '@/server/auth';
import { store } from '@/server/store';
import { canAccess, type Course, type Enrollment } from '@/lib/domain';
import { key } from '@/server/learning';
import { redirect, notFound } from 'next/navigation';
export const metadata = { title: 'Learning in progress' };
export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await currentUser();
  if (!user) redirect('/login?next=' + encodeURIComponent('/learn/' + courseId));
  const db = store();
  const course = await db.get<Course>('courses', courseId);
  if (!course) notFound();
  const enrollment = await db.get<Enrollment>('enrollments', key(user.id, courseId));
  if (!canAccess(user, course, enrollment)) redirect('/courses/' + course.slug);
  return <LessonPlayer courseId={courseId} />;
}
