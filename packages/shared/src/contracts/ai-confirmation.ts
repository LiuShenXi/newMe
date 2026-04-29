import { AiScenario } from '../enums';

export type AiConfirmationTarget =
  | 'vision'
  | 'annual_objective'
  | 'quarter_goals'
  | 'month_goals'
  | 'month_plan'
  | 'week_plan'
  | 'todos';

export interface AiConfirmationContract {
  generationId: string;
  scenario: AiScenario;
  target: AiConfirmationTarget;
  contextVersion: string;
  edits?: Record<string, unknown>;
}
