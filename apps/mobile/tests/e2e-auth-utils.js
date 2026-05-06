const apiBase = 'http://127.0.0.1:37200/api/v1';

async function useLoggedInSession(page, overrides = {}) {
  const user = {
    currentQuarterId: '2026-Q2',
    currentWeekId: '2026-W18',
    displayName: '林间行者',
    email: 'wzz@example.com',
    hasCompletedOnboarding: true,
    id: 'e2e-user',
    phone: '+8613800138000',
    timezone: 'Asia/Shanghai',
    ...overrides,
  };

  await page.addInitScript(() => {
    window.localStorage.setItem('newme.accessToken', 'e2e-access-token');
    window.localStorage.setItem('newme.refreshToken', 'e2e-refresh-token');
  });

  await page.route(`${apiBase}/me`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: user,
    });
  });

  await page.route(`${apiBase}/notifications/tokens`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: { enabled: true, platform: 'web', token: 'ExponentPushToken[e2e]' },
    });
  });

  await page.route(`${apiBase}/notifications/preferences`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        notifications: {
          dailyEnergy: true,
          reengagement: true,
          weeklySettlement: true,
        },
      },
    });
  });
}

module.exports = { apiBase, useLoggedInSession };
