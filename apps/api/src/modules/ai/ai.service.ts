import { createHash } from 'node:crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  AiScenario,
  ConfirmGenerationResponse,
  GenerateRequest,
  GenerationDto,
  AssistRequest,
  ConfirmGenerationRequest,
} from '@newme/shared';
import { AiScenario as PrismaAiScenario, Prisma } from '@prisma/client';
import {
  GoalType as PrismaGoalType,
  Source as PrismaSource,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CircuitBreaker } from './circuit-breaker';
import { OutputValidator } from './output/output-validator';
import { ProviderAdapter } from './providers/provider-adapter';
import { PromptRegistry } from './prompt/prompt-registry';
import { RateLimiter } from './rate-limiter';

export interface AiServiceOptions {
  now?: () => Date;
  model?: string;
}

const PRISMA_SCENARIO_BY_SHARED: Record<AiScenario, PrismaAiScenario> = {
  [AiScenario.QUICK_QUARTER_PLAN]: PrismaAiScenario.QUICK_QUARTER_PLAN,
  [AiScenario.VISION_TO_ANNUAL_OKR]: PrismaAiScenario.VISION_TO_ANNUAL_OKR,
  [AiScenario.ANNUAL_TO_QUARTER_OKR]: PrismaAiScenario.ANNUAL_TO_QUARTER_OKR,
  [AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS]:
    PrismaAiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
  [AiScenario.WEEKLY_FOCUS_TO_TODOS]: PrismaAiScenario.WEEKLY_FOCUS_TO_TODOS,
  [AiScenario.REPLAN_FUTURE_WEEKS]: PrismaAiScenario.REPLAN_FUTURE_WEEKS,
  [AiScenario.MANUAL_LOCAL_ASSIST]: PrismaAiScenario.MANUAL_LOCAL_ASSIST,
};

const SHARED_SCENARIO_BY_PRISMA = Object.fromEntries(
  Object.entries(PRISMA_SCENARIO_BY_SHARED).map(([shared, prisma]) => [
    prisma,
    shared,
  ]),
) as Record<string, AiScenario>;

interface QuickPlanOutput {
  goalType: 'habit' | 'project' | 'result';
  weeklyFocuses: { title: string; reason: string }[];
  todayTodos: {
    estimatedMinutes: number;
    sourceFocusTitle?: string;
    title: string;
  }[];
}

interface AnnualOkrOutput {
  objectives: { title: string; keyResults: string[] }[];
}

interface QuarterOkrOutput {
  quarters: {
    quarter: number;
    goals: { title: string; goalType: 'habit' | 'project' | 'result' }[];
  }[];
}

