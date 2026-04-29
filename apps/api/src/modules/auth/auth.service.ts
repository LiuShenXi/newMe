import { randomBytes, createHash } from 'node:crypto';
import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { LoginRequest, TokenResponse } from '@newme/shared';
import { PrismaService } from '../../prisma/prisma.service';

interface VerificationCodeEntry {
  code: string;
  expiresAt: Date;
}

export interface AuthServiceOptions {
  now?: () => Date;
  codeGenerator?: () => string;
  refreshTokenGenerator?: () => string;
  accessTokenExpiresIn?: string;
  verificationCodeTtlMs?: number;
  refreshTokenTtlMs?: number;
  jwtSecret?: string;
}

interface RefreshTokenWithUser {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: {
    id: string;
    phone: string;
  };
}

@Injectable()
export class AuthService {
  private readonly verificationCodes = new Map<string, VerificationCodeEntry>();
  private readonly options: Required<AuthServiceOptions>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Optional() options?: AuthServiceOptions,
  ) {
    this.options = {
      now: options?.now ?? (() => new Date()),
      codeGenerator: options?.codeGenerator ?? (() => this.generateCode()),
      refreshTokenGenerator:
        options?.refreshTokenGenerator ?? (() => this.generateRefreshToken()),
      accessTokenExpiresIn:
        options?.accessTokenExpiresIn ??
        process.env.JWT_ACCESS_EXPIRY ??
        '15m',
      verificationCodeTtlMs: options?.verificationCodeTtlMs ?? 5 * 60 * 1000,
      refreshTokenTtlMs:
        options?.refreshTokenTtlMs ?? 30 * 24 * 60 * 60 * 1000,
      jwtSecret: options?.jwtSecret ?? process.env.JWT_SECRET ?? 'dev-secret',
    };
  }

  async sendVerificationCode(phone: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const expiresAt = new Date(
      this.options.now().getTime() + this.options.verificationCodeTtlMs,
    );

    this.verificationCodes.set(normalizedPhone, {
      code: this.options.codeGenerator(),
      expiresAt,
    });

    return { expiresAt };
  }

  verifyCode(phone: string, code: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const entry = this.verificationCodes.get(normalizedPhone);

    if (!entry || entry.expiresAt.getTime() <= this.options.now().getTime()) {
      return false;
    }

    return entry.code === code;
  }

  async login(request: LoginRequest): Promise<TokenResponse> {
    const phone = this.normalizePhone(request.phone);

    if (!this.verifyCode(phone, request.code)) {
      throw new UnauthorizedException('验证码不正确或已过期');
    }

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, timezone: 'Asia/Shanghai' },
    });

    this.verificationCodes.delete(phone);

    return this.issueTokens(user.id, user.phone);
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const storedToken =
      (await this.prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          revokedAt: null,
          expiresAt: { gt: this.options.now() },
        },
        include: { user: true },
      })) as RefreshTokenWithUser | null;

    if (!storedToken) {
      throw new UnauthorizedException('登录状态已失效，请重新登录');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: this.options.now() },
    });

    return this.issueTokens(storedToken.user.id, storedToken.user.phone);
  }

  async revokeAllTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: this.options.now() },
    });
  }

  hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(
    userId: string,
    phone: string,
  ): Promise<TokenResponse> {
    const refreshToken = this.options.refreshTokenGenerator();
    const accessToken = await this.jwt.signAsync(
      { sub: userId, phone },
      {
        expiresIn: this.options.accessTokenExpiresIn,
        secret: this.options.jwtSecret,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(
          this.options.now().getTime() + this.options.refreshTokenTtlMs,
        ),
      },
    });

    return { accessToken, refreshToken };
  }

  private normalizePhone(phone: string) {
    return phone.trim();
  }

  private generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private generateRefreshToken() {
    return randomBytes(48).toString('base64url');
  }
}
