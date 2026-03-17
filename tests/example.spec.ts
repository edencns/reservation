import { test, expect } from '@playwright/test';

test('홈 페이지 로드', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/아파트 입주박람회/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('아파트 입주박람회');
});

test('예약하기 버튼 → 행사 목록 이동', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '예약하기' }).first().click();
  await page.waitForURL('**/events');
  await expect(page).toHaveURL(/\/events$/);
});

test('내 예약 확인 버튼 → 내 예약 페이지 이동', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '내 예약 확인' }).click();
  await page.waitForURL('**/my-tickets');
  await expect(page).toHaveURL(/\/my-tickets$/);
});
