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

  it('confirms a quick quarter draft by writing the quarter goal, weekly focuses, and today todos', async () => {
    const { service, prisma } = createService();
    const prismaAny = prisma as any;
    const generation = {
      id: 'generation-1',
      userId: 'user-1',
      scenario: 'QUICK_QUARTER_PLAN',
      status: 'COMPLETED',
      inputJson: {
        date: '2026-04-29',
        goal: '发布个人成长 App MVP',
        quarterId: '2026-Q2',
        weekId: '2026-W18',
      },
      outputJson: validQuickPlan,
      createdAt: now,
    };
    const quarter = { id: 'quarter-1' };
    const weekPlan = { id: 'week-plan-1' };
    const focuses = [
      { id: 'focus-1', title: validQuickPlan.weeklyFocuses[0].title },
      { id: 'focus-2', title: validQuickPlan.weeklyFocuses[1].title },
      { id: 'focus-3', title: validQuickPlan.weeklyFocuses[2].title },
    ];
    const confirmedGeneration = {
      ...generation,
      status: 'CONFIRMED',
      confirmedAt: now,
    };

    Object.assign(prismaAny, {
      $transaction: jest.fn(async (callback) => callback(prisma)),
      aiGeneration: {
        ...prismaAny.aiGeneration,
        findFirst: jest.fn().mockResolvedValue(generation),
        update: jest.fn().mockResolvedValue(confirmedGeneration),
      },
      quarter: {
        upsert: jest.fn().mockResolvedValue(quarter),
      },
      quarterGoal: {
        create: jest.fn().mockResolvedValue({ id: 'quarter-goal-1' }),
      },
      weekPlan: {
        upsert: jest.fn().mockResolvedValue(weekPlan),
      },
      weeklyFocus: {
        create: jest
          .fn()
          .mockResolvedValueOnce(focuses[0])
          .mockResolvedValueOnce(focuses[1])
          .mockResolvedValueOnce(focuses[2]),
      },
      todo: {
        create: jest.fn().mockResolvedValue({ id: 'todo-1' }),
      },
      user: {
        update: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
    });

    await expect(
      (service as any).confirmGeneration('user-1', 'generation-1', {
        contextVersion: 'ctx-quick',
        generationId: 'generation-1',
        scenario: AiScenario.QUICK_QUARTER_PLAN,
        target: 'week_plan',
      }),
    ).resolves.toEqual({
      applied: { quarterGoals: 1, todayTodos: 1, weeklyFocuses: 3 },
      generation: {
        id: 'generation-1',
        scenario: AiScenario.QUICK_QUARTER_PLAN,
        status: 'confirmed',
        outputJson: validQuickPlan,
        createdAt: now.toISOString(),
      },
    });

    expect(prismaAny.quarter.upsert).toHaveBeenCalledWith({
      where: { userId_year_quarter: { quarter: 2, userId: 'user-1', year: 2026 } },
      update: {},
      create: expect.objectContaining({
        quarter: 2,
        source: 'AI',
        userId: 'user-1',
        year: 2026,
      }),
    });
    expect(prismaAny.quarterGoal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        goalType: 'PROJECT',
        quarterId: 'quarter-1',
        source: 'AI',
        title: '发布个人成长 App MVP',
        userId: 'user-1',
      }),
    });
    expect(prismaAny.weekPlan.upsert).toHaveBeenCalledWith({
      where: { userId_weekId: { userId: 'user-1', weekId: '2026-W18' } },
      update: expect.objectContaining({ source: 'AI' }),
      create: expect.objectContaining({ source: 'AI', userId: 'user-1', weekId: '2026-W18' }),
    });
    expect(prismaAny.weeklyFocus.create).toHaveBeenCalledTimes(3);
    expect(prismaAny.todo.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        date: new Date('2026-04-29T00:00:00.000Z'),
        source: 'AI',
        sourceFocusId: 'focus-1',
        title: '完成 AI 骨架测试',
        userId: 'user-1',
        weekPlanId: 'week-plan-1',
      }),
    });
    expect(prismaAny.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { hasCompletedOnboarding: true },
    });
  });
});
