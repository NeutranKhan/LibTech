import test from 'node:test';
import assert from 'node:assert/strict';
import { safeDestination, authHref, destinationFromContinueUrl } from '../src/lib/navigation';
import { withIndexFallback } from '../src/server/aggregate';
test('return destinations preserve known local courses and reject open redirects', () => {
  for (const destination of [
    '/checkout/ai-essentials',
    '/learn/ai-essentials',
    '/courses/ai-essentials',
    '/dashboard',
    '/profile',
    '/admin',
  ])
    assert.equal(safeDestination(destination), destination);
  for (const destination of [
    'https://attacker.test',
    '//attacker.test',
    '/\\attacker.test',
    '/courses/../login',
    '/api/logout',
    '/login?next=//attacker.test',
    '/courses/%2e%2e',
    'javascript:alert(1)',
  ])
    assert.equal(safeDestination(destination), '/dashboard');
  assert.equal(authHref('signup', '/learn/ai-essentials'), '/signup?next=%2Flearn%2Fai-essentials');
});
test('email continuation only accepts the current site and validates the nested destination', () => {
  assert.equal(
    destinationFromContinueUrl(
      'https://libtech.test/login?next=%2Flearn%2Fai-essentials',
      'https://libtech.test',
    ),
    '/learn/ai-essentials',
  );
  assert.equal(
    destinationFromContinueUrl('https://attacker.test/login?next=/admin', 'https://libtech.test'),
    '/dashboard',
  );
  assert.equal(
    destinationFromContinueUrl(
      'https://libtech.test/login?next=//attacker.test',
      'https://libtech.test',
    ),
    '/dashboard',
  );
});
test('overview fallback handles missing indexes but does not conceal other database failures', async () => {
  assert.equal(
    await withIndexFallback(
      async () => 42,
      async () => 0,
    ),
    42,
  );
  assert.equal(
    await withIndexFallback(
      async () => {
        throw { code: 9, message: 'The query requires an index.' };
      },
      async () => 24,
    ),
    24,
  );
  await assert.rejects(
    () =>
      withIndexFallback(
        async () => {
          throw new Error('unavailable');
        },
        async () => 0,
      ),
    /unavailable/,
  );
});
