import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from './fixtures/memory-store';
import { testUser } from './fixtures/users';
import { seedCourse } from '../src/lib/seed';
import { enrollFree } from '../src/server/enrollment';
import { access } from '../src/server/learning';
import { publicCourse } from '../src/lib/domain';
const user = testUser('STUDENT');
function setup(status = 'PUBLISHED', suspended = false) {
  return new MemoryStore({
    users: { [user.id]: { ...user, suspended } },
    courses: { [seedCourse.id]: { ...seedCourse, status, priceCents: 1000 } },
  });
}
test('free enrollment grants access without payment and is idempotent', async () => {
  const db = setup();
  const first = await enrollFree(db, user, seedCourse.id);
  const second = await enrollFree(db, user, seedCourse.id);
  assert.deepEqual(first, second);
  assert.equal(first.source, 'FREE');
  assert.equal((await db.list('enrollments')).length, 1);
  assert.equal((await db.list('payments')).length, 0);
  assert.equal((await access(db, user, seedCourse.id)).course.id, seedCourse.id);
  assert.equal(publicCourse(seedCourse).priceCents, 0);
});
test('free enrollment rejects drafts and suspended accounts', async () => {
  await assert.rejects(enrollFree(setup('DRAFT'), user, seedCourse.id));
  await assert.rejects(enrollFree(setup('PUBLISHED', true), user, seedCourse.id));
  await assert.rejects(enrollFree(setup(), user, 'missing-course'));
});
