import { AiScenario } from '@newme/shared';

export interface PromptTemplate {
  version: string;
  build(input: Record<string, unknown>): string;
}

export class PromptRegistry {
  private readonly templates = new Map<AiScenario, PromptTemplate>([
    [
      AiScenario.QUICK_QUARTER_PLAN,
      {
        version: 'quick_quarter_plan:v1',
        build: (input) =>
          `scenario=quick_quarter_plan\ninput=${JSON.stringify(input)}`,
      },
    ],
    [
      AiScenario.MANUAL_LOCAL_ASSIST,
      {
        version: 'manual_local_assist:v1',
        build: (input) =>
          `scenario=manual_local_assist\ninput=${JSON.stringify(input)}`,
      },
    ],
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
