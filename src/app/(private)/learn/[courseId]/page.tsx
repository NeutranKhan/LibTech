import { LessonPlayer } from '@/components/lesson-player';
export const metadata = { title: 'Learning in progress' };
export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  return <LessonPlayer courseId={(await params).courseId} />;
}
