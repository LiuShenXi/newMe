import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { SyncPullRequest, SyncPushRequest } from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { SyncService } from './sync.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  pushChanges(
    @Req() request: AuthenticatedRequest,
    @Body() body: SyncPushRequest,
  ) {
    return this.syncService.pushChanges(request.user.userId, body);
  }

  @Post('pull')
  pullChanges(
    @Req() request: AuthenticatedRequest,
    @Body() body: SyncPullRequest,
  ) {
    return this.syncService.pullChanges(request.user.userId, body);
  }
}
