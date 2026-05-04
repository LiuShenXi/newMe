const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const apiBase = 'http://127.0.0.1:37200/api/v1';

test.use({
  viewport: { width: 393, height: 812 },
  isMobile: true,
});

async function mockLoggedInApi(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('newme.accessToken', 'p0-token');
    window.localStorage.setItem('newme.refreshToken', 'p0-refresh');
  });

  await page.route(`${apiBase}/**`, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const now = new Date().toISOString();

    if (url.includes('/me')) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          currentQuarterId: '2026-Q2',
          currentWeekId: '2026-W17',
          hasCompletedOnboarding: true,
          id: 'p0-user',
          phone: '+8613800138000',
          timezone: 'Asia/Shanghai',
        },
      });
      return;
    }

    if (method === 'POST' && url.endsWith('/ai/generations')) {
      const body = JSON.parse(route.request().postData() || '{}');
      const scenario = body.scenario;
      const outputByScenario = {
        annual_to_quarter_okr: {
          quarters: [
            { quarter: 2, goals: [{ title: '打磨 AI 拆解、月计划和成长树反馈', goalType: 'project' }] },
          ],
        },
        quarter_to_four_week_commitments: {
          weeks: [
            { weekNumber: 1, focuses: [{ title: '完成本周重点' }] },
            { weekNumber: 2, focuses: [{ title: '打磨计划页' }] },
            { weekNumber: 3, focuses: [{ title: '补齐成长树回看' }] },
            { weekNumber: 4, focuses: [{ title: '验证周结算' }] },
          ],
        },
        quick_quarter_plan: {
          todayTodos: [{ title: '跑步 30 分钟' }, { title: '睡前阅读 20 分钟' }],
          weeklyFocuses: [
            { title: '识别目标类型', note: '先把本周行动变小' },
            { title: '完成一轮周计划', note: '只规划最近一个月' },
            { title: '确认今日清单', note: '先跑通执行闭环' },
          ],
        },
        vision_to_annual_okr: {
          objectives: [{ title: '建立稳定创造系统', keyResults: ['完成 NewMe MVP', '保持运动阅读节奏'] }],
        },
      };

      await route.fulfill({
        contentType: 'application/json',
        json: {
          createdAt: now,
          id: `generation-${scenario}`,
          inputJson: body.input ?? {},
          outputJson: outputByScenario[scenario] ?? outputByScenario.quick_quarter_plan,
          scenario,
          status: 'draft',
        },
      });
      return;
    }

    if (method === 'POST' && url.includes('/confirm')) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          applied: { todos: 1, weekPlans: 1, weeklyFocuses: 3 },
          generation: {
            createdAt: now,
            id: 'confirmed-generation',
            inputJson: {},
            outputJson: {},
            scenario: 'quick_quarter_plan',
            status: 'confirmed',
          },
        },
      });
      return;
    }

    if (url.includes('/energy/weeks/')) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          average: 78,
          entries: [
            { date: '2026-04-20', hasViewedTodos: true, id: 'e1', score: 72, weekId: '2026-W17' },
            { date: '2026-04-21', hasViewedTodos: true, id: 'e2', score: 84, weekId: '2026-W17' },
            { date: '2026-04-22', hasViewedTodos: true, id: 'e3', score: 66, weekId: '2026-W17' },
            { date: '2026-04-23', hasViewedTodos: true, id: 'e4', score: 88, weekId: '2026-W17' },
            { date: '2026-04-24', hasViewedTodos: true, id: 'e5', score: 78, weekId: '2026-W17' },
          ],
          recordedDays: 5,
          weekId: '2026-W17',
        },
      });
      return;
    }

    if (url.includes('/todos/today')) {
      await route.fulfill({
        contentType: 'application/json',
        json: [
          {
            completed: true,
            date: '2026-04-26',
            estimatedMinutes: null,
            id: 'todo-1',
            source: 'ai',
            sourceFocusId: null,
            title: '整理本周 3 个重点承诺',
            userEdited: false,
          },
          {
            completed: false,
            date: '2026-04-26',
            estimatedMinutes: null,
            id: 'todo-2',
            source: 'ai',
            sourceFocusId: null,
            title: '跑步 30 分钟',
            userEdited: false,
          },
        ],
      });
      return;
    }

    if (url.includes('/plans/weeks/')) {
      await route.fulfill({
        contentType: 'application/json',
        json: [
          {
            id: 'focus-1',
            invalidatedAt: null,
            reason: null,
            source: 'ai',
            title: '识别目标是项目型、习惯型还是阅读学习型',
            weekId: '2026-W17',
          },
        ],
      });
      return;
    }

    if (url.includes('/goals/current')) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          currentMonthId: '2026-04',
          currentQuarterId: '2026-Q2',
          monthGoals: [{ id: 'm1', monthId: '2026-04', source: 'ai', title: '完善计划页 4 周滚动计划' }],
          quarterGoals: [
            { goalType: 'project', id: 'q1', quarterId: '2026-Q2', source: 'ai', title: '打磨 AI 拆解体验' },
          ],
          vision: { content: '身体强健，有稳定创造力', createdAt: now, id: 'v1', source: 'ai' },
        },
      });
      return;
    }

    if (method === 'POST' && url.includes('/settlements/')) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          createdAt: now,
          finalScore: 82,
          id: 'settlement-1',
          reflection: '这一周虽然有几次节奏被打断，但关键推进没有断线。',
          suggestedScore: 78,
          weekId: '2026-W17',
        },
      });
      return;
    }

    await route.fulfill({ contentType: 'application/json', json: { ok: true } });
  });
}