interface FourWeekCommitmentsOutput {
  weeks: {
    weekNumber: number;
    focuses: { title: string; reason: string }[];
  }[];
}

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promptRegistry: PromptRegistry,
    private readonly outputValidator: OutputValidator,
    private readonly rateLimiter: RateLimiter,
    private readonly circuitBreaker: CircuitBreaker,
    @Inject('AI_PROVIDER') private readonly provider: ProviderAdapter,
    @Optional() private readonly options?: AiServiceOptions,
  ) {}

  async generateDraft(
    userId: string,
    request: GenerateRequest,
  ): Promise<GenerationDto> {
    this.rateLimiter.check(userId, request.scenario);
    this.circuitBreaker.assertCanRequest(request.scenario);

    const template = this.promptRegistry.getTemplate(request.scenario);
    const prompt = template.build(request.input);
    const model = this.options?.model ?? process.env.AI_MODEL ?? 'mock-model';

    try {
      const rawOutput = await this.provider.generate(prompt, {
        model,
        maxTokens: 2000,
        temperature: 0.2,
        timeoutMs: 25_000,
      });
      const parsedOutput = JSON.parse(rawOutput);
      const outputJson = this.outputValidator.validate(
        request.scenario,
        parsedOutput,
      );
      const generation = await this.prisma.aiGeneration.create({
        data: {
          userId,
          scenario: PRISMA_SCENARIO_BY_SHARED[request.scenario],
          promptVersion: template.version,
          model,
          inputHash: this.hashInput(request.input),
          inputJson: request.input as Prisma.InputJsonValue,
          outputJson: outputJson as Prisma.InputJsonValue,
          status: 'COMPLETED',
          contextVersion: request.contextVersion,
          regenerateFromId: request.regenerateFromId,
        },
      });

      this.circuitBreaker.recordSuccess(request.scenario);
      return this.toGenerationDto(generation);
    } catch (error) {
      this.circuitBreaker.recordFailure(request.scenario);
      throw error;
    }
  }

  async confirmGeneration(
    userId: string,
    generationId: string,
    request: ConfirmGenerationRequest,
  ): Promise<ConfirmGenerationResponse> {
    if (request.generationId !== generationId) {
      throw new BadRequestException('确认请求的 generationId 与路径不一致');
    }

    const generation = await this.prisma.aiGeneration.findFirst({
      where: { id: generationId, userId, deletedAt: null },
    });

    if (!generation) {
      throw new NotFoundException('AI 草案不存在或无权确认');
    }

    const scenario = SHARED_SCENARIO_BY_PRISMA[generation.scenario];

    if (scenario !== request.scenario) {
      throw new BadRequestException('确认场景与草案场景不一致');
    }

    const applied: ConfirmGenerationResponse['applied'] = {};

    const updated = await this.prisma.$transaction(async (tx) => {
      if (scenario === AiScenario.QUICK_QUARTER_PLAN) {
        const result = await this.applyQuickQuarterPlan(tx, userId, generation, request);
        applied.quarterGoals = result.quarterGoals;
        applied.todayTodos = result.todayTodos;
        applied.weeklyFocuses = result.weeklyFocuses;
      } else if (scenario === AiScenario.VISION_TO_ANNUAL_OKR) {
        const result = await this.applyVisionToAnnualOkr(tx, userId, generation, request);
        applied.annualObjectives = result.annualObjectives;
      } else if (scenario === AiScenario.ANNUAL_TO_QUARTER_OKR) {
        const result = await this.applyAnnualToQuarterOkr(tx, userId, generation, request);
        applied.quarterGoals = result.quarterGoals;
      } else if (scenario === AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS) {
        const result = await this.applyQuarterToFourWeekCommitments(
          tx,
          userId,
          generation,
          request,
        );
        applied.weekPlans = result.weekPlans;
        applied.weeklyFocuses = result.weeklyFocuses;
      }

      return tx.aiGeneration.update({
        where: { id: generationId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: this.options?.now?.() ?? new Date(),
        },
      });
    });

    return { applied, generation: this.toGenerationDto(updated) };
  }

  assist(userId: string, request: AssistRequest) {
    return this.generateDraft(userId, {
      scenario: AiScenario.MANUAL_LOCAL_ASSIST,
      input: {
        level: request.level,
        context: request.context,
        existingData: request.existingData,
        options: request.options,
      },
    });
  }

  private toGenerationDto(generation: {
    id: string;
    scenario: string;
    status: string;
    outputJson: unknown;
    createdAt: Date;
  }): GenerationDto {
    return {
      id: generation.id,
      scenario: SHARED_SCENARIO_BY_PRISMA[generation.scenario],
      status: generation.status.toLowerCase() as GenerationDto['status'],
      outputJson: generation.outputJson as Record<string, unknown> | null,
      createdAt: generation.createdAt.toISOString(),
    };
  }

  private hashInput(input: Record<string, unknown>) {
    return createHash('sha256').update(JSON.stringify(input)).digest('hex');
  }

  private async applyQuickQuarterPlan(
    tx: Prisma.TransactionClient,
    userId: string,
    generation: { inputJson: unknown; outputJson: unknown },
    request: ConfirmGenerationRequest,
  ) {
    if (!['quarter_goals', 'week_plan', 'todos'].includes(request.target)) {
      throw new BadRequestException('快速规划确认目标必须是 quarter_goals、week_plan 或 todos');
    }

    const input = this.asRecord(generation.inputJson);
    const edits = this.asRecord(request.edits ?? {});
    const output = this.outputValidator.validate(
      AiScenario.QUICK_QUARTER_PLAN,
      generation.outputJson,
    ) as unknown as QuickPlanOutput;
    const goal = this.resolveString('goal', edits, input);

    if (!goal) {
      throw new BadRequestException('快速规划确认缺少季度目标');
    }

    const date = this.resolveString('date', edits, input) ?? this.formatDate(this.now());
    const quarterId =
      this.resolveString('quarterId', edits, input) ?? this.quarterIdForDate(date);
    const weekId = this.resolveString('weekId', edits, input) ?? this.weekIdForDate(date);
    const quarterParts = this.parseQuarterId(quarterId);
    const quarterBounds = this.getQuarterBounds(quarterParts.year, quarterParts.quarter);

    const quarter = await tx.quarter.upsert({
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
        startsOn: quarterBounds.startsOn,
        endsOn: quarterBounds.endsOn,
        source: PrismaSource.AI,
      },
    });

    await tx.quarterGoal.create({
      data: {
        userId,
        quarterId: quarter.id,
        title: goal.trim(),
        goalType: output.goalType.toUpperCase() as PrismaGoalType,
        source: PrismaSource.AI,
      },
    });

    const weekPlan = await tx.weekPlan.upsert({
      where: {
        userId_weekId: {
          userId,
          weekId,
        },
      },
      update: { source: PrismaSource.AI },
      create: {
        userId,
        weekId,
        source: PrismaSource.AI,
      },
    });

    const focusIdByTitle = new Map<string, string>();

    for (const focus of output.weeklyFocuses) {
      const created = await tx.weeklyFocus.create({
        data: {
          userId,
          weekPlanId: weekPlan.id,
          weekId,
          title: focus.title.trim(),
          reason: focus.reason.trim(),
          source: PrismaSource.AI,
        },
      });
      focusIdByTitle.set(created.title, created.id);
    }

    for (const todo of output.todayTodos) {
      await tx.todo.create({
        data: {
          userId,
          weekPlanId: weekPlan.id,
          sourceFocusId: todo.sourceFocusTitle
            ? focusIdByTitle.get(todo.sourceFocusTitle)
            : undefined,
          title: todo.title.trim(),
          date: this.parseDate(date),
          estimatedMinutes: todo.estimatedMinutes,
          source: PrismaSource.AI,
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true },
    });

    return {
      quarterGoals: 1,
      todayTodos: output.todayTodos.length,
      weeklyFocuses: output.weeklyFocuses.length,
    };
  }

  private async applyVisionToAnnualOkr(
    tx: Prisma.TransactionClient,
    userId: string,
    generation: { inputJson: unknown; outputJson: unknown },
    request: ConfirmGenerationRequest,
  ) {
    if (request.target !== 'annual_objective') {
      throw new BadRequestException('愿景年度 OKR 确认目标必须是 annual_objective');
    }

    const input = this.asRecord(generation.inputJson);
    const edits = this.asRecord(request.edits ?? {});
    const year = this.resolveNumber('year', edits, input);

    if (!year) {
      throw new BadRequestException('愿景年度 OKR 确认缺少年份');
    }

    const output = this.outputValidator.validate(
      AiScenario.VISION_TO_ANNUAL_OKR,
      generation.outputJson,
    ) as unknown as AnnualOkrOutput;

    await tx.annualObjective.create({
      data: {
        userId,
        year,
        objectives: output.objectives as Prisma.InputJsonValue,
        source: PrismaSource.AI,
      },
    });

    return { annualObjectives: 1 };
  }

  private async applyAnnualToQuarterOkr(
    tx: Prisma.TransactionClient,
    userId: string,
    generation: { inputJson: unknown; outputJson: unknown },
    request: ConfirmGenerationRequest,
  ) {
    if (request.target !== 'quarter_goals') {
      throw new BadRequestException('年度到季度 OKR 确认目标必须是 quarter_goals');
    }

    const input = this.asRecord(generation.inputJson);
    const edits = this.asRecord(request.edits ?? {});
    const year = this.resolveNumber('year', edits, input);
    const annualObjectiveId = this.resolveString('annualObjectiveId', edits, input);

    if (!year) {
      throw new BadRequestException('年度到季度 OKR 确认缺少年份');
    }

    const output = this.outputValidator.validate(
      AiScenario.ANNUAL_TO_QUARTER_OKR,
      generation.outputJson,
    ) as unknown as QuarterOkrOutput;
    let quarterGoals = 0;

    for (const quarterOutput of output.quarters) {
      const quarterBounds = this.getQuarterBounds(year, quarterOutput.quarter);
      const quarter = await tx.quarter.upsert({
        where: {
          userId_year_quarter: {
            userId,
            year,
            quarter: quarterOutput.quarter,
          },
        },
        update: {},
        create: {
          userId,
          year,
          quarter: quarterOutput.quarter,
          startsOn: quarterBounds.startsOn,
          endsOn: quarterBounds.endsOn,
          source: PrismaSource.AI,
        },
      });

      for (const goal of quarterOutput.goals) {
        await tx.quarterGoal.create({
          data: {
            userId,
            quarterId: quarter.id,
            annualObjectiveId,
            title: goal.title.trim(),
            goalType: goal.goalType.toUpperCase() as PrismaGoalType,
            source: PrismaSource.AI,
          },
        });
        quarterGoals += 1;
      }
    }

    return { quarterGoals };
  }

  private async applyQuarterToFourWeekCommitments(
    tx: Prisma.TransactionClient,
    userId: string,
    generation: { inputJson: unknown; outputJson: unknown },
    request: ConfirmGenerationRequest,
  ) {
    if (request.target !== 'week_plan') {
      throw new BadRequestException('季度四周承诺确认目标必须是 week_plan');
    }

    const input = this.asRecord(generation.inputJson);
    const edits = this.asRecord(request.edits ?? {});
    const startWeekId = this.resolveString('startWeekId', edits, input);

    if (!startWeekId) {
      throw new BadRequestException('季度四周承诺确认缺少起始周');
    }

    this.parseWeekId(startWeekId);

    const output = this.outputValidator.validate(
      AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
      generation.outputJson,
    ) as unknown as FourWeekCommitmentsOutput;
    let weeklyFocuses = 0;

    for (const week of output.weeks) {
      const weekId = this.addWeeksToWeekId(startWeekId, week.weekNumber - 1);
      const weekPlan = await tx.weekPlan.upsert({
        where: {
          userId_weekId: {
            userId,
            weekId,
          },
        },
        update: { source: PrismaSource.AI },
        create: {
          userId,
          weekId,
          source: PrismaSource.AI,
        },
      });

      for (const focus of week.focuses) {
        await tx.weeklyFocus.create({
          data: {
            userId,
            weekPlanId: weekPlan.id,
            weekId,
            title: focus.title.trim(),
            reason: focus.reason.trim(),
            source: PrismaSource.AI,
          },
        });
        weeklyFocuses += 1;
      }
    }

    return {
      weekPlans: output.weeks.length,
      weeklyFocuses,
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private resolveString(
    key: string,
    edits: Record<string, unknown>,
    input: Record<string, unknown>,
  ) {
    const value = edits[key] ?? input[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private resolveNumber(
    key: string,
    edits: Record<string, unknown>,
    input: Record<string, unknown>,
  ) {
    const value = edits[key] ?? input[key];

    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
      return Number(value.trim());
    }

    return null;
  }

  private parseDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private parseQuarterId(quarterId: string) {
    const match = /^(\d{4})-Q([1-4])$/.exec(quarterId);

    if (!match) {
      throw new BadRequestException('季度 ID 格式应为 YYYY-Qn');
    }

    return { quarter: Number(match[2]), year: Number(match[1]) };
  }

  private getQuarterBounds(year: number, quarter: number) {
    const startMonth = (quarter - 1) * 3;
    return {
      startsOn: new Date(Date.UTC(year, startMonth, 1)),
      endsOn: new Date(Date.UTC(year, startMonth + 3, 0)),
    };
  }

  private quarterIdForDate(date: string) {
    const [year, month] = date.split('-').map(Number);
    return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
  }

  private weekIdForDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
    const weekYear = utcDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${weekYear}-W${String(week).padStart(2, '0')}`;
  }

  private parseWeekId(weekId: string) {
    const match = /^(\d{4})-W(\d{2})$/.exec(weekId);

    if (!match) {
      throw new BadRequestException('周 ID 格式应为 YYYY-Www');
    }

    const year = Number(match[1]);
    const week = Number(match[2]);

    if (week < 1 || week > 53) {
      throw new BadRequestException('周 ID 格式应为 YYYY-Www');
    }

    return { year, week };
  }

  private addWeeksToWeekId(weekId: string, offset: number) {
    const { year, week } = this.parseWeekId(weekId);
    const weekOneMonday = this.startOfIsoWeekOne(year);
    const target = new Date(weekOneMonday);
    target.setUTCDate(weekOneMonday.getUTCDate() + (week - 1 + offset) * 7);
    return this.weekIdForDate(this.formatDate(target));
  }

  private startOfIsoWeekOne(year: number) {
    const januaryFourth = new Date(Date.UTC(year, 0, 4));
    const day = januaryFourth.getUTCDay() || 7;
    januaryFourth.setUTCDate(januaryFourth.getUTCDate() - day + 1);
    return januaryFourth;
  }

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private now() {
    return this.options?.now?.() ?? new Date();
  }
}
