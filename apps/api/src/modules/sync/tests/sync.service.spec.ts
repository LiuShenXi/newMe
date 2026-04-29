import { SyncService } from '../sync.service';

describe('SyncService', () => {
  const now = new Date('2026-04-29T12:00:00.000Z');

  function createService() {
    const prisma = {
      todo: {
        findUnique: jest.fn().mockResolvedValue({ id: 'todo-remote-2', version: 3 }),
        create: jest.fn().mockResolvedValue({ id: 'todo-remote-1', version: 1 }),
        update: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'todo-remote-1',
            title: '同步后的任务',
            version: 1,
            updatedAt: now,
            deletedAt: null,
          },
        ]),
      },
    };

    return {
      service: new SyncService(prisma as any, {
        now: () => now,
      }),
      prisma,
    };
  }

  it('pushes items independently and reports version conflicts per item', async () => {
    const { service, prisma } = createService();

    await expect(
      service.pushChanges('user-1', {
        deviceId: 'device-1',
        items: [
          {
            tableName: 'todos',
            localId: 'local-1',
            remoteId: null,
            operation: 'create',
            data: { title: '同步后的任务', date: '2026-04-29' },
            version: 0,
          },
          {
            tableName: 'todos',
            localId: 'local-2',
            remoteId: 'todo-remote-2',
            operation: 'update',
            data: { title: '旧版本更新' },
            version: 2,
          },
        ],
      }),
    ).resolves.toEqual([
      {
        localId: 'local-1',
        remoteId: 'todo-remote-1',
        status: 'success',
        newVersion: 1,
      },
      {
        localId: 'local-2',
        remoteId: 'todo-remote-2',
        status: 'conflict',
        newVersion: 3,
        error: '服务端版本更新',
      },
    ]);
    expect(prisma.todo.create).toHaveBeenCalledWith({
      data: {
        title: '同步后的任务',
        date: '2026-04-29',
        userId: 'user-1',
        version: 1,
      },
    });
    expect(prisma.todo.update).not.toHaveBeenCalled();
  });

  it('pulls changed records after the waterline', async () => {
    const { service, prisma } = createService();

    await expect(
      service.pullChanges('user-1', {
        deviceId: 'device-1',
        lastPulledAt: '2026-04-28T00:00:00.000Z',
      }),
    ).resolves.toEqual({
      changes: [
        {
          tableName: 'todos',
          remoteId: 'todo-remote-1',
          operation: 'create',
          data: {
            id: 'todo-remote-1',
            title: '同步后的任务',
            version: 1,
            updatedAt: now,
            deletedAt: null,
          },
          version: 1,
          updatedAt: now.toISOString(),
        },
      ],
      pulledAt: now.toISOString(),
    });
    expect(prisma.todo.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        updatedAt: { gt: new Date('2026-04-28T00:00:00.000Z') },
      },
      orderBy: { updatedAt: 'asc' },
    });
  });
});
