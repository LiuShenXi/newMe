const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const apiBase = 'http://127.0.0.1:37200/api/v1';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('auth login requests a code, stores the JWT session, and loads /me before onboarding', async ({ page }) => {
  const codeRequests = [];
  const loginRequests = [];
  const meRequests = [];

  await page.route(`${apiBase}/auth/code`, async (route) => {
    codeRequests.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: { ok: true },
    });
  });

  await page.route(`${apiBase}/auth/login`, async (route) => {
    loginRequests.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        accessToken: 'access-token-f1',
        refreshToken: 'refresh-token-f1',
      },
    });
  });

  await page.route(`${apiBase}/me`, async (route) => {
    meRequests.push({
      authorization: route.request().headers().authorization,
    });
    await route.fulfill({
      contentType: 'application/json',
      json: {
        currentQuarterId: '2026-Q2',
        currentWeekId: '2026-W18',
        hasCompletedOnboarding: false,
        id: 'user-f1',
        phone: '+8613800138000',
        timezone: 'Asia/Shanghai',
      },
    });
  });

  await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'networkidle' });

  await expect(page.getByText('验证码登录', { exact: true })).toBeVisible();
  await page.getByPlaceholder('请输入手机号').fill('13800138000');
  await page.getByRole('button', { name: '获取验证码' }).click();

  await expect(page.getByText('验证码已发送')).toBeVisible();
  await page.getByPlaceholder('请输入 6 位验证码').fill('123456');
  await page.getByRole('button', { name: '登录' }).click();

  await expect(page).toHaveURL(/\/onboarding\/choose$/);
  await expect(page.getByText('你想怎样开始今年？')).toBeVisible();

  expect(codeRequests).toEqual([{ phone: '13800138000' }]);
  expect(loginRequests).toEqual([{ code: '123456', phone: '13800138000' }]);
  expect(meRequests.length).toBeGreaterThanOrEqual(1);
  expect(meRequests.every((request) => request.authorization === 'Bearer access-token-f1')).toBe(true);
});
