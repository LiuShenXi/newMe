import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { UpdateUserProfileRequest } from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { UsersService } from './users.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.getMe(request.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateUserProfileRequest,
  ) {
    return this.usersService.updateProfile(request.user.userId, body);
  }
}
