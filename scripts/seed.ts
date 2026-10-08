import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { store } = await import('../src/server/store');
const { seedCourse } = await import('../src/lib/seed');
const { defaultSettings } = await import('../src/lib/domain');
if (!process.env.FIREBASE_PROJECT_ID)
  throw new Error('Set FIREBASE_PROJECT_ID and Admin credentials before seeding.');
const db = store();
await db.transaction(async (tx) => {
  const course = await tx.get('courses', seedCourse.id);
  const settings = await tx.get('settings', 'platform');
  if (!course) {
    tx.set('courses', seedCourse.id, seedCourse);
    tx.set('courseSlugs', seedCourse.slug, { courseId: seedCourse.id });
  }
  if (!settings) tx.set('settings', 'platform', defaultSettings);
});
console.log('AI Essentials and safe default settings are ready. Existing records were preserved.');
