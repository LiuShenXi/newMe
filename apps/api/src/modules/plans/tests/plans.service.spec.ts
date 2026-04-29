import { Source } from '@newme/shared';
import { Source as PrismaSource } from '@prisma/client';
import { PlansService } from '../plans.service';

describe('PlansService', () => {
  const now = new Date('2026-04-29T12:00:00.000Z');

  function createService() {
    const prisma = {
      weeklyFocus: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'focus-1',
            weekId: '2026-W18',
            title: '完成 API 核心闭环',
            reason: '支撑后续端到端联调',
            source: PrismaSource.MANUAL,
            invalidatedAt: null,
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      weekPlan: {
        upsert: jest.fn().mockResolvedValue({
          id: 'week-plan-1',
          weekId: '2026-W18',
        }),
      },
    };

    return {
      service: new PlansService(prisma as any, {
        now: () => now,
      }),
      prisma,
    };
  }

  it('returns active weekly focuses for a week', async () => {
    const { service, prisma } = createService();

    await expect(service.getWeeklyFocuses('user-1', '2026-W18')).resolves.toEqual([
      {
        id: 'focus-1',
        weekId: '2026-W18',
        title: '完成 API 核心闭环',
        reason: '支撑后续端到端联调',
        source: Source.MANUAL,
        invalidatedAt: null,
      },
    ]);
    expect(prisma.weeklyFocus.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        weekId: '2026-W18',
        deletedAt: null,
        invalidatedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('invalidates old AI focuses and writes confirmed manual focuses', async () => {
    const { service, prisma } = createService();

    await expect(
      service.updateWeeklyFocuses('user-1', '2026-W18', {
        focuses: [
          { title: '完成计划模块', reason: '让清单页有周锚点' },
          { title: '补齐任务 CRUD' },
        ],
      }),
    ).resolves.toEqual({ weekPlanId: 'week-plan-1', count: 2 });
    expect(prisma.weekPlan.upsert).toHaveBeenCalledWith({
      where: {
        userId_weekId: {
          userId: 'user-1',
          weekId: '2026-W18',
        },
      },
      update: {},
      create: {
        userId: 'user-1',
        weekId: '2026-W18',
        source: PrismaSource.MANUAL,
      },
    });
    expect(prisma.weeklyFocus.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        weekId: '2026-W18',
        source: PrismaSource.AI,
        invalidatedAt: null,
        deletedAt: null,
      },
      data: { invalidatedAt: now },
    });
    expect(prisma.weeklyFocus.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: 'user-1',
          weekPlanId: 'week-plan-1',
          weekId: '2026-W18',
          title: '完成计划模块',
          reason: '让清单页有周锚点',
          source: PrismaSource.MANUAL,
        },
        {
          userId: 'user-1',
          weekPlanId: 'week-plan-1',
          weekId: '2026-W18',
          title: '补齐任务 CRUD',
          reason: null,
          source: PrismaSource.MANUAL,
        },
      ],
    });
  });
});
