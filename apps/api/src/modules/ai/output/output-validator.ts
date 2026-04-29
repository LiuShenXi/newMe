import {
  AiScenario,
  annualOkrOutputSchema,
  fourWeekCommitmentsOutputSchema,
  localAssistOutputSchema,
  quarterOkrOutputSchema,
  quickPlanOutputSchema,
  replanFutureWeeksOutputSchema,
  weeklyFocusToTodosOutputSchema,
} from '@newme/shared';

interface ParsableSchema {
  parse(output: unknown): unknown;
}

const SCHEMA_BY_SCENARIO: Record<AiScenario, ParsableSchema> = {
  [AiScenario.QUICK_QUARTER_PLAN]: quickPlanOutputSchema,
  [AiScenario.VISION_TO_ANNUAL_OKR]: annualOkrOutputSchema,
  [AiScenario.ANNUAL_TO_QUARTER_OKR]: quarterOkrOutputSchema,
  [AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS]:
    fourWeekCommitmentsOutputSchema,
  [AiScenario.WEEKLY_FOCUS_TO_TODOS]: weeklyFocusToTodosOutputSchema,
  [AiScenario.REPLAN_FUTURE_WEEKS]: replanFutureWeeksOutputSchema,
  [AiScenario.MANUAL_LOCAL_ASSIST]: localAssistOutputSchema,
};

export class OutputValidator {
  validate(scenario: AiScenario, output: unknown): Record<string, unknown> {
    return SCHEMA_BY_SCENARIO[scenario].parse(output) as Record<string, unknown>;
  }
}