test('deep vision follows prototype staged flow instead of stacking all planning levels', async ({ page }) => {
  await mockLoggedInApi(page);
  await page.goto(`${baseUrl}/onboarding/vision`, { waitUntil: 'networkidle' });

  await expect(page.getByLabel('返回上一步')).toBeVisible();
  await expect(page.getByText('five-year vision')).toBeVisible();
  await expect(page.getByText('五年后，你希望自己成为一个什么样的人？')).toBeVisible();
  await expect(page.getByRole('button', { name: '继续' })).toBeVisible();
  await expect(page.getByRole('button', { name: '先快速规划这个季度' })).toBeVisible();
  await expect(page.getByText('生成年度 OKR')).toHaveCount(0);

  await page.getByPlaceholder('可以很具体，也可以很模糊。比如：身体强健，有稳定创造力，靠自己的作品获得自由').fill('身体强健，有稳定创造力，靠自己的作品获得自由');
  await page.getByRole('button', { name: '继续' }).click();
  await expect(page.getByText('我记住了。')).toBeVisible();
  await expect(page.getByRole('button', { name: '整理今年 OKR' })).toBeVisible();

  await page.getByRole('button', { name: '整理今年 OKR' }).click();
  await expect(page.getByLabel('重新生成当前层级')).toBeVisible();
  await expect(page.getByText('年度 OKR', { exact: true })).toBeVisible();
  await expect(page.getByText('年度方向 1')).toBeVisible();
  await expect(page.getByText('可修改')).toBeVisible();
  await page.getByLabel('年度方向 1 可修改').fill('用户改过的年度方向\nKR：保留真实修改');
  let confirmRequests = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/ai/generations/') && request.url().endsWith('/confirm')) {
      confirmRequests += 1;
    }
  });
  const quarterGeneration = page.waitForRequest((request) => {
    if (!request.url().endsWith('/ai/generations') || request.method() !== 'POST') return false;
    const body = JSON.parse(request.postData() || '{}');
    return body.scenario === 'annual_to_quarter_okr';
  });
  await page.getByRole('button', { name: '确认年度 OKR' }).click();
  const request = await quarterGeneration;
  const body = JSON.parse(request.postData() || '{}');
  expect(JSON.stringify(body.input.annualOkr)).toContain('用户改过的年度方向');
  expect(confirmRequests).toBe(1);
  const quarterRegeneration = page.waitForRequest((nextRequest) => {
    if (!nextRequest.url().endsWith('/ai/generations') || nextRequest.method() !== 'POST') return false;
    const nextBody = JSON.parse(nextRequest.postData() || '{}');
    return nextBody.scenario === 'annual_to_quarter_okr';
  });
  await page.getByLabel('重新生成当前层级').click();
  const regenerateRequest = await quarterRegeneration;
  const regenerateBody = JSON.parse(regenerateRequest.postData() || '{}');
  expect(JSON.stringify(regenerateBody.input.annualOkr)).toContain('用户改过的年度方向');
  expect(confirmRequests).toBe(1);
  await expect(page.getByText('季度 OKR 草案')).toHaveCount(0);
});

