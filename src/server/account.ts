import { ensure, type User } from '@/lib/domain';
import type { Store } from './store';

export interface AdminGrant {
  userId: string;
  email: string;
  createdAt: string;
}
// Only the trusted administrator CLI can write a pending grant. Verification is
// enforced again here before it is consumed by the server-side session flow.
export async function provisionAccount(
  db: Store,
  identity: {
    uid: string;
    email: string;
    verified: boolean;
    name: string;
  },
) {
  ensure(identity.verified, 403, 'Verify your email, then sign in again.');
  return db.transaction(async (tx) => {
    const existing = await tx.get<User>('users', identity.uid);
    const grant = await tx.get<AdminGrant>('adminGrants', identity.uid);
    ensure(!existing?.suspended, 403, 'This account is suspended.');
    const activate =
      grant?.userId === identity.uid && grant.email.toLowerCase() === identity.email.toLowerCase();
    const user: User = existing ?? {
      id: identity.uid,
      email: identity.email,
      name: identity.name.slice(0, 80),
      role: 'STUDENT',
      suspended: false,
      createdAt: new Date().toISOString(),
      xp: 0,
      streak: 0,
      lastLearned: '',
      country: '',
      bio: '',
      photoURL: '',
      achievements: [],
    };
    if (activate) {
      user.role = 'ADMIN';
      tx.delete('adminGrants', identity.uid);
      const id = 'admin-activation-' + identity.uid;
      tx.set('auditLogs', id, {
        id,
        actorId: 'bootstrap-cli',
        action: 'ADMIN_GRANT_ACTIVATED',
        targetId: identity.uid,
        createdAt: new Date().toISOString(),
      });
    }
    if (!existing || activate) tx.set('users', identity.uid, user);
    return user;
  });
}
