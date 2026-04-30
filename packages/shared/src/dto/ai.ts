import { AiScenario } from '../enums';
import { AiConfirmationContract } from '../contracts';

export interface GenerateRequest {
  scenario: AiScenario;
  input: Record<string, unknown>;
  contextVersion?: string;
  regenerateFromId?: string;
}

export interface GenerationDto {
  id: string;
  scenario: AiScenario;
  status: 'pending' | 'completed' | 'failed' | 'confirmed';
  outputJson: Record<string, unknown> | null;
  createdAt: string;
}

export interface ConfirmGenerationRequest extends AiConfirmationContract {}

export interface ConfirmGenerationResponse {
  applied: {
    annualObjectives?: number;
    quarterGoals?: number;
    weekPlans?: number;
    todayTodos?: number;
    weeklyFocuses?: number;
  };
  generation: GenerationDto;
}

export interface AssistRequest {
  level: 'annual' | 'quarter' | 'month' | 'week' | 'day';
  context: string;
  existingData?: Record<string, unknown>;
  options?: { availableDays?: number };
}
