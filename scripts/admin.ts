import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { firebaseAdmin } = await import('../src/server/firebase');
const { getAuth } = await import('firebase-admin/auth');
const { getFirestore } = await import('firebase-admin/firestore');
const email = process.argv[2];
if (!email) throw new Error('Usage: npm run admin -- your-email@example.com');
const app = firebaseAdmin();
const account = await getAuth(app).getUserByEmail(email);
if (account.disabled) throw new Error('This account is disabled.');
const db = getFirestore(app);
if (process.argv.includes('--after-verification')) {
  await db.collection('adminGrants').doc(account.uid).set({
    userId: account.uid,
    email: account.email,
    createdAt: new Date().toISOString(),
  });
  console.log(
    'Administrator access will activate when this account verifies its email and signs in.',
  );
  process.exit(0);
}
if (!account.emailVerified)
  throw new Error('Verify the account email first, or use --after-verification to prepare access.');
const ref = db.collection('users').doc(account.uid);
await db.runTransaction(async (tx) => {
  const snapshot = await tx.get(ref);
  if (!snapshot.exists) throw new Error('Sign in to LibTech once before granting admin access.');
  tx.update(ref, { role: 'ADMIN', suspended: false });
  const audit = db.collection('auditLogs').doc();
  tx.set(audit, {
    id: audit.id,
    actorId: 'bootstrap-cli',
    action: 'FIRST_ADMIN_GRANTED',
    targetId: account.uid,
    createdAt: new Date().toISOString(),
  });
});
console.log('Administrator access granted. Sign in to LibTech.');
