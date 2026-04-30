import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type {
  AssistRequest,
  ConfirmGenerationRequest,
  GenerateRequest,
} from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { AiService } from './ai.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generations')
  generateDraft(
    @Req() request: AuthenticatedRequest,
    @Body() body: GenerateRequest,
  ) {
    return this.aiService.generateDraft(request.user.userId, body);
  }

  @Post('generations/:id/confirm')
  confirmGeneration(
    @Req() request: AuthenticatedRequest,
    @Param('id') generationId: string,
    @Body() body: ConfirmGenerationRequest,
  ) {
    return this.aiService.confirmGeneration(request.user.userId, generationId, body);
  }

  @Post('assist')
  assist(@Req() request: AuthenticatedRequest, @Body() body: AssistRequest) {
    return this.aiService.assist(request.user.userId, body);
  }
}
