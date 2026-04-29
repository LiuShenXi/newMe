import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import type { RecordEnergyRequest } from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { EnergyService } from './energy.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('energy')
export class EnergyController {
  constructor(private readonly energyService: EnergyService) {}

  @Put('days/:date')
  recordDailyEnergy(
    @Req() request: AuthenticatedRequest,
    @Param('date') date: string,
    @Body() body: RecordEnergyRequest,
  ) {
    return this.energyService.recordDailyEnergy(
      request.user.userId,
      date,
      body,
    );
  }

  @Get('weeks/:weekId')
  getWeeklyEnergy(
    @Req() request: AuthenticatedRequest,
    @Param('weekId') weekId: string,
  ) {
    return this.energyService.getWeeklyEnergy(request.user.userId, weekId);
  }
}
