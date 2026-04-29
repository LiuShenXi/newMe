import { Injectable, Optional } from '@nestjs/common';
import {
  GrowthTreeDto,
  QuarterHonorDto,
  TreeFruitDto,
} from '@newme/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface TreeServiceOptions {
  now?: () => Date;
}

@Injectable()
export class TreeService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: TreeServiceOptions,
  ) {}

  async getGrowthTree(userId: string, year: number): Promise<GrowthTreeDto> {
    const [fruits, honors] = await Promise.all([
      this.prisma.treeFruit.findMany({
        where: {
          userId,
          weekId: { startsWith: `${year}-` },
          deletedAt: null,
        },
        orderBy: { weekId: 'asc' },
      }),
      this.prisma.quarterHonor.findMany({
        where: {
          userId,
          deletedAt: null,
          quarter: { year },
        },
        include: { quarter: true },
        orderBy: { earnedAt: 'asc' },
      }),
    ]);

    return {
      year,
      stage: this.getStage(),
      fruits: fruits.map((fruit) => this.toTreeFruitDto(fruit)),
      honors: honors.map((honor) => this.toQuarterHonorDto(honor)),
    };
  }

  private getStage(): GrowthTreeDto['stage'] {
    const now = this.options?.now?.() ?? new Date();
    const quarter = Math.floor(now.getUTCMonth() / 3) + 1;

    if (quarter === 1) return 'q1_start';
    if (quarter === 2) return 'q2_growth';
    if (quarter === 3) return 'q3_flourish';
    return 'q4_complete';
  }

  private toTreeFruitDto(fruit: {
    id: string;
    weekId: string;
    score: number;
    label: string;
    capsuleSummary: string;
    createdAt: Date;
  }): TreeFruitDto {
    return {
      id: fruit.id,
      weekId: fruit.weekId,
      score: fruit.score,
      label: fruit.label,
      capsuleSummary: fruit.capsuleSummary,
      createdAt: fruit.createdAt.toISOString(),
    };
  }

  private toQuarterHonorDto(honor: {
    id: string;
    averageScore: number;
    earnedAt: Date;
    quarter: { year: number; quarter: number } | null;
  }): QuarterHonorDto {
    return {
      id: honor.id,
      quarterId: honor.quarter
        ? `${honor.quarter.year}-Q${honor.quarter.quarter}`
        : 'unknown',
      averageScore: honor.averageScore,
      earnedAt: honor.earnedAt.toISOString(),
    };
  }
}
