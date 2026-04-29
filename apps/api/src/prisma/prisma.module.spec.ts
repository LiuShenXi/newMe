import { Test } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  it('exports PrismaService for application modules', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    const prisma = moduleRef.get(PrismaService);

    expect(prisma).toBeDefined();
    expect(prisma.$connect).toEqual(expect.any(Function));
    expect(prisma.$disconnect).toEqual(expect.any(Function));
  });
});
