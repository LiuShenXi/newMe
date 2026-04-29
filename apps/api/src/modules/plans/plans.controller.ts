import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import type { UpdateWeeklyFocusesRequest } from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { PlansService } from './plans.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('weeks/:weekId/focuses')
  getWeeklyFocuses(
    @Req() request: AuthenticatedRequest,
    @Param('weekId') weekId: string,
  ) {
    return this.plansService.getWeeklyFocuses(request.user.userId, weekId);
  }

  @Put('weeks/:weekId/focuses')
  updateWeeklyFocuses(
    @Req() request: AuthenticatedRequest,
    @Param('weekId') weekId: string,
    @Body() body: UpdateWeeklyFocusesRequest,
  ) {
    return this.plansService.updateWeeklyFocuses(
      request.user.userId,
      weekId,
      body,
    );
  }
}
