import { EnergyService } from '../energy.service';

describe('EnergyService', () => {
  const entryDate = new Date('2026-04-29T00:00:00.000Z');

  function createService() {
    const prisma = {
      energyEntry: {
        upsert: jest.fn().mockResolvedValue({
          id: 'energy-1',
          date: entryDate,
          score: 82,
          weekId: '2026-W18',
          hasViewedTodos: true,
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'energy-1',
            date: new Date('2026-04-27T00:00:00.000Z'),
            score: 70,
            weekId: '2026-W18',
            hasViewedTodos: true,
          },
          {
            id: 'energy-2',
            date: new Date('2026-04-29T00:00:00.000Z'),
            score: 90,
            weekId: '2026-W18',
            hasViewedTodos: false,
          },
        ]),
      },
    };

    return {
      service: new EnergyService(prisma as any),
      prisma,
    };
  }

  it('upserts the daily energy entry for a user and date', async () => {
    const { service, prisma } = createService();

    await expect(
      service.recordDailyEnergy('user-1', '2026-04-29', {
        score: 82,
        hasViewedTodos: true,
      }),
    ).resolves.toEqual({
      id: 'energy-1',
      date: '2026-04-29',
      score: 82,
      weekId: '2026-W18',
      hasViewedTodos: true,
    });
    expect(prisma.energyEntry.upsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: 'user-1',
          date: entryDate,
        },
      },
      update: {
        score: 82,
        hasViewedTodos: true,
      },
      create: {
        userId: 'user-1',
        date: entryDate,
        weekId: '2026-W18',
        score: 82,
        hasViewedTodos: true,
      },
    });
  });

  it('returns weekly entries and the average of recorded days', async () => {
    const { service, prisma } = createService();

    await expect(service.getWeeklyEnergy('user-1', '2026-W18')).resolves.toEqual({
      weekId: '2026-W18',
      entries: [
        {
          id: 'energy-1',
          date: '2026-04-27',
          score: 70,
          weekId: '2026-W18',
          hasViewedTodos: true,
        },
        {
          id: 'energy-2',
          date: '2026-04-29',
          score: 90,
          weekId: '2026-W18',
          hasViewedTodos: false,
        },
      ],
      average: 80,
      recordedDays: 2,
    });
    expect(prisma.energyEntry.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', weekId: '2026-W18', deletedAt: null },
      orderBy: { date: 'asc' },
    });
  });
});
