import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import {
  CreateSettlementRequest,
  WeeklySettlementDto,
} from '@newme/shared';
import { Prisma, Source as PrismaSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface SettlementsServiceOptions {
  now?: () => Date;
}

interface SnapshotEnergyEntry {
  date: string;
  score: number;
  hasViewedTodos: boolean;
}

interface SettlementSnapshot {
  energyEntries: SnapshotEnergyEntry[];
  todoSummary: {
    total: number;
    completed: number;
  };
}

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: SettlementsServiceOptions,
  ) {}

  async createWeeklySettlement(
    userId: string,
    weekId: string,
    request: CreateSettlementRequest,
  ): Promise<WeeklySettlementDto> {
    this.assertScore(request.finalScore);
    const confirmedAt = this.options?.now?.() ?? new Date();

    return this.prisma.$transaction(async (tx) => {
      const weekPlan = await tx.weekPlan.findUnique({
        where: {
          userId_weekId: {
            userId,
            weekId,
          },
        },
      });
      const [energyEntries, todos] = await Promise.all([
        tx.energyEntry.findMany({
          where: { userId, weekId, deletedAt: null },
          orderBy: { date: 'asc' },
        }),
        tx.todo.findMany({
          where: {
            userId,
            weekPlanId: weekPlan?.id,
            deletedAt: null,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);
      const snapshot = this.buildSnapshot(energyEntries, todos);
      const suggestedScore = this.calculateSuggestedScore(snapshot.energyEntries);
      const settlement = await tx.weeklySettlement.create({
        data: {
          userId,
          weekPlanId: weekPlan?.id,
          weekId,
          suggestedScore,
          finalScore: request.finalScore,
          reflection: request.reflection?.trim() || null,
          snapshotJson: snapshot as unknown as Prisma.InputJsonValue,
          confirmedAt,
          source: PrismaSource.MANUAL,
        },
      });

      await tx.treeFruit.create({
        data: {
          userId,
          weekPlanId: weekPlan?.id,
          weeklySettlementId: settlement.id,
          weekId,
          score: request.finalScore,
          label: `${weekId} 果实`,
          capsuleSummary:
            request.reflection?.trim() || `本周最终结果 ${request.finalScore}%`,
          source: PrismaSource.SYSTEM,
        },
      });

      return this.toWeeklySettlementDto(settlement);
    });
  }

  private buildSnapshot(
    energyEntries: {
      date: Date;
      score: number;
      hasViewedTodos: boolean;
    }[],
    todos: {
      completed: boolean;
    }[],
  ): SettlementSnapshot {
    return {
      energyEntries: energyEntries.map((entry) => ({
        date: entry.date.toISOString().slice(0, 10),
        score: entry.score,
        hasViewedTodos: entry.hasViewedTodos,
      })),
      todoSummary: {
        total: todos.length,
        completed: todos.filter((todo) => todo.completed).length,
      },
    };
  }

  private calculateSuggestedScore(entries: SnapshotEnergyEntry[]) {
    if (entries.length === 0) {
      return 0;
    }

    return Math.round(
      entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length,
    );
  }

  private assertScore(score: number) {
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new BadRequestException('周结果必须是 0 到 100 的整数');
    }
  }

  private toWeeklySettlementDto(settlement: {
    id: string;
    weekId: string;
    suggestedScore: number;
    finalScore: number;
    reflection: string | null;
    snapshotJson: unknown;
    confirmedAt: Date;
  }): WeeklySettlementDto {
    return {
      id: settlement.id,
      weekId: settlement.weekId,
      suggestedScore: settlement.suggestedScore,
      finalScore: settlement.finalScore,
      reflection: settlement.reflection,
      snapshotJson: settlement.snapshotJson as Record<string, unknown>,
      confirmedAt: settlement.confirmedAt.toISOString(),
    };
  }
}
