import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import type {
  RegisterPushTokenRequest,
  UpdateNotificationPreferencesRequest,
} from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { NotificationsService } from './notifications.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('tokens')
  registerToken(
    @Req() request: AuthenticatedRequest,
    @Body() body: RegisterPushTokenRequest,
  ) {
    return this.notificationsService.registerToken(request.user.userId, body);
  }

  @Put('preferences')
  updatePreferences(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateNotificationPreferencesRequest,
  ) {
    return this.notificationsService.updatePreferences(request.user.userId, body);
  }
}
