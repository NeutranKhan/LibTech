import { store } from '@/server/store';
import type { Course } from '@/lib/domain';
import { notFound, redirect } from 'next/navigation';
export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const course = await store().get<Course>('courses', (await params).courseId);
  if (!course || course.status !== 'PUBLISHED') notFound();
  redirect('/courses/' + course.slug);
}
