import { store, configured } from './store';
import { publicCourse, type Course } from '@/lib/domain';
export async function catalog() {
  const list = configured()
    ? await store().list<Course>('courses', { field: 'status', value: 'PUBLISHED' }, 100)
    : [];
  return list.sort((a, b) => a.order - b.order).map(publicCourse);
}
export async function bySlug(slug: string) {
  if (!configured()) return null;
  const found = await store().list<Course>('courses', { field: 'slug', value: slug }, 1);
  return found[0]?.status === 'PUBLISHED' ? publicCourse(found[0]) : null;
}
