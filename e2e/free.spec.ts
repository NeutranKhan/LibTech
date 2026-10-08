import { test, expect } from '@playwright/test';
test('free enrollment keeps course intent and support never requires a donation', async ({
  page,
}) => {
  await page.goto('/courses/ai-essentials');
  await expect(page.getByText('Free', { exact: true })).toBeVisible();
  await expect(page.getByText(/One-time payment/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Start learning for free' }).click();
  await expect(page).toHaveURL(/login\?next=%2Fcourses%2Fai-essentials/);
  await page.goto('/support');
  await expect(page.getByRole('heading', { name: 'Help keep learning free.' })).toBeVisible();
  await expect(page.getByText(/You never need to donate/)).toBeVisible();
});
