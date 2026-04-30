const { test, expect } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:19008';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('mobile screens expose prototype-level chrome and copy', async ({ page }) => {
  await page.goto(`${baseUrl}/onboarding/choose`, { waitUntil: 'networkidle' });
  await expect(page.getByText('09:07')).toBeVisible();
  await expect(page.getByText('87%')).toBeVisible();
  await expect(page.getByText('先快速规划这个季度')).toBeVisible();

  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await expect(page.getByText('本周能量')).toBeVisible();
  await expect(page.getByText('本周进度概览')).toBeVisible();
  await expect(page.getByText('今日能量条')).toBeVisible();
  await expect(page.getByRole('tab', { name: /能量/ })).toBeVisible();
});

test('growth tree is no longer a placeholder', async ({ page }) => {
  await page.goto(`${baseUrl}/tree`, { waitUntil: 'networkidle' });
  await expect(page.getByText('6')).toBeVisible();
  await expect(page.getByText('果实', { exact: true })).toBeVisible();
  await expect(page.getByText('Q2')).toBeVisible();
  await expect(page.getByText('阶段')).toBeVisible();
  await expect(page.getByText('1')).toBeVisible();
  await expect(page.getByText('荣誉')).toBeVisible();
  await expect(page.getByText('点击果实查看时间胶囊')).toBeVisible();
  await expect(page.getByText('年度成长树、果实和荣誉层会在 C9 接入。')).toHaveCount(0);
});
