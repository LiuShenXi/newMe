const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const apiBase = 'http://127.0.0.1:37200/api/v1';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('quick onboarding generates an AI draft, confirms it, and enters the energy flow', async ({ page }) => {
  const generateRequests = [];
  const confirmRequests = [];

  await page.route(`${apiBase}/ai/generations`, async (route) => {
    const request = route.request();
    generateRequests.push(JSON.parse(request.postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        createdAt: '2026-04-30T09:07:00.000Z',
        id: 'generation-quick-1',
        outputJson: {
          goalType: 'project',
          todayTodos: [
            {
              estimatedMinutes: 45,
              sourceFocusTitle: '跑通真实 AI 规划链路',
              title: '接入 quick 页面真实生成',
            },
          ],
          weeklyFocuses: [
            { reason: '先完成最短闭环', title: '跑通真实 AI 规划链路' },
            { reason: '确认后进入执行页', title: '生成本周重点和今日清单' },
            { reason: '为后续深度路径复用', title: '沉淀确认写入契约' },
          ],
        },
        scenario: 'quick_quarter_plan',
        status: 'completed',
      },
    });
  });

  await page.route(`${apiBase}/ai/generations/generation-quick-1/confirm`, async (route) => {
    const request = route.request();
    confirmRequests.push(JSON.parse(request.postData() || '{}'));
    await route.fulfill({
      contentType: 'application/json',
      json: {
        applied: { quarterGoals: 1, todayTodos: 1, weeklyFocuses: 3 },
        generation: {
          createdAt: '2026-04-30T09:07:00.000Z',
          id: 'generation-quick-1',
          outputJson: {},
          scenario: 'quick_quarter_plan',
          status: 'confirmed',
        },
      },
    });
  });

  await page.goto(`${baseUrl}/onboarding/quick`, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('例如：完成个人成长 App 的第一个可用 MVP。').fill('发布个人成长 App MVP');
  await page.getByText('让 AI 帮我拆成这周行动').click();

  await expect(page.getByText('跑通真实 AI 规划链路')).toBeVisible();
  await expect(page.getByText('接入 quick 页面真实生成')).toBeVisible();
  await expect(generateRequests).toHaveLength(1);
  expect(generateRequests[0]).toMatchObject({
    input: { goal: '发布个人成长 App MVP' },
    scenario: 'quick_quarter_plan',
  });

  await page.getByText('确认并进入能量页').click();
  await expect(page).toHaveURL(/\/energy$/);
  await expect(confirmRequests).toHaveLength(1);
  expect(confirmRequests[0]).toMatchObject({
    generationId: 'generation-quick-1',
    scenario: 'quick_quarter_plan',
    target: 'week_plan',
  });
});
