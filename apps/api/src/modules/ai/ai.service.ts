import { createHash } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  AiScenario,
  GenerateRequest,
  GenerationDto,
  AssistRequest,
  ConfirmGenerationRequest,
} from '@newme/shared';
import { AiScenario as PrismaAiScenario, Prisma } from '@prisma/client';
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
    generationId: string,
    _request: ConfirmGenerationRequest,
  ) {
    return this.prisma.aiGeneration.update({
      where: { id: generationId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: this.options?.now?.() ?? new Date(),
      },
    });
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
}
