import { Injectable, Optional } from '@nestjs/common';
import {
  Source,
  UpdateWeeklyFocusesRequest,
  WeeklyFocusDto,
} from '@newme/shared';
import { Source as PrismaSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface PlansServiceOptions {
  now?: () => Date;
}

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: PlansServiceOptions,
  ) {}

  async getWeeklyFocuses(
    userId: string,
    weekId: string,
  ): Promise<WeeklyFocusDto[]> {
    const focuses = await this.prisma.weeklyFocus.findMany({
      where: {
        userId,
        weekId,
        deletedAt: null,
        invalidatedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return focuses.map((focus) => this.toWeeklyFocusDto(focus));
  }

  async updateWeeklyFocuses(
    userId: string,
    weekId: string,
    request: UpdateWeeklyFocusesRequest,
  ) {
    const weekPlan = await this.prisma.weekPlan.upsert({
      where: {
        userId_weekId: {
          userId,
          weekId,
        },
      },
      update: {},
      create: {
        userId,
        weekId,
        source: PrismaSource.MANUAL,
      },
    });

    await this.prisma.weeklyFocus.updateMany({
      where: {
        userId,
        weekId,
        source: PrismaSource.AI,
        invalidatedAt: null,
        deletedAt: null,
      },
      data: { invalidatedAt: this.options?.now?.() ?? new Date() },
    });

    const focuses = request.focuses.map((focus) => ({
      userId,
      weekPlanId: weekPlan.id,
      weekId,
      title: focus.title.trim(),
      reason: focus.reason?.trim() || null,
      source: PrismaSource.MANUAL,
    }));
    await this.prisma.weeklyFocus.createMany({ data: focuses });

    return { weekPlanId: weekPlan.id, count: focuses.length };
  }

  private toWeeklyFocusDto(focus: {
    id: string;
    weekId: string;
    title: string;
    reason: string | null;
    source: string;
    invalidatedAt: Date | null;
  }): WeeklyFocusDto {
    return {
      id: focus.id,
      weekId: focus.weekId,
      title: focus.title,
      reason: focus.reason,
      source: focus.source.toLowerCase() as Source,
      invalidatedAt: focus.invalidatedAt?.toISOString() ?? null,
    };
  }
}
