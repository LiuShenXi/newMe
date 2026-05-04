const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const apiBase = 'http://127.0.0.1:37200/api/v1';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('vision onboarding cascades annual, quarter, and four-week AI confirmations before entering energy', async ({ page }) => {
  const generateRequests = [];
  const confirmRequests = [];

  await page.route(`${apiBase}/ai/generations`, async (route) => {
    const request = route.request();
    const body = JSON.parse(request.postData() || '{}');
    generateRequests.push(body);

    const responseByScenario = {
      vision_to_annual_okr: {
        id: 'generation-annual-1',
        outputJson: {
          objectives: [
            {
              title: '建立稳定的产品创作系统',
              keyResults: ['每季度发布一个可用版本', '全年完成 48 周持续复盘'],
            },
          ],
        },
      },
      annual_to_quarter_okr: {
        id: 'generation-quarter-1',
        outputJson: {
          quarters: [
            { quarter: 1, goals: [{ goalType: 'project', title: '跑通 MVP 闭环' }] },
            { quarter: 2, goals: [{ goalType: 'habit', title: '建立每周发布节奏' }] },
            { quarter: 3, goals: [{ goalType: 'result', title: '完成首批用户验证' }] },
            { quarter: 4, goals: [{ goalType: 'project', title: '沉淀可复用增长系统' }] },
          ],
        },
      },
      quarter_to_four_week_commitments: {
        id: 'generation-weeks-1',
        outputJson: {
          weeks: [
            {
              weekNumber: 1,
              focuses: [
                { reason: '先跑通最短路径', title: '完成深度愿景联调' },
                { reason: '确保确认写入', title: '验证三段 AI 确认链路' },
                { reason: '进入日常执行', title: '生成首周承诺' },
              ],
            },
            {
              weekNumber: 2,
              focuses: [
                { reason: '持续打磨', title: '优化计划页承接' },
                { reason: '降低使用成本', title: '整理今日清单建议' },
                { reason: '保留反馈闭环', title: '补齐能量页入口' },
              ],
            },
          ],
        },
      },
    };

    const draft = responseByScenario[body.scenario];
    await route.fulfill({
      contentType: 'application/json',
      json: {
        createdAt: '2026-04-30T09:07:00.000Z',
        id: draft.id,
        outputJson: draft.outputJson,
        scenario: body.scenario,
        status: 'completed',
      },
    });
  });

  await page.route(`${apiBase}/ai/generations/*/confirm`, async (route) => {
    const request = route.request();
    const body = JSON.parse(request.postData() || '{}');
    confirmRequests.push(body);

    await route.fulfill({
      contentType: 'application/json',
      json: {
        applied:
          body.scenario === 'vision_to_annual_okr'
            ? { annualObjectives: 1 }
            : body.scenario === 'annual_to_quarter_okr'
              ? { quarterGoals: 4 }
              : { weekPlans: 2, weeklyFocuses: 6 },
        generation: {
          createdAt: '2026-04-30T09:07:00.000Z',
          id: body.generationId,
          outputJson: {},
          scenario: body.scenario,
          status: 'confirmed',
        },
      },
    });
  });

  await page.goto(`${baseUrl}/onboarding/vision`, { waitUntil: 'networkidle' });
  await page
    .getByPlaceholder('例如：我有稳定的产品节奏、健康的身体和可持续的创作系统。')
    .fill('五年后，我拥有稳定的产品创作系统和健康的生活节奏');

  await page.getByText('生成年度 OKR').click();
  await expect(page.getByText('建立稳定的产品创作系统')).toBeVisible();
  await page.getByText('确认年度 OKR，继续生成季度 OKR').click();
  await expect(page.getByText('跑通 MVP 闭环')).toBeVisible();

  await page.getByText('确认季度 OKR，继续生成四周承诺').click();
  await expect(page.getByText('完成深度愿景联调')).toBeVisible();

  await page.getByText('确认四周承诺并进入能量页').click();
  await expect(page).toHaveURL(/\/energy$/);

  expect(generateRequests.map((request) => request.scenario)).toEqual([
    'vision_to_annual_okr',
    'annual_to_quarter_okr',
    'quarter_to_four_week_commitments',
  ]);
  expect(confirmRequests.map((request) => request.scenario)).toEqual([
    'vision_to_annual_okr',
    'annual_to_quarter_okr',
    'quarter_to_four_week_commitments',
  ]);
  expect(confirmRequests.map((request) => request.target)).toEqual([
    'annual_objective',
    'quarter_goals',
    'week_plan',
  ]);
});
