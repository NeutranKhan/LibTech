import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdmin } from './firebase';
import { store, configured } from './store';
import { AppError, ensure, type User } from '@/lib/domain';
import { provisionAccount } from './account';
export async function currentUser(): Promise<User | null> {
  if (!configured()) return null;
  const token = (await cookies()).get('libtech-session')?.value;
  if (!token) return null;
  let uid: string;
  try {
    uid = (await getAuth(firebaseAdmin()).verifySessionCookie(token, true)).uid;
  } catch {
    return null;
  }
  const user = await store().get<User>('users', uid);
  return user && !user.suspended ? user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AppError(401, 'Please sign in to continue.');
  return user;
}
export async function establishSession(idToken: string, name?: string) {
  const auth = getAuth(firebaseAdmin());
  const claims = await auth.verifyIdToken(idToken, true);
  ensure(Date.now() / 1000 - claims.auth_time < 300, 401, 'Please sign in again.');
  ensure(claims.email_verified, 403, 'Verify your email, then sign in again.');
  const userRecord = await auth.getUser(claims.uid);
  await provisionAccount(store(), {
    uid: claims.uid,
    email: claims.email ?? '',
    verified: claims.email_verified === true && userRecord.emailVerified,
    name: name || userRecord.displayName || 'Learner',
  });
  return auth.createSessionCookie(idToken, { expiresIn: 5 * 24 * 60 * 60 * 1000 });
}
