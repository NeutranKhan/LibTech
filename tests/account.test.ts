import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from './fixtures/memory-store';
import { provisionAccount } from '../src/server/account';
import { authError } from '../src/lib/auth-errors';
const identity = { uid: 'owner', email: 'owner@example.test', verified: true, name: 'Owner' };
const grant = { userId: identity.uid, email: identity.email, createdAt: '2026-10-06' };
test('prepared administrator role activates only after verified matching account login', async () => {
  const db = new MemoryStore({ adminGrants: { owner: grant } });
  await assert.rejects(() => provisionAccount(db, { ...identity, verified: false }), /Verify/);
  assert.equal(await db.get('users', 'owner'), null);
  assert.ok(await db.get('adminGrants', 'owner'));
  assert.equal((await provisionAccount(db, identity)).role, 'ADMIN');
  assert.equal(await db.get('adminGrants', 'owner'), null);
  assert.equal((await provisionAccount(db, identity)).role, 'ADMIN');
  assert.equal((await db.list('auditLogs')).length, 1);
});
test('email and UID mismatch cannot consume an administrator grant', async () => {
  const db = new MemoryStore({ adminGrants: { owner: grant } });
  assert.equal(
    (await provisionAccount(db, { ...identity, email: 'other@example.test' })).role,
    'STUDENT',
  );
  assert.equal((await provisionAccount(db, { ...identity, uid: 'other' })).role, 'STUDENT');
  assert.ok(await db.get('adminGrants', 'owner'));
});
test('signup without a private grant creates a student, never an administrator', async () => {
  const db = new MemoryStore({});
  assert.equal((await provisionAccount(db, identity)).role, 'STUDENT');
});
test('authentication failures have useful recovery messages without exposing raw errors', () => {
  assert.match(authError({ code: 'auth/email-already-in-use' }), /already has an account/);
  assert.match(authError({ code: 'auth/invalid-credential' }), /Forgot password/);
  assert.match(authError({ code: 'auth/network-request-failed' }), /internet connection/);
  assert.doesNotMatch(authError({ code: 'auth/unknown', message: 'secret' }), /secret/);
});
