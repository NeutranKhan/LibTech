import type { User } from '../../src/lib/domain';
export const testUser = (role: 'STUDENT' | 'ADMIN'): User => ({
  id: role === 'ADMIN' ? 'test-admin' : 'test-student',
  email: role === 'ADMIN' ? 'admin@example.test' : 'learner@example.test',
  name: role === 'ADMIN' ? 'LibTech Admin' : 'Alex Learner',
  role,
  suspended: false,
  createdAt: new Date().toISOString(),
  xp: 0,
  streak: 0,
  lastLearned: '',
  country: '',
  bio: '',
  photoURL: '',
  achievements: [],
});
