import { UsersService } from '../users.service';

describe('UsersService', () => {
  it('returns the current user context with week and quarter ids', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'user-1',
          phone: '13800138000',
          timezone: 'Asia/Shanghai',
          hasCompletedOnboarding: true,
        }),
      },
    };
    const service = new UsersService(prisma as any, {
      now: () => new Date('2026-04-29T10:00:00.000Z'),
    });

    await expect(service.getMe('user-1')).resolves.toEqual({
      id: 'user-1',
      phone: '13800138000',
      timezone: 'Asia/Shanghai',
      currentWeekId: '2026-W18',
      currentQuarterId: '2026-Q2',
      hasCompletedOnboarding: true,
    });
    expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        id: true,
        phone: true,
        timezone: true,
        hasCompletedOnboarding: true,
      },
    });
  });
});
