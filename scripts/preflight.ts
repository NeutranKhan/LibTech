import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { site } = await import('../src/lib/site');
const required = [
  'APP_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];
const missing = required.filter((name) => !process.env[name]?.trim());
const issues = missing.map((name) => 'Missing ' + name);
if (!site.operator || !site.supportEmail || !site.refundPolicy || !site.retentionPolicy)
  issues.push('Public business and policy details must be configured.');
try {
  const url = new URL(process.env.APP_URL || '');
  if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname))
    issues.push('APP_URL must be your public HTTPS origin.');
} catch {
  issues.push('APP_URL must be a valid public HTTPS origin.');
}
if (process.env.FIREBASE_PROJECT_ID !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  issues.push('Server and browser Firebase projects must match.');
if (process.env.SUPPORT_EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.SUPPORT_EMAIL))
  issues.push('SUPPORT_EMAIL must be a valid email address.');
if (
  process.env.AI_FEEDBACK_ENABLED === 'true' &&
  (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
)
  issues.push('AI feedback requires its API key and model.');
if (process.env.PROFILE_PHOTOS_ENABLED === 'true' && !process.env.FIREBASE_STORAGE_BUCKET)
  issues.push('Profile photos require Firebase Storage.');
if (issues.length) {
  console.error(
    'Public launch configuration is incomplete:\n' + issues.map((issue) => '- ' + issue).join('\n'),
  );
  process.exitCode = 1;
} else
  console.log(
    'Launch configuration checks passed. Complete the account, payment, rules and optional-feature acceptance checks in LAUNCH.md before opening sales.',
  );
