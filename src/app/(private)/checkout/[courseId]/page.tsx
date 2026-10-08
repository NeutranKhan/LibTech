import { Checkout } from '@/components/checkout';
import { store } from '@/server/store';
import type { Course } from '@/lib/domain';
import { notFound } from 'next/navigation';
export const metadata = { title: 'Enroll in your course' };
export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await store().get<Course>('courses', courseId);
  if (!course || course.status !== 'PUBLISHED') notFound();
  return (
    <Checkout
      courseId={course.id}
      title={course.title}
      priceCents={course.priceCents}
      lessonCount={course.modules.reduce(
        (n, m) => n + m.lessons.filter((l) => l.published).length,
        0,
      )}
    />
  );
}
