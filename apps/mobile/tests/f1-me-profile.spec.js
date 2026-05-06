const { expect, test } = require('@playwright/test');
const { apiBase, useLoggedInSession } = require('./e2e-auth-utils');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('me tab edits profile, opens avatar actions, and logs out', async ({ page }) => {
  const profileUpdates = [];
  let logoutCalled = false;

  await useLoggedInSession(page, {
    displayName: '林间行者',
    email: 'wzz@example.com',
  });

  await page.route(`${apiBase}/me/profile`, async (route) => {
    profileUpdates.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        currentQuarterId: '2026-Q2',
        currentWeekId: '2026-W18',
        displayName: '改名后的我',
        email: 'wzz@example.com',
        hasCompletedOnboarding: true,
        id: 'e2e-user',
        phone: '+8613800138000',
        timezone: 'Asia/Shanghai',
      },
    });
  });

  await page.route(`${apiBase}/auth/logout`, async (route) => {
    logoutCalled = true;
    await route.fulfill({
      contentType: 'application/json',
      json: { success: true },
    });
  });

  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('prototype-nav-button')).toHaveCount(5);
  await page.getByRole('tab', { name: '我的' }).click();

  await expect(page).toHaveURL(/\/me$/);
  await expect(page.getByText('林间行者')).toBeVisible();
  await expect(page.getByText('+8613800138000')).toBeVisible();
  await expect(page.getByText('wzz@example.com')).toBeVisible();

  await page.getByLabel('编辑昵称').click();
  await page.getByRole('textbox', { name: '昵称' }).fill('改名后的我');
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page.getByText('改名后的我')).toBeVisible();
  await expect(page.getByText('昵称已更新')).toBeVisible();
  expect(profileUpdates).toEqual([{ displayName: '改名后的我', email: 'wzz@example.com' }]);

  await page.getByLabel('点击更换头像').click();
  await expect(page.getByText('更换头像')).toBeVisible();
  await page.getByRole('button', { name: '从相册选择 ›' }).click();
  await expect(page.getByText('头像上传后端后续接入')).toBeVisible();
  await page.getByLabel('点击更换头像').click();
  await page.getByRole('button', { name: '恢复默认头像 ›' }).click();
  await expect(page.getByText('已恢复默认头像')).toBeVisible();

  await page.getByRole('button', { name: '退出登录' }).click();
  await expect(page.getByText('要退出当前账号吗？')).toBeVisible();
  await page.getByRole('button', { name: '取消' }).click();
  await expect(page.getByText('要退出当前账号吗？')).toHaveCount(0);

  await page.getByRole('button', { name: '退出登录' }).click();
  await page.getByRole('button', { name: '确认退出登录' }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  expect(logoutCalled).toBe(true);
});
