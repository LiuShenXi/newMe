import { Injectable, Optional } from '@nestjs/common';
import type { UserContext } from '@newme/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface UsersServiceOptions {
  now?: () => Date;
}

interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: UsersServiceOptions,
  ) {}

  async getMe(userId: string): Promise<UserContext> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        timezone: true,
        hasCompletedOnboarding: true,
      },
    });
    const localDate = this.getLocalDateParts(
      this.options?.now?.() ?? new Date(),
      user.timezone,
    );

    return {
      id: user.id,
      phone: user.phone,
      timezone: user.timezone,
      currentWeekId: this.getIsoWeekId(localDate),
      currentQuarterId: this.getQuarterId(localDate),
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  }

  private getLocalDateParts(date: Date, timezone: string): LocalDateParts {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    );

    return {
      year: values.year,
      month: values.month,
      day: values.day,
    };
  }

  private getIsoWeekId(localDate: LocalDateParts) {
    const date = new Date(
      Date.UTC(localDate.year, localDate.month - 1, localDate.day),
    );
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const weekYear = date.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const week = Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );

    return `${weekYear}-W${String(week).padStart(2, '0')}`;
  }

  private getQuarterId(localDate: LocalDateParts) {
    const quarter = Math.floor((localDate.month - 1) / 3) + 1;

    return `${localDate.year}-Q${quarter}`;
  }
}
