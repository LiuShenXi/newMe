import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { CreateSettlementRequest } from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { SettlementsService } from './settlements.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('weeks/:weekId')
  createWeeklySettlement(
    @Req() request: AuthenticatedRequest,
    @Param('weekId') weekId: string,
    @Body() body: CreateSettlementRequest,
  ) {
    return this.settlementsService.createWeeklySettlement(
      request.user.userId,
      weekId,
      body,
    );
  }
}
