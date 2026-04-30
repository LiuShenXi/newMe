const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:19010';
const apiBase = 'http://127.0.0.1:3300/api/v1';
const weekId = '2026-W17';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('plan page keeps prototype AI fallback when APIs fail to load', async ({ page }) => {
  await page.route(`${apiBase}/plans/weeks/${weekId}/focuses`, async (route) => {
    await route.abort();
  });

  await page.route(`${apiBase}/goals/current`, async (route) => {
    await route.abort();
  });

  await page.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });

  await expect(page.getByText('只规划最近一个月，避免计划过远失效')).toBeVisible();
  await expect(page.getByText('AI 重规划')).toBeVisible();
  await expect(page.getByText('手动 OKR', { exact: true })).toHaveCount(0);
});

test('plan page loads weekly focuses and current goals from APIs', async ({ page }) => {
  const focusRequests = [];
  const goalRequests = [];
  const updateRequests = [];

  await page.route(`${apiBase}/plans/weeks/${weekId}/focuses`, async (route) => {
    const request = route.request();

    if (request.method() === 'PUT') {
      updateRequests.push(JSON.parse(request.postData() || '{}'));
      await route.fulfill({
        contentType: 'application/json',
        json: { count: 3, weekPlanId: 'week-plan-17' },
      });
      return;
    }

    focusRequests.push(request.url());
    await route.fulfill({
      contentType: 'application/json',
      json: [
        {
          id: 'focus-api-1',
          invalidatedAt: null,
          reason: '来自后端的本周重点',
          source: 'ai',
          title: 'API 接入计划页周重点',
          weekId,
        },
        {
          id: 'focus-api-2',
          invalidatedAt: null,
          reason: '验证真实接口加载',
          source: 'ai',
          title: '保持原型计划页视觉层级',
          weekId,
        },
        {
          id: 'focus-api-3',
          invalidatedAt: null,
          reason: '确认不会回退到 demo 数据',
          source: 'ai',
          title: '补齐 Playwright 路由 mock',
          weekId,
        },
      ],
    });
  });

  await page.route(`${apiBase}/goals/current`, async (route) => {
    goalRequests.push(route.request().url());
    await route.fulfill({
      contentType: 'application/json',
      json: {
        currentMonthId: '2026-04',
        currentQuarterId: '2026-Q2',
        monthGoals: [
          {
            id: 'month-api-1',
            monthId: '2026-04',
            source: 'ai',
            title: '四月完成真实计划页联调',
          },
        ],
        quarterGoals: [
          {
            goalType: 'project',
            id: 'quarter-api-1',
            quarterId: '2026-Q2',
            source: 'ai',
            title: 'Q2 打磨 API 驱动的成长闭环',
          },
        ],
        vision: {
          content: '成为能稳定交付产品闭环的人',
          createdAt: '2026-04-30T09:07:00.000Z',
          id: 'vision-api-1',
          source: 'ai',
        },
      },
    });
  });

  await page.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });

  await expect(page.getByText('API 接入计划页周重点')).toBeVisible();
  await expect(page.getByText('保持原型计划页视觉层级')).toBeVisible();
  await expect(page.getByText('补齐 Playwright 路由 mock')).toBeVisible();
  await expect(page.getByText('自己掌控粒度，空着也可以继续走')).toHaveCount(0);
  await expect(page.getByText('AI 重规划')).toBeVisible();
  expect(focusRequests).toHaveLength(1);
  expect(goalRequests).toHaveLength(1);

  await page.getByText('年/季度').click();
  await expect(page.getByText('Q2 打磨 API 驱动的成长闭环')).toBeVisible();
  await expect(page.getByText('四月完成真实计划页联调')).toBeVisible();
  await expect(page.getByText('成为能稳定交付产品闭环的人')).toBeVisible();

  await page.getByText('周/月计划').click();
  await page.getByText('AI 重规划').click();
  await page.getByText('生成新版本').click();
  await expect(page.getByText('把任务密度从 4 件降到 3 件，先保证能完成')).toBeVisible();
  await expect(updateRequests).toHaveLength(1);
  expect(updateRequests[0].focuses).toHaveLength(3);
});

test('plan page keeps empty fallback and manual source when APIs return no plan hierarchy', async ({ page }) => {
  await page.route(`${apiBase}/plans/weeks/${weekId}/focuses`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: [],
    });
  });

  await page.route(`${apiBase}/goals/current`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        currentMonthId: '2026-04',
        currentQuarterId: '2026-Q2',
        monthGoals: [],
        quarterGoals: [],
        vision: null,
      },
    });
  });

  await page.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });

  await expect(page.getByText('手动 OKR', { exact: true })).toBeVisible();
  await expect(page.getByText('暂未设置').first()).toBeVisible();
  await expect(page.getByText('本周暂无重点，先保留一个轻量计划')).toBeVisible();
  await expect(page.getByText('局部 AI')).toBeVisible();
});
