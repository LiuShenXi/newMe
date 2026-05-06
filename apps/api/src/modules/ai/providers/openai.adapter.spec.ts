import { OpenAiAdapter } from './openai.adapter';

describe('OpenAiAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.useFakeTimers();
    process.env = {
      ...originalEnv,
      AI_FALLBACK_API_KEY: 'glm-test-key',
      AI_FALLBACK_BASE_URL: 'https://open.bigmodel.cn/api/paas/v4',
      AI_FALLBACK_MODEL: 'glm-4-flash',
      AI_LOCAL_API_KEY: 'local-dev-key',
      AI_LOCAL_BASE_URL: 'http://127.0.0.1:4100/v1',
      AI_LOCAL_MODEL: 'local-qwen-coder',
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    process.env = originalEnv;
  });

  it('uses the local OpenAI-compatible endpoint first', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({
        choices: [{ message: { content: '{"suggestions":[]}' } }],
      }),
    );
    const adapter = new OpenAiAdapter({ fetch: fetchMock });

    const result = await adapter.generate('请生成计划', {
      maxTokens: 2000,
      model: 'ignored-by-local-default',
      temperature: 0.2,
      timeoutMs: 25_000,
    });

    expect(result).toBe('{"suggestions":[]}');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:4100/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer local-dev-key',
        }),
        method: 'POST',
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      max_tokens: 2000,
      messages: [{ content: '请生成计划', role: 'user' }],
      model: 'local-qwen-coder',
      temperature: 0.2,
    });
  });

  it('falls back to GLM when the local endpoint is unavailable', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('local service down'))
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [{ message: { content: '{"goalType":"project"}' } }],
        }),
      );
    const adapter = new OpenAiAdapter({ fetch: fetchMock });

    const result = await adapter.generate('请生成计划', {
      maxTokens: 2000,
      model: 'local-qwen-coder',
      temperature: 0.2,
      timeoutMs: 25_000,
    });

    expect(result).toBe('{"goalType":"project"}');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://open.bigmodel.cn/api/paas/v4/chat/completions');
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer glm-test-key');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe('glm-4-flash');
  });

  it('normalizes fenced JSON returned by GLM fallback', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('local service down'))
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [
            {
              message: {
                content: '```json\n{"goalType":"result","weeklyFocuses":[],"todayTodos":[]}\n```',
              },
            },
          ],
        }),
      );
    const adapter = new OpenAiAdapter({ fetch: fetchMock });

    const result = await adapter.generate('请生成计划', {
      maxTokens: 2000,
      model: 'local-qwen-coder',
      temperature: 0.2,
      timeoutMs: 25_000,
    });

    expect(result).toBe('{"goalType":"result","weeklyFocuses":[],"todayTodos":[]}');
  });

  it('surfaces both provider failures when local and fallback fail', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'local 500' } }, false, 500))
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'glm quota' } }, false, 429));
    const adapter = new OpenAiAdapter({ fetch: fetchMock });

    await expect(
      adapter.generate('请生成计划', {
        maxTokens: 2000,
        model: 'local-qwen-coder',
        temperature: 0.2,
        timeoutMs: 25_000,
      }),
    ).rejects.toThrow('AI provider failed: local 500; fallback failed: glm quota');
  });
});

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    json: async () => body,
    ok,
    status,
  };
}
