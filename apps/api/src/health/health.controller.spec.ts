import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  it('reports API and database status', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]),
    } as unknown as PrismaService;
    const controller = new HealthController(prisma);

    await expect(controller.check()).resolves.toMatchObject({
      status: 'ok',
      database: 'connected',
    });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
