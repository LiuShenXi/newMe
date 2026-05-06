const DEFAULT_BASE_URL = 'http://127.0.0.1:37200/api/v1';

const baseUrl = process.env.API_BASE_URL || DEFAULT_BASE_URL;
const state = {
  accessToken: null,
  aiGenerationId: null,
  phone: `139${Math.floor(10000000 + Math.random() * 90000000)}`,
  todoId: null,
};
const results = [];

async function main() {
  await mark('health', () => request('/health', { skipAuth: true }));
  const codeResponse = await mark('auth_code', () =>
    request('/auth/code', {
      body: { phone: state.phone },
      skipAuth: true,
    }),
  );
  const devCode = codeResponse?.devCode;

  const loginResponse = await mark('auth_login', () =>
    request('/auth/login', {
      body: { code: devCode, phone: state.phone },
      skipAuth: true,
    }),
  );
  state.accessToken = loginResponse?.accessToken ?? null;

  const me = await mark('me', () => request('/me'));
  const weekId = me?.currentWeekId || '2026-W19';
  const quarterId = me?.currentQuarterId || '2026-Q2';
  const date = new Date().toISOString().slice(0, 10);

  await mark('me_profile_patch', () =>
    request('/me/profile', {
      body: { displayName: 'HTTP Smoke User', email: 'smoke@example.com' },
      method: 'PATCH',
    }),
  );

  await mark('goals_vision_put', () =>
    request('/goals/vision', {
      body: { content: 'Five years later I have a stable creation system.' },
      method: 'PUT',
    }),
  );
  await mark('goals_quarter_post', () =>
    request(`/goals/quarters/${quarterId}/goals`, {
      body: { title: 'Ship the NewMe MVP' },
    }),
  );
  await mark('goals_month_post', () =>
    request('/goals/months/2026-05/goals', {
      body: { title: 'Finish full release smoke coverage' },
    }),
  );
  await mark('goals_current_get', () => request('/goals/current'));

  await mark('plans_focuses_put', () =>
    request(`/plans/weeks/${weekId}/focuses`, {
      body: {
        focuses: [
          { reason: 'Release verification', title: 'Run HTTP smoke' },
          { reason: 'E2E baseline', title: 'Run Playwright flow tests' },
          { reason: 'Prototype parity', title: 'Run prototype regression checks' },
        ],
      },
      method: 'PUT',
    }),
  );
  await mark('plans_focuses_get', () => request(`/plans/weeks/${weekId}/focuses`));

  const todo = await mark('todos_create', () =>
    request('/todos', {
      body: {
        date,
        estimatedMinutes: 20,
        title: 'HTTP smoke task',
      },
    }),
  );
  state.todoId = todo?.id ?? null;
  await mark('todos_today_get', () => request(`/todos/today?date=${date}`));
  await mark('todos_patch', () =>
    request(`/todos/${state.todoId}`, {
      body: { completed: true, title: 'HTTP smoke task updated' },
      method: 'PATCH',
    }),
  );

  await mark('energy_put', () =>
    request(`/energy/days/${date}`, {
      body: { hasViewedTodos: true, score: 83 },
      method: 'PUT',
    }),
  );
  await mark('energy_week_get', () => request(`/energy/weeks/${weekId}`));
  await mark('settlement_post', () =>
    request(`/settlements/weeks/${weekId}`, {
      body: { finalScore: 83, reflection: 'HTTP smoke settlement' },
    }),
  );
  await mark('tree_year_get', () => request('/tree/years/2026'));
  await mark('sync_pull', () =>
    request('/sync/pull', {
      body: {
        deviceId: 'http-smoke-device',
        lastPulledAt: '1970-01-01T00:00:00.000Z',
      },
    }),
  );
  await mark('notifications_token', () =>
    request('/notifications/tokens', {
      body: { platform: 'web', token: 'ExponentPushToken[http-smoke]' },
    }),
  );
  await mark('notifications_preferences', () =>
    request('/notifications/preferences', {
      body: { dailyEnergy: false, weeklySettlement: true },
      method: 'PUT',
    }),
  );

  const generation = await mark('ai_generations', () =>
    request('/ai/generations', {
      body: {
        contextVersion: 'http-smoke:v1',
        input: {
          date,
          goal: 'Ship the NewMe MVP',
          quarterId,
          weekId,
        },
        scenario: 'quick_quarter_plan',
      },
      timeoutMs: 90_000,
    }),
  );
  state.aiGenerationId = generation?.id ?? null;
  await mark('ai_confirm', () =>
    request(`/ai/generations/${state.aiGenerationId}/confirm`, {
      body: {
        contextVersion: 'http-smoke:v1',
        edits: {
          date,
          goal: 'Ship the NewMe MVP',
          quarterId,
          weekId,
        },
        generationId: state.aiGenerationId,
        scenario: 'quick_quarter_plan',
        target: 'week_plan',
      },
      timeoutMs: 90_000,
    }),
  );

  await mark('todos_delete', () => request(`/todos/${state.todoId}`, { method: 'DELETE' }));
  await mark('auth_logout', () => request('/auth/logout', { method: 'POST' }));

  const failed = results.filter((result) => !result.ok);
  for (const result of results) {
    console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.name}${result.error ? ` - ${result.error}` : ''}`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

async function mark(name, run) {
  try {
    const value = await run();
    results.push({ name, ok: true });
    return value;
  } catch (error) {
    results.push({
      error: error instanceof Error ? error.message : String(error),
      name,
      ok: false,
    });
    return null;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30_000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(options.skipAuth || !state.accessToken ? {} : { Authorization: `Bearer ${state.accessToken}` }),
      },
      method: options.method || (options.body === undefined ? 'GET' : 'POST'),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${text}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
