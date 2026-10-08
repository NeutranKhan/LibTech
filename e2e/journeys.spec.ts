import { test, expect } from '@playwright/test';

test('production pages show live courses and no demo access', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn AI');
  await page.getByRole('button', { name: /Write a friendly/ }).click();
  await page.getByRole('button', { name: 'Check my answer' }).click();
  await expect(page.getByRole('status')).toContainText('Exactly');
  await page.goto('/courses');
  await expect(page.getByRole('link', { name: 'View course' }).first()).toBeVisible();
  await page.goto('/courses/ai-essentials');
  await expect(page.getByText(/66 interactive activities/).first()).toBeVisible();
  await page.screenshot({ path: 'work/ai-guide-course.png', fullPage: true });
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
  await expect(page.getByText('LOCAL PREVIEW', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Try as/ })).toHaveCount(0);
  await page.goto('/terms');
  await expect(page.getByText(/LibTech is operated by Michael Khan/)).toBeVisible();
  await expect(
    page.getByText(/Donations support LibTech and are not course purchases/),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'libtech1393@gmail.com', exact: true }),
  ).toBeVisible();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
  expect(errors).toEqual([]);
});

test('removed demo and private APIs cannot be accessed anonymously', async ({ request }) => {
  const demo = await request.post('/api/demo', { data: { role: 'ADMIN' } });
  expect(demo.status()).toBe(404);
  for (const path of ['/api/dashboard', '/api/admin/analytics', '/api/profile/photo']) {
    expect((await request.get(path)).status(), path).toBe(401);
  }
  const config = await (await request.get('/api/config')).json();
  expect(config).toEqual({ configured: true });
});

test('production public pages fit mobile and desktop screens', async ({ page }) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/login', '/courses']) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        route + ' at ' + width,
      ).toBe(false);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await page.screenshot({ path: 'work/production-home.png', fullPage: true });
});
