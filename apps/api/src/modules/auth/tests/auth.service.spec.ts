import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  const fixedNow = new Date('2026-04-29T12:00:00.000Z');

  function createService() {
    const prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({
          id: 'user-1',
          phone: '13800138000',
          timezone: 'Asia/Shanghai',
          hasCompletedOnboarding: false,
        }),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'refresh-1' }),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const jwt = {
      signAsync: jest.fn().mockResolvedValue('access.jwt'),
    };

    const service = new AuthService(prisma as any, jwt as any, {
      now: () => fixedNow,
      codeGenerator: () => '246810',
      refreshTokenGenerator: () => 'refresh.plain',
      accessTokenExpiresIn: '15m',
      verificationCodeTtlMs: 5 * 60 * 1000,
      refreshTokenTtlMs: 30 * 24 * 60 * 60 * 1000,
      jwtSecret: 'test-secret',
    });

    return { service, prisma, jwt };
  }

  it('logs in with a valid verification code and stores a hashed refresh token', async () => {
    const { service, prisma, jwt } = createService();

    await service.sendVerificationCode('13800138000');
    const tokens = await service.login({
      phone: '13800138000',
      code: '246810',
    });

    expect(tokens).toEqual({
      accessToken: 'access.jwt',
      refreshToken: 'refresh.plain',
    });
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { phone: '13800138000' },
      update: {},
      create: { phone: '13800138000', timezone: 'Asia/Shanghai' },
    });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: 'user-1', phone: '13800138000' },
      { expiresIn: '15m', secret: 'test-secret' },
    );
    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        tokenHash: expect.not.stringContaining('refresh.plain'),
        expiresAt: new Date('2026-05-29T12:00:00.000Z'),
      }),
    });
  });

  it('rejects login when the verification code is wrong', async () => {
    const { service, prisma } = createService();

    await service.sendVerificationCode('13800138000');

    await expect(
      service.login({ phone: '13800138000', code: '000000' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('rotates refresh tokens by revoking the used token and issuing a new one', async () => {
    const { service, prisma } = createService();
    const tokenHash = service.hashRefreshToken('old.refresh');
    prisma.refreshToken.findFirst.mockResolvedValue({
      id: 'refresh-old',
      userId: 'user-1',
      tokenHash,
      expiresAt: new Date('2026-05-01T12:00:00.000Z'),
      revokedAt: null,
      user: {
        id: 'user-1',
        phone: '13800138000',
      },
    });

    const tokens = await service.refreshTokens('old.refresh');

    expect(tokens).toEqual({
      accessToken: 'access.jwt',
      refreshToken: 'refresh.plain',
    });
    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'refresh-old' },
      data: { revokedAt: fixedNow },
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        tokenHash: expect.not.stringContaining('refresh.plain'),
      }),
    });
  });
});
