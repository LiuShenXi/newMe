import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { CircuitBreaker } from './circuit-breaker';
import { OutputValidator } from './output/output-validator';
import { OpenAiAdapter } from './providers/openai.adapter';
import { PromptRegistry } from './prompt/prompt-registry';
import { RateLimiter } from './rate-limiter';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AiController],
  providers: [
    AiService,
    PromptRegistry,
    OutputValidator,
    RateLimiter,
    CircuitBreaker,
    { provide: 'AI_PROVIDER', useClass: OpenAiAdapter },
  ],
  exports: [AiService],
})
export class AiModule {}
