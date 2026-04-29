import { HttpStatus } from '@nestjs/common';
import { AiScenario } from '@newme/shared';
import { AiService } from '../ai.service';
import { CircuitBreaker } from '../circuit-breaker';
import { OutputValidator } from '../output/output-validator';
import { PromptRegistry } from '../prompt/prompt-registry';
import { RateLimiter } from '../rate-limiter';

describe('AiService', () => {
  const now = new Date('2026-04-29T12:00:00.000Z');
  const validQuickPlan = {
    goalType: 'project',
    weeklyFocuses: [
      { title: '完成 API 闭环', reason: '这是后续联调基础' },
      { title: '搭好移动端壳', reason: '让核心页面可进入' },
      { title: '补齐本地数据层', reason: '支持离线可用' },
    ],
    todayTodos: [
      {
        title: '完成 AI 骨架测试',
        estimatedMinutes: 45,
        sourceFocusTitle: '完成 API 闭环',
      },
    ],
  };

  function createService() {
    const prisma = {
      aiGeneration: {
        create: jest.fn().mockResolvedValue({
          id: 'generation-1',
          scenario: 'QUICK_QUARTER_PLAN',
          status: 'COMPLETED',
          outputJson: validQuickPlan,
          createdAt: now,
        }),
      },
    };
    const provider = {
      generate: jest.fn().mockResolvedValue(JSON.stringify(validQuickPlan)),
    };
    const service = new AiService(
      prisma as any,
      new PromptRegistry(),
      new OutputValidator(),
      new RateLimiter({ now: () => now }),
      new CircuitBreaker({ now: () => now }),
      provider,
      { now: () => now, model: 'mock-model' },
    );

    return { service, prisma, provider };
  }

  it('generates a validated draft and records the completed generation', async () => {
    const { service, prisma, provider } = createService();

    await expect(
      service.generateDraft('user-1', {
        scenario: AiScenario.QUICK_QUARTER_PLAN,
        input: { goal: '发布个人成长 App MVP' },
        contextVersion: 'ctx-1',
      }),
    ).resolves.toEqual({
      id: 'generation-1',
      scenario: AiScenario.QUICK_QUARTER_PLAN,
      status: 'completed',
      outputJson: validQuickPlan,
      createdAt: now.toISOString(),
    });
    expect(provider.generate).toHaveBeenCalledWith(
      expect.stringContaining('quick_quarter_plan'),
      expect.objectContaining({ model: 'mock-model', timeoutMs: 25000 }),
    );
    expect(prisma.aiGeneration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        scenario: 'QUICK_QUARTER_PLAN',
        promptVersion: 'quick_quarter_plan:v1',
        model: 'mock-model',
        inputJson: { goal: '发布个人成长 App MVP' },
        outputJson: validQuickPlan,
        status: 'COMPLETED',
        contextVersion: 'ctx-1',
      }),
    });
  });

  it('rate limits the same user and scenario after three requests per minute', async () => {
    const { service } = createService();
    const request = {
      scenario: AiScenario.QUICK_QUARTER_PLAN,
      input: { goal: '发布个人成长 App MVP' },
    };

    await service.generateDraft('user-1', request);
    await service.generateDraft('user-1', request);
    await service.generateDraft('user-1', request);

    await expect(service.generateDraft('user-1', request)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });
});
