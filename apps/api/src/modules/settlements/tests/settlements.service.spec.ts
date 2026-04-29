import { Source as PrismaSource } from '@prisma/client';
import { SettlementsService } from '../settlements.service';

describe('SettlementsService', () => {
  const confirmedAt = new Date('2026-04-29T12:00:00.000Z');

  function createService() {
    const tx = {
      energyEntry: {
        findMany: jest.fn().mockResolvedValue([
          {
            date: new Date('2026-04-27T00:00:00.000Z'),
            score: 70,
            hasViewedTodos: true,
          },
          {
            date: new Date('2026-04-29T00:00:00.000Z'),
            score: 90,
            hasViewedTodos: false,
          },
        ]),
      },
      todo: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'todo-1', title: '完成 API', completed: true },
          { id: 'todo-2', title: '整理文档', completed: false },
        ]),
      },
      weekPlan: {
        findUnique: jest.fn().mockResolvedValue({ id: 'week-plan-1' }),
      },
      weeklySettlement: {
        create: jest.fn().mockResolvedValue({
          id: 'settlement-1',
          weekId: '2026-W18',
          suggestedScore: 80,
          finalScore: 86,
          reflection: '这一周推进得很扎实',
          snapshotJson: {
            energyEntries: [
              { date: '2026-04-27', score: 70, hasViewedTodos: true },
              { date: '2026-04-29', score: 90, hasViewedTodos: false },
            ],
            todoSummary: { total: 2, completed: 1 },
          },
          confirmedAt,
        }),
      },
      treeFruit: {
        create: jest.fn().mockResolvedValue({ id: 'fruit-1' }),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(tx)),
    };

    return {
      service: new SettlementsService(prisma as any, {
        now: () => confirmedAt,
      }),
      prisma,
      tx,
    };
  }

  it('creates a weekly settlement snapshot and tree fruit in one transaction', async () => {
    const { service, prisma, tx } = createService();

    await expect(
      service.createWeeklySettlement('user-1', '2026-W18', {
        finalScore: 86,
        reflection: '这一周推进得很扎实',
      }),
    ).resolves.toEqual({
      id: 'settlement-1',
      weekId: '2026-W18',
      suggestedScore: 80,
      finalScore: 86,
      reflection: '这一周推进得很扎实',
      snapshotJson: {
        energyEntries: [
          { date: '2026-04-27', score: 70, hasViewedTodos: true },
          { date: '2026-04-29', score: 90, hasViewedTodos: false },
        ],
        todoSummary: { total: 2, completed: 1 },
      },
      confirmedAt: confirmedAt.toISOString(),
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.weeklySettlement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        weekPlanId: 'week-plan-1',
        weekId: '2026-W18',
        suggestedScore: 80,
        finalScore: 86,
        reflection: '这一周推进得很扎实',
        confirmedAt,
        source: PrismaSource.MANUAL,
      }),
    });
    expect(tx.treeFruit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        weekPlanId: 'week-plan-1',
        weeklySettlementId: 'settlement-1',
        weekId: '2026-W18',
        score: 86,
        source: PrismaSource.SYSTEM,
      }),
    });
  });
});
