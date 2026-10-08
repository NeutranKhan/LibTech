import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEmailActionLink } from '../src/lib/email-action';
const origin = 'http://127.0.0.1:3000';
const domain = 'project.firebaseapp.com';
test('email recovery extracts supported actions without visiting the email-link host', () => {
  for (const mode of ['verifyEmail', 'resetPassword']) {
    assert.deepEqual(
      parseEmailActionLink(
        `https://${domain}/__/auth/action?mode=${mode}&oobCode=test-code`,
        origin,
        domain,
      ),
      { mode, code: 'test-code' },
    );
    assert.deepEqual(
      parseEmailActionLink(`${origin}/auth/action?mode=${mode}&oobCode=test-code`, origin, domain),
      { mode, code: 'test-code' },
    );
  }
});
test('email recovery rejects unrelated hosts, unsupported actions and incomplete links', () => {
  for (const link of [
    'not a link',
    `https://attacker.test/__/auth/action?mode=verifyEmail&oobCode=test`,
    `https://${domain}/__/auth/action?mode=recoverEmail&oobCode=test`,
    `https://${domain}/__/auth/action?mode=verifyEmail`,
  ])
    assert.throws(() => parseEmailActionLink(link, origin, domain));
});
