import { AiScenario } from '@newme/shared';
import {
  annualToQuarterOkrTemplate,
  manualLocalAssistTemplate,
  quarterToFourWeeksTemplate,
  quickQuarterPlanTemplate,
  replanFutureWeeksTemplate,
  visionToAnnualOkrTemplate,
  weeklyFocusToTodosTemplate,
} from './templates';

export interface PromptTemplate {
  version: string;
  build(input: Record<string, unknown>): string;
}

export class PromptRegistry {
  private readonly templates = new Map<AiScenario, PromptTemplate>([
    [AiScenario.QUICK_QUARTER_PLAN, quickQuarterPlanTemplate],
    [AiScenario.VISION_TO_ANNUAL_OKR, visionToAnnualOkrTemplate],
    [AiScenario.ANNUAL_TO_QUARTER_OKR, annualToQuarterOkrTemplate],
    [
      AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
      quarterToFourWeeksTemplate,
    ],
    [AiScenario.WEEKLY_FOCUS_TO_TODOS, weeklyFocusToTodosTemplate],
    [AiScenario.REPLAN_FUTURE_WEEKS, replanFutureWeeksTemplate],
    [AiScenario.MANUAL_LOCAL_ASSIST, manualLocalAssistTemplate],
  ]);

  getTemplate(scenario: AiScenario): PromptTemplate {
    const template = this.templates.get(scenario);
    if (!template) {
      return {
        version: `${scenario}:v1`,
        build: (input) => `scenario=${scenario}\ninput=${JSON.stringify(input)}`,
      };
    }

    return template;
  }
}
