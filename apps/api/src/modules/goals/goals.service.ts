import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import {
  CreateMonthGoalRequest,
  CreateQuarterGoalRequest,
  CreateVisionRequest,
  MonthGoalDto,
  QuarterGoalDto,
  Source,
  VisionDto,
} from '@newme/shared';
import { Source as PrismaSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface GoalsServiceOptions {
  now?: () => Date;
}

interface QuarterParts {
  logicalId: string;
  year: number;
  quarter: number;
}

interface LocalDateParts {
  year: number;
  month: number;
}

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: GoalsServiceOptions,
  ) {}

  async upsertVision(
    userId: string,
    request: CreateVisionRequest,
  ): Promise<VisionDto> {
    const existing = await this.prisma.vision.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    const data = {
      content: request.content.trim(),
      source: PrismaSource.MANUAL,
    };
    const vision = existing
      ? await this.prisma.vision.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.vision.create({
          data: { userId, ...data },
        });

    return {
      id: vision.id,
      content: vision.content,
      source: Source.MANUAL,
      createdAt: vision.createdAt.toISOString(),
    };
  }

  async createQuarterGoal(
    userId: string,
    quarterId: string,
    request: CreateQuarterGoalRequest,
  ): Promise<QuarterGoalDto> {
    const quarterParts = this.parseQuarterId(quarterId);
    const bounds = this.getQuarterBounds(quarterParts.year, quarterParts.quarter);
    const quarter = await this.prisma.quarter.upsert({
      where: {
        userId_year_quarter: {
          userId,
          year: quarterParts.year,
          quarter: quarterParts.quarter,
        },
      },
      update: {},
      create: {
        userId,
        year: quarterParts.year,
        quarter: quarterParts.quarter,
        startsOn: bounds.startsOn,
        endsOn: bounds.endsOn,
        source: PrismaSource.SYSTEM,
      },
    });
    const goal = await this.prisma.quarterGoal.create({
      data: {
        userId,
        quarterId: quarter.id,
        title: request.title.trim(),
        source: PrismaSource.MANUAL,
      },
    });

    return this.toQuarterGoalDto(goal, quarterParts.logicalId);
  }

  async createMonthGoal(
    userId: string,
    monthId: string,
    request: CreateMonthGoalRequest,
  ): Promise<MonthGoalDto> {
    this.assertMonthId(monthId);
    const goal = await this.prisma.monthGoal.create({
      data: {
        userId,
        monthId,
        title: request.title.trim(),
        source: PrismaSource.MANUAL,
      },
    });

    return this.toMonthGoalDto(goal);
  }

  async getCurrentOverview(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { timezone: true },
    });
    const localDate = this.getLocalDateParts(
      this.options?.now?.() ?? new Date(),
      user.timezone,
    );
    const currentQuarterId = `${localDate.year}-Q${
      Math.floor((localDate.month - 1) / 3) + 1
    }`;
    const currentMonthId = `${localDate.year}-${String(localDate.month).padStart(
      2,
      '0',
    )}`;
    const quarterParts = this.parseQuarterId(currentQuarterId);
    const [vision, quarterGoals, monthGoals] = await Promise.all([
      this.prisma.vision.findFirst({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quarterGoal.findMany({
        where: {
          userId,
          deletedAt: null,
          quarter: {
            year: quarterParts.year,
            quarter: quarterParts.quarter,
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.monthGoal.findMany({
        where: { userId, monthId: currentMonthId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      currentQuarterId,
      currentMonthId,
      vision: vision ? this.toVisionDto(vision) : null,
      quarterGoals: quarterGoals.map((goal) =>
        this.toQuarterGoalDto(goal, currentQuarterId),
      ),
      monthGoals: monthGoals.map((goal) => this.toMonthGoalDto(goal)),
    };
  }

  private toVisionDto(vision: {
    id: string;
    content: string;
    source: string;
    createdAt: Date;
  }): VisionDto {
    return {
      id: vision.id,
      content: vision.content,
      source: this.toSharedSource(vision.source),
      createdAt: vision.createdAt.toISOString(),
    };
  }

  private toQuarterGoalDto(
    goal: {
      id: string;
      title: string;
      goalType: string | null;
      source: string;
    },
    logicalQuarterId: string,
  ): QuarterGoalDto {
    return {
      id: goal.id,
      quarterId: logicalQuarterId,
      title: goal.title,
      goalType: goal.goalType as QuarterGoalDto['goalType'],
      source: this.toSharedSource(goal.source),
    };
  }

  private toMonthGoalDto(goal: {
    id: string;
    monthId: string;
    title: string;
    source: string;
  }): MonthGoalDto {
    return {
      id: goal.id,
      monthId: goal.monthId,
      title: goal.title,
      source: this.toSharedSource(goal.source),
    };
  }

  private parseQuarterId(quarterId: string): QuarterParts {
    const match = /^(\d{4})-Q([1-4])$/.exec(quarterId);

    if (!match) {
      throw new BadRequestException('季度 ID 格式应为 YYYY-Qn');
    }

    return {
      logicalId: quarterId,
      year: Number(match[1]),
      quarter: Number(match[2]),
    };
  }

  private assertMonthId(monthId: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthId)) {
      throw new BadRequestException('月份 ID 格式应为 YYYY-MM');
    }
  }

  private getQuarterBounds(year: number, quarter: number) {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;

    return {
      startsOn: new Date(Date.UTC(year, startMonth, 1)),
      endsOn: new Date(Date.UTC(year, endMonth + 1, 0)),
    };
  }

  private getLocalDateParts(date: Date, timezone: string): LocalDateParts {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    );

    return {
      year: values.year,
      month: values.month,
    };
  }

  private toSharedSource(source: string): Source {
    return source.toLowerCase() as Source;
  }
}