test('path choice is a single prototype path-choice surface', async ({ page }) => {
  await mockLoggedInApi(page);
  await page.goto(`${baseUrl}/onboarding/choose`, { waitUntil: 'networkidle' });

  await expect(page.getByText('New year map')).toBeVisible();
  await expect(page.getByText('你想怎样开始今年？')).toBeVisible();
  await expect(page.getByRole('button', { name: /体验深度愿景规划/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /先快速规划这个季度/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /手动创建 OKR/ })).toBeVisible();
  await expect(page.getByText('Deep vision')).toHaveCount(0);
});

test('quick planning review exposes regenerate plus list and energy exits', async ({ page }) => {
  await mockLoggedInApi(page);
  await page.goto(`${baseUrl}/onboarding/quick`, { waitUntil: 'networkidle' });

  await expect(page.getByLabel('返回上一步')).toBeVisible();
  await expect(page.getByText('这个季度，你最想推进的一件事是什么？')).toBeVisible();
  await page.getByPlaceholder('例如：开发一款 App，上架到应用商店').fill('开发一款 App，上架到应用商店');
  await page.getByRole('button', { name: '让 AI 帮我拆成这周行动' }).click();

  await expect(page.getByLabel('重新生成当前层级')).toBeVisible();
  await expect(page.getByText('本周先推进这 3 件事')).toBeVisible();
  await expect(page.getByText('今日清单建议')).toBeVisible();
  await expect(page.getByRole('button', { name: '先看今日清单' })).toBeVisible();
  await expect(page.getByRole('button', { name: '进入能量页' })).toBeVisible();
});

test('manual onboarding keeps one active level and prototype top actions', async ({ page }) => {
  await mockLoggedInApi(page);
  await page.goto(`${baseUrl}/onboarding/manual/annual`, { waitUntil: 'networkidle' });

  await expect(page.getByLabel('返回上一步')).toBeVisible();
  await expect(page.getByText('Manual OKR')).toBeVisible();
  await expect(page.getByText('01 / 年目标')).toBeVisible();
  await expect(page.getByRole('button', { name: 'AI 辅助' })).toBeVisible();
  await expect(page.getByRole('button', { name: '继续' })).toBeVisible();
  await expect(page.getByText('季度目标')).toHaveCount(0);
  await expect(page.getByText('本周计划')).toHaveCount(0);
});

test('plan week click opens the same week overview on todo page', async ({ page }) => {
  await mockLoggedInApi(page);
  await page.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'W17 · 本周重点 计划中' }).click();
  await expect(page).toHaveURL(/\/todo/);
  await expect(page.getByText('W17 · 本周 7 天概览')).toBeVisible();
});

test('settlement uses a continuous result slider', async ({ page }) => {
  await mockLoggedInApi(page);
  await page.goto(`${baseUrl}/settlement`, { waitUntil: 'networkidle' });

  await expect(page.getByText('最终周结果')).toBeVisible();
  await expect(page.getByRole('slider', { name: '最终周结果' })).toBeVisible();
  await expect(page.getByRole('button', { name: '确认并生成果实' })).toBeVisible();
});
