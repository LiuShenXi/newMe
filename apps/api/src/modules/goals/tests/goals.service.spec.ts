import { Source } from '@newme/shared';
import { Source as PrismaSource } from '@prisma/client';
import { GoalsService } from '../goals.service';

describe('GoalsService', () => {
  const createdAt = new Date('2026-04-29T12:00:00.000Z');

  function createService() {
    const prisma = {
      vision: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      quarter: {
        upsert: jest.fn().mockResolvedValue({ id: 'quarter-db-1' }),
      },
      quarterGoal: {
        create: jest.fn().mockResolvedValue({
          id: 'quarter-goal-1',
          quarterId: 'quarter-db-1',
          title: '发布个人成长 App MVP',
          goalType: null,
          source: Source.MANUAL,
        }),
        findMany: jest.fn(),
      },
      monthGoal: {
        create: jest.fn().mockResolvedValue({
          id: 'month-goal-1',
          monthId: '2026-04',
          title: '完成后端核心闭环',
          source: Source.MANUAL,
        }),
        findMany: jest.fn(),
      },
    };

    return {
      service: new GoalsService(prisma as any, {
        now: () => createdAt,
      }),
      prisma,
    };
  }

  it('updates the active vision for a user', async () => {
    const { service, prisma } = createService();
    prisma.vision.findFirst.mockResolvedValue({ id: 'vision-1' });
    prisma.vision.update.mockResolvedValue({
      id: 'vision-1',
      content: '五年后成为能持续创造产品的人',
      source: Source.MANUAL,
      createdAt,
    });

    await expect(
      service.upsertVision('user-1', {
        content: '五年后成为能持续创造产品的人',
      }),
    ).resolves.toEqual({
      id: 'vision-1',
      content: '五年后成为能持续创造产品的人',
      source: Source.MANUAL,
      createdAt: createdAt.toISOString(),
    });
    expect(prisma.vision.update).toHaveBeenCalledWith({
      where: { id: 'vision-1' },
      data: {
        content: '五年后成为能持续创造产品的人',
        source: PrismaSource.MANUAL,
      },
    });
  });

  it('creates a quarter goal from a logical quarter id', async () => {
    const { service, prisma } = createService();

    await expect(
      service.createQuarterGoal('user-1', '2026-Q2', {
        title: '发布个人成长 App MVP',
      }),
    ).resolves.toEqual({
      id: 'quarter-goal-1',
      quarterId: '2026-Q2',
      title: '发布个人成长 App MVP',
      goalType: null,
      source: Source.MANUAL,
    });
    expect(prisma.quarter.upsert).toHaveBeenCalledWith({
      where: {
        userId_year_quarter: {
          userId: 'user-1',
          year: 2026,
          quarter: 2,
        },
      },
      update: {},
      create: {
        userId: 'user-1',
        year: 2026,
        quarter: 2,
        startsOn: new Date('2026-04-01T00:00:00.000Z'),
        endsOn: new Date('2026-06-30T00:00:00.000Z'),
          source: PrismaSource.SYSTEM,
      },
    });
    expect(prisma.quarterGoal.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        quarterId: 'quarter-db-1',
        title: '发布个人成长 App MVP',
        source: PrismaSource.MANUAL,
      },
    });
  });

  it('creates a month goal without requiring an upper-level goal', async () => {
    const { service, prisma } = createService();

    await expect(
      service.createMonthGoal('user-1', '2026-04', {
        title: '完成后端核心闭环',
      }),
    ).resolves.toEqual({
      id: 'month-goal-1',
      monthId: '2026-04',
      title: '完成后端核心闭环',
      source: Source.MANUAL,
    });
    expect(prisma.monthGoal.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        monthId: '2026-04',
        title: '完成后端核心闭环',
        source: PrismaSource.MANUAL,
      },
    });
  });
});
