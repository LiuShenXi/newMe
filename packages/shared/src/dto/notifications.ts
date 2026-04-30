export type PushPlatformDto = 'android' | 'ios' | 'web';

export type NotificationScenario =
  | 'daily_energy'
  | 'weekly_settlement'
  | 'reengagement';

export interface RegisterPushTokenRequest {
  platform: PushPlatformDto;
  token: string;
}

export interface PushTokenResponse {
  enabled: boolean;
  platform: PushPlatformDto;
  token: string;
}

export interface NotificationPreferences {
  dailyEnergy: boolean;
  reengagement: boolean;
  weeklySettlement: boolean;
}

export type UpdateNotificationPreferencesRequest = Partial<NotificationPreferences>;

export interface NotificationPreferencesResponse {
  notifications: NotificationPreferences;
}
