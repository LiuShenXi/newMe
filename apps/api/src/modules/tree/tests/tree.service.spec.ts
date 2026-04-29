import { TreeService } from '../tree.service';

describe('TreeService', () => {
  const createdAt = new Date('2026-04-29T12:00:00.000Z');
  const earnedAt = new Date('2026-06-30T12:00:00.000Z');

  function createService() {
    const prisma = {
      treeFruit: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'fruit-1',
            weekId: '2026-W18',
            score: 86,
            label: '2026-W18 果实',
            capsuleSummary: '这一周推进得很扎实',
            createdAt,
          },
        ]),
      },
      quarterHonor: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'honor-1',
            averageScore: 84,
            earnedAt,
            quarter: { year: 2026, quarter: 2 },
          },
        ]),
      },
    };

    return {
      service: new TreeService(prisma as any, {
        now: () => new Date('2026-04-29T10:00:00.000Z'),
      }),
      prisma,
    };
  }

  it('returns growth tree stage, fruits, and honors for a year', async () => {
    const { service, prisma } = createService();

    await expect(service.getGrowthTree('user-1', 2026)).resolves.toEqual({
      year: 2026,
      stage: 'q2_growth',
      fruits: [
        {
          id: 'fruit-1',
          weekId: '2026-W18',
          score: 86,
          label: '2026-W18 果实',
          capsuleSummary: '这一周推进得很扎实',
          createdAt: createdAt.toISOString(),
        },
      ],
      honors: [
        {
          id: 'honor-1',
          quarterId: '2026-Q2',
          averageScore: 84,
          earnedAt: earnedAt.toISOString(),
        },
      ],
    });
    expect(prisma.treeFruit.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        weekId: { startsWith: '2026-' },
        deletedAt: null,
      },
      orderBy: { weekId: 'asc' },
    });
    expect(prisma.quarterHonor.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        deletedAt: null,
        quarter: { year: 2026 },
      },
      include: { quarter: true },
      orderBy: { earnedAt: 'asc' },
    });
  });
});
