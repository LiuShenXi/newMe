import { PushPlatform } from '@prisma/client';
import { NotificationsService } from '../notifications.service';

describe('NotificationsService', () => {
  const now = new Date('2026-04-30T12:00:00.000Z');

  function createPrismaMock() {
    return {
      pushToken: {
        upsert: jest.fn().mockResolvedValue({
          enabled: true,
          platform: PushPlatform.IOS,
          token: 'ExponentPushToken[test]',
        }),
        findMany: jest.fn(),
      },
      user: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
    };
  }

  it('registers an Expo push token for the authenticated user', async () => {
    const prisma = createPrismaMock();
    const service = new NotificationsService(prisma as never, { now: () => now });

    const result = await service.registerToken('user-1', {
      platform: 'ios',
      token: ' ExponentPushToken[test] ',
    });

    expect(prisma.pushToken.upsert).toHaveBeenCalledWith({
      create: {
        enabled: true,
        platform: PushPlatform.IOS,
        token: 'ExponentPushToken[test]',
        userId: 'user-1',
      },
      update: {
        deletedAt: null,
        enabled: true,
        platform: PushPlatform.IOS,
        userId: 'user-1',
      },
      where: { token: 'ExponentPushToken[test]' },
    });
    expect(result).toEqual({
      enabled: true,
      platform: 'ios',
      token: 'ExponentPushToken[test]',
    });
  });

  it('merges notification preferences into user preferences json', async () => {
    const prisma = createPrismaMock();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      preferencesJson: {
        notifications: { dailyEnergy: false, weeklySettlement: true },
        theme: 'forest',
      },
    });
    prisma.user.update.mockResolvedValue({
      preferencesJson: {
        notifications: {
          dailyEnergy: false,
          reengagement: false,
          weeklySettlement: true,
        },
        theme: 'forest',
      },
    });
    const service = new NotificationsService(prisma as never, { now: () => now });

    const result = await service.updatePreferences('user-1', {
      reengagement: false,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      data: {
        preferencesJson: {
          notifications: {
            dailyEnergy: false,
            reengagement: false,
            weeklySettlement: true,
          },
          theme: 'forest',
        },
      },
      where: { id: 'user-1' },
    });
    expect(result.notifications.reengagement).toBe(false);
  });

  it('builds due messages for enabled scenes using user local time', async () => {
    const prisma = createPrismaMock();
    prisma.pushToken.findMany.mockResolvedValue([
      {
        token: 'ExponentPushToken[daily]',
        user: {
          preferencesJson: {
            notifications: { dailyEnergy: true, reengagement: false },
          },
          timezone: 'Asia/Shanghai',
        },
      },
      {
        token: 'ExponentPushToken[off]',
        user: {
          preferencesJson: {
            notifications: { dailyEnergy: false, reengagement: false },
          },
          timezone: 'Asia/Shanghai',
        },
      },
    ]);
    const service = new NotificationsService(prisma as never, { now: () => now });

    const messages = await service.buildDueMessages(
      new Date('2026-04-30T12:00:00.000Z'),
    );

    expect(messages).toEqual([
      {
        body: '用 30 秒记录今天的能量，给明天留一点方向感。',
        data: { route: '/(tabs)/energy', scenario: 'daily_energy' },
        sound: 'default',
        title: '今日能量提醒',
        to: 'ExponentPushToken[daily]',
      },
    ]);
  });

  it('builds a weekly settlement message on Sunday morning', async () => {
    const prisma = createPrismaMock();
    prisma.pushToken.findMany.mockResolvedValue([
      {
        token: 'ExponentPushToken[weekly]',
        user: {
          preferencesJson: {
            notifications: {
              dailyEnergy: false,
              reengagement: false,
              weeklySettlement: true,
            },
          },
          timezone: 'Asia/Shanghai',
        },
      },
    ]);
    const service = new NotificationsService(prisma as never);

    const messages = await service.buildDueMessages(
      new Date('2026-05-03T02:00:00.000Z'),
    );

    expect(messages).toEqual([
      {
        body: '本周已经走到尾声，结一颗果实放进成长树。',
        data: { route: '/settlement/current-week', scenario: 'weekly_settlement' },
        sound: 'default',
        title: '周结算时间到',
        to: 'ExponentPushToken[weekly]',
      },
    ]);
  });

  it('builds a reengagement message after three days without local activity', async () => {
    const prisma = createPrismaMock();
    prisma.pushToken.findMany.mockResolvedValue([
      {
        token: 'ExponentPushToken[return]',
        user: {
          energyEntries: [{ updatedAt: new Date('2026-04-26T11:00:00.000Z') }],
          preferencesJson: {
            notifications: {
              dailyEnergy: false,
              reengagement: true,
              weeklySettlement: false,
            },
          },
          timezone: 'Asia/Shanghai',
          todos: [],
        },
      },
    ]);
    const service = new NotificationsService(prisma as never);

    const messages = await service.buildDueMessages(
      new Date('2026-04-30T12:00:00.000Z'),
    );

    expect(messages).toEqual([
      {
        body: '回来补一条今天的状态，让计划重新接上生活。',
        data: { route: '/(tabs)/energy', scenario: 'reengagement' },
        sound: 'default',
        title: '轻轻续上你的节奏',
        to: 'ExponentPushToken[return]',
      },
    ]);
  });

  it('sends at most one message per token when multiple scenes are due', async () => {
    const prisma = createPrismaMock();
    prisma.pushToken.findMany.mockResolvedValue([
      {
        token: 'ExponentPushToken[one]',
        user: {
          energyEntries: [],
          preferencesJson: {
            notifications: {
              dailyEnergy: true,
              reengagement: true,
              weeklySettlement: true,
            },
          },
          timezone: 'Asia/Shanghai',
          todos: [],
        },
      },
    ]);
    const service = new NotificationsService(prisma as never);

    const messages = await service.buildDueMessages(
      new Date('2026-05-03T12:00:00.000Z'),
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].data.scenario).toBe('reengagement');
  });

  it('does not build a daily energy message when energy was already recorded today', async () => {
    const prisma = createPrismaMock();
    prisma.pushToken.findMany.mockResolvedValue([
      {
        token: 'ExponentPushToken[done]',
        user: {
          energyEntries: [
            {
              date: new Date('2026-04-30T00:00:00.000Z'),
              updatedAt: new Date('2026-04-30T09:00:00.000Z'),
            },
          ],
          preferencesJson: {
            notifications: {
              dailyEnergy: true,
              reengagement: false,
              weeklySettlement: false,
            },
          },
          timezone: 'Asia/Shanghai',
          todos: [],
        },
      },
    ]);
    const service = new NotificationsService(prisma as never);

    const messages = await service.buildDueMessages(
      new Date('2026-04-30T12:00:00.000Z'),
    );

    expect(messages).toEqual([]);
  });
});
