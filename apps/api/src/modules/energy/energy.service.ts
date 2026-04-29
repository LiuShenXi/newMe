import { BadRequestException, Injectable } from '@nestjs/common';
import {
  EnergyEntryDto,
  RecordEnergyRequest,
  WeeklyEnergyDto,
} from '@newme/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnergyService {
  constructor(private readonly prisma: PrismaService) {}

  async recordDailyEnergy(
    userId: string,
    date: string,
    request: RecordEnergyRequest,
  ): Promise<EnergyEntryDto> {
    this.assertScore(request.score);
    const parsedDate = this.parseDate(date);
    const weekId = this.getIsoWeekId(parsedDate);
    const entry = await this.prisma.energyEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: parsedDate,
        },
      },
      update: {
        score: request.score,
        hasViewedTodos: request.hasViewedTodos,
      },
      create: {
        userId,
        date: parsedDate,
        weekId,
        score: request.score,
        hasViewedTodos: request.hasViewedTodos,
      },
    });

    return this.toEnergyEntryDto(entry);
  }

  async getWeeklyEnergy(
    userId: string,
    weekId: string,
  ): Promise<WeeklyEnergyDto> {
    const entries = await this.prisma.energyEntry.findMany({
      where: { userId, weekId, deletedAt: null },
      orderBy: { date: 'asc' },
    });
    const dtoEntries = entries.map((entry) => this.toEnergyEntryDto(entry));
    const average =
      dtoEntries.length === 0
        ? null
        : dtoEntries.reduce((sum, entry) => sum + entry.score, 0) /
          dtoEntries.length;

    return {
      weekId,
      entries: dtoEntries,
      average,
      recordedDays: dtoEntries.length,
    };
  }

  private assertScore(score: number) {
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new BadRequestException('能量分数必须是 0 到 100 的整数');
    }
  }

  private parseDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private getIsoWeekId(date: Date) {
    const weekDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const day = weekDate.getUTCDay() || 7;
    weekDate.setUTCDate(weekDate.getUTCDate() + 4 - day);
    const weekYear = weekDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const week = Math.ceil(
      ((weekDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );

    return `${weekYear}-W${String(week).padStart(2, '0')}`;
  }

  private toEnergyEntryDto(entry: {
    id: string;
    date: Date;
    score: number;
    weekId: string;
    hasViewedTodos: boolean;
  }): EnergyEntryDto {
    return {
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      score: entry.score,
      weekId: entry.weekId,
      hasViewedTodos: entry.hasViewedTodos,
    };
  }
}
