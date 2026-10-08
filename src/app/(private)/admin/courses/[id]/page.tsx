import { CourseEditor } from '@/components/course-editor';
export const metadata = { title: 'Course studio' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CourseEditor id={(await params).id} />;
}
