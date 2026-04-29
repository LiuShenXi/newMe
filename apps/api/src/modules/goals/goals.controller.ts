import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type {
  CreateMonthGoalRequest,
  CreateQuarterGoalRequest,
  CreateVisionRequest,
} from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { GoalsService } from './goals.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Put('vision')
  upsertVision(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateVisionRequest,
  ) {
    return this.goalsService.upsertVision(request.user.userId, body);
  }

  @Post('quarters/:quarterId/goals')
  createQuarterGoal(
    @Req() request: AuthenticatedRequest,
    @Param('quarterId') quarterId: string,
    @Body() body: CreateQuarterGoalRequest,
  ) {
    return this.goalsService.createQuarterGoal(
      request.user.userId,
      quarterId,
      body,
    );
  }

  @Post('months/:monthId/goals')
  createMonthGoal(
    @Req() request: AuthenticatedRequest,
    @Param('monthId') monthId: string,
    @Body() body: CreateMonthGoalRequest,
  ) {
    return this.goalsService.createMonthGoal(
      request.user.userId,
      monthId,
      body,
    );
  }

  @Get('current')
  getCurrent(@Req() request: AuthenticatedRequest) {
    return this.goalsService.getCurrentOverview(request.user.userId);
  }
}
