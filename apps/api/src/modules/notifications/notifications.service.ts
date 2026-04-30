import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import {
  NotificationPreferences,
  NotificationPreferencesResponse,
  NotificationScenario,
  PushPlatformDto,
  PushTokenResponse,
  RegisterPushTokenRequest,
  UpdateNotificationPreferencesRequest,
} from '@newme/shared';
import { PushPlatform } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExpoPushMessage {
  body: string;
  data: {
    route: string;
    scenario: NotificationScenario;
  };
  sound: 'default';
  title: string;
  to: string;
}

export interface NotificationsServiceOptions {
  fetch?: typeof fetch;
  now?: () => Date;
}

const defaultPreferences: NotificationPreferences = {
  dailyEnergy: true,
  reengagement: true,
  weeklySettlement: true,
};

const platformMap: Record<PushPlatformDto, PushPlatform> = {
  android: PushPlatform.ANDROID,
  ios: PushPlatform.IOS,
  web: PushPlatform.WEB,
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: NotificationsServiceOptions,
  ) {}

  async registerToken(
    userId: string,
    request: RegisterPushTokenRequest,
  ): Promise<PushTokenResponse> {
    const token = request.token.trim();

    if (!token) {
      throw new BadRequestException('推送令牌不能为空');
    }

    const pushToken = await this.prisma.pushToken.upsert({
      create: {
        enabled: true,
        platform: platformMap[request.platform],
        token,
        userId,
      },
      update: {
        deletedAt: null,
        enabled: true,
        platform: platformMap[request.platform],
        userId,
      },
      where: { token },
    });

    return {
      enabled: pushToken.enabled,
      platform: pushToken.platform.toLowerCase() as PushPlatformDto,
      token: pushToken.token,
    };
  }

  async updatePreferences(
    userId: string,
    request: UpdateNotificationPreferencesRequest,
  ): Promise<NotificationPreferencesResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { preferencesJson: true },
    });
    const current = this.readPreferences(user.preferencesJson);
    const nextPreferences = { ...current, ...request };
    const nextPreferencesJson = {
      ...(this.isRecord(user.preferencesJson) ? user.preferencesJson : {}),
      notifications: nextPreferences,
    };
    const updatedUser = await this.prisma.user.update({
      data: { preferencesJson: nextPreferencesJson },
      where: { id: userId },
    });

    return { notifications: this.readPreferences(updatedUser.preferencesJson) };
  }

  async buildDueMessages(now = this.options?.now?.() ?? new Date()) {
    const tokens = await this.prisma.pushToken.findMany({
      where: { deletedAt: null, enabled: true },
      select: {
        token: true,
        user: {
          select: {
            energyEntries: {
              orderBy: { updatedAt: 'desc' },
              select: { date: true, updatedAt: true },
              take: 5,
            },
            preferencesJson: true,
            timezone: true,
            todos: {
              orderBy: { updatedAt: 'desc' },
              select: { updatedAt: true },
              take: 1,
            },
          },
        },
      },
    });
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of tokens) {
      const preferences = this.readPreferences(pushToken.user.preferencesJson);
      const localTime = this.getLocalTime(now, pushToken.user.timezone);
      const weeklySettlementDue =
        preferences.weeklySettlement &&
        localTime.weekday === 7 &&
        localTime.hour === 10;
      const reengagementDue =
        preferences.reengagement &&
        localTime.hour === 20 &&
        this.isInactiveForThreeDays(pushToken.user, now);
      const dailyEnergyDue =
        preferences.dailyEnergy &&
        localTime.hour === 20 &&
        !this.hasEnergyForLocalDate(pushToken.user, localTime.date);

      if (weeklySettlementDue) {
        messages.push(this.toMessage(pushToken.token, 'weekly_settlement'));
        continue;
      }

      if (reengagementDue) {
        messages.push(this.toMessage(pushToken.token, 'reengagement'));
        continue;
      }

      if (dailyEnergyDue) {
        messages.push(this.toMessage(pushToken.token, 'daily_energy'));
      }
    }

    return messages;
  }

  async sendDueNotifications(now = this.options?.now?.() ?? new Date()) {
    const messages = await this.buildDueMessages(now);

    if (messages.length === 0) {
      return { sent: 0, tickets: [] };
    }

    const fetchImpl = this.options?.fetch ?? fetch;
    const response = await fetchImpl('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify(messages),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Expo Push API failed with status ${response.status}`);
    }

    const result = await response.json();

    return { sent: messages.length, tickets: result };
  }

  private readPreferences(value: unknown): NotificationPreferences {
    const notifications = this.isRecord(value)
      ? value.notifications
      : undefined;

    if (!this.isRecord(notifications)) {
      return defaultPreferences;
    }

    return {
      dailyEnergy:
        typeof notifications.dailyEnergy === 'boolean'
          ? notifications.dailyEnergy
          : defaultPreferences.dailyEnergy,
      reengagement:
        typeof notifications.reengagement === 'boolean'
          ? notifications.reengagement
          : defaultPreferences.reengagement,
      weeklySettlement:
        typeof notifications.weeklySettlement === 'boolean'
          ? notifications.weeklySettlement
          : defaultPreferences.weeklySettlement,
    };
  }

  private getLocalTime(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      month: '2-digit',
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    const weekdayLabel = parts.find((part) => part.type === 'weekday')?.value;
    const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(
      weekdayLabel ?? '',
    ) + 1;
    const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
    const month = parts.find((part) => part.type === 'month')?.value ?? '00';
    const day = parts.find((part) => part.type === 'day')?.value ?? '00';

    return { date: `${year}-${month}-${day}`, hour, weekday };
  }

  private isInactiveForThreeDays(
    user: {
      energyEntries?: { updatedAt: Date }[];
      todos?: { updatedAt: Date }[];
    },
    now: Date,
  ) {
    const latestActivity = [...(user.energyEntries ?? []), ...(user.todos ?? [])]
      .map((item) => item.updatedAt.getTime())
      .sort((a, b) => b - a)[0];

    if (!latestActivity) {
      return true;
    }

    return now.getTime() - latestActivity >= 3 * 24 * 60 * 60 * 1000;
  }

  private hasEnergyForLocalDate(
    user: { energyEntries?: { date?: Date }[] },
    localDate: string,
  ) {
    return (user.energyEntries ?? []).some(
      (entry) => entry.date?.toISOString().slice(0, 10) === localDate,
    );
  }

  private toMessage(to: string, scenario: NotificationScenario): ExpoPushMessage {
    if (scenario === 'weekly_settlement') {
      return {
        body: '本周已经走到尾声，结一颗果实放进成长树。',
        data: { route: '/settlement/current-week', scenario },
        sound: 'default',
        title: '周结算时间到',
        to,
      };
    }

    if (scenario === 'reengagement') {
      return {
        body: '回来补一条今天的状态，让计划重新接上生活。',
        data: { route: '/(tabs)/energy', scenario },
        sound: 'default',
        title: '轻轻续上你的节奏',
        to,
      };
    }

    return {
      body: '用 30 秒记录今天的能量，给明天留一点方向感。',
      data: { route: '/(tabs)/energy', scenario },
      sound: 'default',
      title: '今日能量提醒',
      to,
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
