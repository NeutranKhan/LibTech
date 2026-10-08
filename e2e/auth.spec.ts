import { test, expect, type Page } from '@playwright/test';

test('course intent survives login, signup and password recovery links', async ({ page }) => {
  await page.goto('/learn/ai-essentials');
  await expect(page).toHaveURL(/\/login\?next=%2Flearn%2Fai-essentials/);
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await expect(page).toHaveURL(/\/signup\?next=%2Flearn%2Fai-essentials/);
  await page.getByRole('link', { name: 'Back to log in', exact: true }).click();
  await page.getByRole('link', { name: 'Forgot password?', exact: true }).click();
  await expect(page).toHaveURL(/\/forgot-password\?next=%2Flearn%2Fai-essentials/);
  await page.getByRole('link', { name: 'Back to log in', exact: true }).click();
  await page.getByRole('link', { name: 'Email link won’t open? Complete it here' }).click();
  await expect(page).toHaveURL(/\/auth\/action\?next=%2Flearn%2Fai-essentials/);
  await page.getByRole('link', { name: 'Back to sign in' }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Flearn%2Fai-essentials/);
});

test('verification links can be completed inside LibTech without loading the Firebase hosting page', async ({
  page,
}) => {
  let applications = 0;
  await page.route('https://identitytoolkit.googleapis.com/**', (route) => {
    if (new URL(route.request().url()).pathname.endsWith('accounts:update')) applications++;
    return route.fulfill({ json: { email: 'learner@example.test' } });
  });
  await page.goto('/auth/action');
  await page
    .getByLabel('Email link', { exact: true })
    .fill(
      'https://connectcash-9e68c.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=test-only',
    );
  await page.getByRole('button', { name: 'Continue with email link' }).click();
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your email is verified');
  expect(applications).toBe(1);
  await expect(page).toHaveURL(/127\.0\.0\.1:3100\/auth\/action$/);
});

test('used verification codes explain how to recover', async ({ page }) => {
  await page.route('https://identitytoolkit.googleapis.com/**', (route) =>
    route.fulfill({ status: 400, json: { error: { message: 'INVALID_OOB_CODE' } } }),
  );
  await page.goto('/auth/action?mode=verifyEmail&oobCode=test-used');
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('already been used');
});

async function mockIdentity(page: Page, options: { signup?: boolean; duplicate?: boolean } = {}) {
  let verified = false;
  const email = 'learner@example.test';
  function token() {
    const payload = {
      sub: 'test-learner',
      user_id: 'test-learner',
      email,
      email_verified: verified,
      aud: 'connectcash-9e68c',
      iss: 'https://securetoken.google.com/connectcash-9e68c',
      iat: Math.floor(Date.now() / 1000),
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    return (
      Buffer.from('{"alg":"RS256"}').toString('base64url') +
      '.' +
      Buffer.from(JSON.stringify(payload)).toString('base64url') +
      '.test'
    );
  }
  const credentials = () => ({
    localId: 'test-learner',
    email,
    displayName: 'Test Learner',
    idToken: token(),
    refreshToken: 'test-refresh',
    expiresIn: '3600',
    registered: true,
  });
  await page.route('https://identitytoolkit.googleapis.com/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('accounts:signUp') && options.duplicate)
      return route.fulfill({ status: 400, json: { error: { message: 'EMAIL_EXISTS' } } });
    if (path.endsWith('accounts:sendOobCode') && options.signup)
      return route.fulfill({
        status: 400,
        json: { error: { message: 'TOO_MANY_ATTEMPTS_TRY_LATER' } },
      });
    if (path.endsWith('accounts:lookup'))
      return route.fulfill({
        json: {
          users: [
            {
              localId: 'test-learner',
              email,
              emailVerified: verified,
              displayName: 'Test Learner',
              providerUserInfo: [{ providerId: 'password', email, federatedId: email }],
              createdAt: '1700000000000',
              lastLoginAt: String(Date.now()),
            },
          ],
        },
      });
    return route.fulfill({ json: credentials() });
  });
  await page.route('https://securetoken.googleapis.com/**', (route) =>
    route.fulfill({
      json: {
        id_token: token(),
        access_token: token(),
        refresh_token: 'test-refresh',
        expires_in: '3600',
        user_id: 'test-learner',
        project_id: 'connectcash-9e68c',
      },
    }),
  );
  return {
    verify: () => {
      verified = true;
    },
  };
}

test('successful sign-in returns to the chosen course', async ({ page }) => {
  const identity = await mockIdentity(page);
  identity.verify();
  await page.route('**/api/session', (route) => route.fulfill({ json: { ok: true } }));
  await page.goto('/login?next=%2Fcourses%2Fai-essentials');
  await page.getByLabel('Email address').fill('learner@example.test');
  await page.getByLabel(/^Password/).fill('long-password-123');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/courses\/ai-essentials$/);
});

test('ordinary sign-in requests the dashboard', async ({ page }) => {
  const identity = await mockIdentity(page);
  identity.verify();
  await page.route('**/api/session', (route) => route.fulfill({ json: { ok: true } }));
  await page.goto('/login');
  await page.getByLabel('Email address').fill('learner@example.test');
  await page.getByLabel(/^Password/).fill('long-password-123');
  const dashboard = page.waitForRequest(
    (request) => new URL(request.url()).pathname === '/dashboard',
  );
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await dashboard;
});

test('existing short passwords reach sign-in and verification can continue without recreating the account', async ({
  page,
}) => {
  const identity = await mockIdentity(page);
  let sessions = 0;
  await page.route('**/api/session', (route) => {
    sessions++;
    return route.fulfill({ status: 503, json: { error: 'Session retry test: please try again.' } });
  });
  await page.goto('/login');
  await page.getByLabel('Email address').fill('learner@example.test');
  await page.getByLabel(/^Password/).fill('short1');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your password was accepted');
  expect(sessions).toBe(0);
  await expect(page.getByLabel(/^Password/)).toHaveValue('short1');
  await page.getByRole('button', { name: 'I have verified my email' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('not verified yet');
  identity.verify();
  await page.getByRole('button', { name: 'I have verified my email' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('Session retry test');
  expect(sessions).toBe(1);
});

test('signup survives verification-email delivery failure with a clear recovery path', async ({
  page,
}) => {
  await mockIdentity(page, { signup: true });
  await page.goto('/signup');
  await page.getByLabel('Full name').fill('Test Learner');
  await page.getByLabel('Email address').fill('learner@example.test');
  await page.getByLabel(/^Password/).fill('long-password-123');
  await page.getByRole('button', { name: 'Create your account' }).click();
  await expect(page.getByRole('status')).toContainText('Your account is created, but');
  await expect(page.getByRole('button', { name: 'Resend verification email' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'I have verified my email' })).toBeVisible();
});

test('an existing signup email gets a login or password recovery explanation', async ({ page }) => {
  await mockIdentity(page, { duplicate: true });
  await page.goto('/signup');
  await page.getByLabel('Full name').fill('Test Learner');
  await page.getByLabel('Email address').fill('learner@example.test');
  await page.getByLabel(/^Password/).fill('long-password-123');
  await page.getByRole('button', { name: 'Create your account' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('already has an account');
  await expect(page.getByLabel('Email address')).toHaveValue('learner@example.test');
});
