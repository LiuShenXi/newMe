import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtUser } from './jwt.strategy';

interface AuthenticatedRequest {
  user: JwtUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('code')
  async sendVerificationCode(@Body('phone') phone: string) {
    const { __devCode, ...rest } = await this.authService.sendVerificationCode(phone) as any;
    return { ...rest, devCode: __devCode };
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: AuthenticatedRequest) {
    await this.authService.revokeAllTokens(request.user.userId);
    return { success: true };
  }
}
