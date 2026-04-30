const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:19012';
const apiBase = 'http://127.0.0.1:3300/api/v1';
const weekId = '2026-W18';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('weekly settlement posts to API then tree loads real fruit capsule and honors', async ({ page }) => {
  const settlementRequests = [];
  const treeRequests = [];

  await page.route(`${apiBase}/energy/weeks/${weekId}`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        average: 83,
        entries: [
          { date: '2026-04-27', hasViewedTodos: true, id: 'energy-1', score: 80, weekId },
          { date: '2026-04-28', hasViewedTodos: true, id: 'energy-2', score: 86, weekId },
        ],
        recordedDays: 2,
        weekId,
      },
    });
  });

  await page.route(`${apiBase}/settlements/weeks/${weekId}`, async (route) => {
    const request = route.request();
    settlementRequests.push(JSON.parse(request.postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        confirmedAt: '2026-04-26T12:00:00.000Z',
        finalScore: 83,
        id: 'settlement-api-17',
        reflection: '后端确认后的本周感悟',
        snapshotJson: {
          energyEntries: [
            { date: '2026-04-27', hasViewedTodos: true, score: 80 },
            { date: '2026-04-28', hasViewedTodos: true, score: 86 },
          ],
          todoSummary: { completed: 2, total: 3 },
        },
        suggestedScore: 83,
        weekId,
      },
    });
  });

  await page.route(`${apiBase}/tree/years/2026`, async (route) => {
    treeRequests.push(route.request().url());
    await route.fulfill({
      contentType: 'application/json',
      json: {
        fruits: [
          {
            capsuleSummary: '后端时间胶囊：完成真实 API 联调',
            createdAt: '2026-04-26T12:01:00.000Z',
            id: 'fruit-api-17',
            label: 'API 第17周果实',
            score: 83,
            weekId,
          },
        ],
        honors: [
          {
            averageScore: 84,
            earnedAt: '2026-03-31T12:00:00.000Z',
            id: 'honor-api-q1',
            quarterId: '2026-Q1',
          },
        ],
        stage: 'q2_growth',
        year: 2026,
      },
    });
  });

  await page.goto(`${baseUrl}/settlement`, { waitUntil: 'networkidle' });
  await expect(page.getByText('83%').first()).toBeVisible();

  await page.getByText(/确认.*果实|纭.*鏋滃疄/).click();

  await expect(page).toHaveURL(/\/tree$/);
  await expect(page.getByRole('button', { name: '1 果实' })).toBeVisible();
  await expect(page.getByRole('button', { name: '荣誉' })).toBeVisible();
  expect(settlementRequests).toHaveLength(1);
  expect(settlementRequests[0]).toMatchObject({ finalScore: 83 });
  expect(treeRequests.length).toBeGreaterThanOrEqual(1);

  await page.getByLabel('打开API 第17周果实').click();
  await expect(page.getByText('API 第17周果实').first()).toBeVisible();
  await expect(page.getByText('后端时间胶囊：完成真实 API 联调')).toBeVisible();
});
