const { expect, test } = require('@playwright/test');
const { apiBase, useLoggedInSession } = require('./e2e-auth-utils');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const today = new Date().toISOString().slice(0, 10);
const weekId = '2026-W18';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('todo page reads today todos from API and posts new tasks', async ({ page }) => {
  const listRequests = [];
  const createRequests = [];

  await useLoggedInSession(page);

  await page.route(`${apiBase}/todos/today**`, async (route) => {
    const requestUrl = new URL(route.request().url());
    listRequests.push(requestUrl.searchParams.get('date'));
    await route.fulfill({
      contentType: 'application/json',
      json: [
        {
          completed: true,
          date: today,
          estimatedMinutes: 25,
          id: 'remote-todo-1',
          source: 'manual',
          sourceFocusId: null,
          title: 'API 返回的晨间复盘',
          userEdited: false,
        },
        {
          completed: false,
          date: today,
          estimatedMinutes: 30,
          id: 'remote-todo-2',
          source: 'manual',
          sourceFocusId: null,
          title: 'API 返回的晚间阅读',
          userEdited: false,
        },
      ],
    });
  });

  await page.route(`${apiBase}/todos`, async (route) => {
    const request = route.request();
    createRequests.push(JSON.parse(request.postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        completed: false,
        date: today,
        estimatedMinutes: null,
        id: 'remote-todo-created',
        source: 'manual',
        sourceFocusId: null,
        title: '补一条 API 新任务',
        userEdited: true,
      },
    });
  });

  await page.goto(`${baseUrl}/todo`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('API 返回的晨间复盘')).toBeVisible();
  await expect(page.getByText('API 返回的晚间阅读')).toBeVisible();
  expect(listRequests).toEqual([today]);

  await page.getByText('＋ 添加一件小事').click();
  await page.getByPlaceholder('写下一件今天要做的小事').fill('补一条 API 新任务');
  await page.getByText('添加', { exact: true }).click();

  await expect(page.getByText('补一条 API 新任务')).toBeVisible();
  await expect(createRequests).toHaveLength(1);
  expect(createRequests[0]).toMatchObject({
    date: today,
    title: '补一条 API 新任务',
  });
});

test('energy page loads weekly energy and confirms today score through API', async ({ page }) => {
  const weeklyRequests = [];
  const recordRequests = [];

  await useLoggedInSession(page);

  await page.route(`${apiBase}/energy/weeks/${weekId}`, async (route) => {
    weeklyRequests.push(route.request().url());
    await route.fulfill({
      contentType: 'application/json',
      json: {
        average: 90,
        entries: [
          { date: '2026-04-27', hasViewedTodos: true, id: 'energy-1', score: 88, weekId },
          { date: today, hasViewedTodos: true, id: 'energy-7', score: 92, weekId },
        ],
        recordedDays: 2,
        weekId,
      },
    });
  });

  await page.route(`${apiBase}/energy/days/${today}`, async (route) => {
    const request = route.request();
    recordRequests.push(JSON.parse(request.postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        date: today,
        hasViewedTodos: true,
        id: 'energy-today',
        score: 82,
        weekId,
      },
    });
  });

  await page.goto(`${baseUrl}/energy`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('90')).toBeVisible();
  expect(weeklyRequests).toHaveLength(1);

  await page.getByText('确认今日能量').click();
  await page.getByText('继续注入').click();
  await expect(page.getByText('今日能量已注入')).toBeVisible();

  await expect(recordRequests).toHaveLength(1);
  expect(recordRequests[0]).toMatchObject({
    hasViewedTodos: true,
    score: 62,
  });
});
