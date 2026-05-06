const apiBase = 'http://127.0.0.1:37200/api/v1';

async function mockPrototypeApp(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('newme.accessToken', 'prototype-token');
    window.localStorage.setItem('newme.refreshToken', 'prototype-refresh');
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
          displayName: '林间行者',
          email: 'wzz@example.com',
          hasCompletedOnboarding: true,
          id: 'prototype-user',
          phone: '+8613800138000',
          timezone: 'Asia/Shanghai',
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

    if (method === 'PUT' && url.includes('/energy/days/')) {
      await route.fulfill({
        contentType: 'application/json',
        json: { date: '2026-04-26', hasViewedTodos: true, id: 'energy-today', score: 82, weekId: '2026-W17' },
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
            completed: true,
            date: '2026-04-26',
            estimatedMinutes: null,
            id: 'todo-2',
            source: 'manual',
            sourceFocusId: null,
            title: '完成能量球动效第一版',
            userEdited: false,
          },
          {
            completed: false,
            date: '2026-04-26',
            estimatedMinutes: null,
            id: 'todo-3',
            source: 'manual',
            sourceFocusId: null,
            title: '跑步 30 分钟',
            userEdited: false,
          },
          {
            completed: false,
            date: '2026-04-26',
            estimatedMinutes: null,
            id: 'todo-4',
            source: 'manual',
            sourceFocusId: null,
            title: '睡前阅读 20 分钟',
            userEdited: false,
          },
        ],
      });
      return;
    }

    if (url.includes('/plans/weeks/') && method === 'GET') {
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
          quarterGoals: [{ goalType: 'project', id: 'q1', quarterId: '2026-Q2', source: 'ai', title: '打磨 AI 拆解体验' }],
          vision: { content: '身体强健，有稳定创造力', createdAt: now, id: 'v1', source: 'ai' },
        },
      });
      return;
    }

    if (url.includes('/tree/years/')) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          fruits: Array.from({ length: 6 }, (_, index) => ({
            capsuleSummary: '果实亮度来自周结算确认值',
            createdAt: `2026-04-${String(7 + index).padStart(2, '0')}T00:00:00.000Z`,
            id: `fruit-${index + 11}`,
            label: `第 ${index + 11} 周`,
            score: 72 + index,
            weekId: `2026-W${index + 11}`,
          })),
          honors: [{ averageScore: 82, earnedAt: now, id: 'honor-q1', quarterId: '2026-Q1' }],
          stage: 'q2_growth',
          year: 2026,
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

module.exports = { mockPrototypeApp };
