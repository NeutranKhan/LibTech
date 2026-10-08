import nextEnv from '@next/env';
import { courseSchema, ensure } from '../src/lib/domain';
nextEnv.loadEnvConfig(process.cwd());
const { store } = await import('../src/server/store');
const { seedCourse } = await import('../src/lib/seed');
const expected = Number(process.argv[2]);
ensure(
  Number.isInteger(expected) && expected > 0,
  400,
  'Usage: npx tsx scripts/update-ai-course.ts EXPECTED_CURRENT_REVISION',
);
const content = courseSchema.parse(seedCourse);
ensure(
  Buffer.byteLength(JSON.stringify(content)) < 300000,
  400,
  'Course exceeds the content limit.',
);
await store().transaction(async (tx) => {
  const old = await tx.get<typeof content>('courses', content.id);
  ensure(
    old && old.revision === expected,
    409,
    'Course changed. Review its current revision before updating.',
  );
  for (const collection of ['enrollments', 'progress', 'certificates']) {
    const records = await tx.list(collection, { field: 'courseId', value: content.id }, 1);
    ensure(
      records.length === 0,
      409,
      'This course has learner records. Create a separate edition instead.',
    );
  }
  tx.set('courseRevisions', content.id + '__' + old.revision, old);
  tx.set('courses', content.id, {
    ...content,
    priceCents: old.priceCents,
    ownerId: old.ownerId,
    order: old.order,
    revision: old.revision + 1,
  });
  const id = 'ai-guide-update-' + (old.revision + 1);
  tx.set('auditLogs', id, {
    id,
    actorId: 'content-cli',
    action: 'BEGINNER_GUIDE_PUBLISHED',
    targetId: content.id,
    createdAt: new Date().toISOString(),
  });
});
console.log('Beginner guide published. Previous content retained in courseRevisions.');
