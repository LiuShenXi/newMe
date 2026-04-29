import { AiScenario } from '../enums';

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

export interface ConfirmGenerationRequest {
  edits?: Record<string, unknown>;
}

export interface AssistRequest {
  level: 'annual' | 'quarter' | 'month' | 'week' | 'day';
  context: string;
  existingData?: Record<string, unknown>;
  options?: { availableDays?: number };
}
