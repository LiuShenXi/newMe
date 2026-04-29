import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { TreeService } from './tree.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('tree')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @Get('years/:year')
  getGrowthTree(
    @Req() request: AuthenticatedRequest,
    @Param('year') year: string,
  ) {
    return this.treeService.getGrowthTree(
      request.user.userId,
      Number(year),
    );
  }
}
