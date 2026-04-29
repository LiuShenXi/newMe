import { AiScenario } from '@newme/shared';
import { OutputValidator } from '../output/output-validator';
import { PromptRegistry } from './prompt-registry';

describe('PromptRegistry', () => {
  const scenarios = [
    AiScenario.QUICK_QUARTER_PLAN,
    AiScenario.VISION_TO_ANNUAL_OKR,
    AiScenario.ANNUAL_TO_QUARTER_OKR,
    AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
    AiScenario.WEEKLY_FOCUS_TO_TODOS,
    AiScenario.REPLAN_FUTURE_WEEKS,
    AiScenario.MANUAL_LOCAL_ASSIST,
  ];

  it('registers all MVP scenarios with explicit JSON-only prompts', () => {
    const registry = new PromptRegistry();

    for (const scenario of scenarios) {
      const template = registry.getTemplate(scenario);
      const prompt = template.build({ sample: true });

      expect(template.version).toBe(`${scenario}:v1`);
      expect(prompt).toContain(`scenario=${scenario}`);
      expect(prompt).toContain('只输出 JSON');
      expect(prompt).toContain('不要输出 Markdown');
    }
  });

  it('keeps sample prompt outputs aligned with shared schemas', () => {
    const validator = new OutputValidator();
    const samples: Record<AiScenario, Record<string, unknown>> = {
      [AiScenario.QUICK_QUARTER_PLAN]: {
        goalType: 'project',
        weeklyFocuses: [
          { title: '完成后端 API', reason: '为联调打基础' },
          { title: '搭好移动端壳', reason: '让核心页面可进入' },
          { title: '补齐本地存储', reason: '支持离线使用' },
        ],
        todayTodos: [{ title: '写 prompt 测试', estimatedMinutes: 30 }],
      },
      [AiScenario.VISION_TO_ANNUAL_OKR]: {
        objectives: [
          { title: '成为稳定创造产品的人', keyResults: ['每季度发布一个可用版本'] },
        ],
      },
      [AiScenario.ANNUAL_TO_QUARTER_OKR]: {
        quarters: [1, 2, 3, 4].map((quarter) => ({
          quarter,
          goals: [{ title: `Q${quarter} 目标`, goalType: 'project' }],
        })),
      },
      [AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS]: {
        weeks: [1, 2, 3, 4].map((weekNumber) => ({
          weekNumber,
          focuses: [
            { title: `第 ${weekNumber} 周重点 A`, reason: '保持推进节奏' },
            { title: `第 ${weekNumber} 周重点 B`, reason: '降低执行阻力' },
            { title: `第 ${weekNumber} 周重点 C`, reason: '形成可见进展' },
          ],
        })),
      },
      [AiScenario.WEEKLY_FOCUS_TO_TODOS]: {
        days: [
          {
            date: '2026-04-29',
            todos: [{ title: '拆解今日任务', estimatedMinutes: 25 }],
          },
        ],
      },
      [AiScenario.REPLAN_FUTURE_WEEKS]: {
        reason: '本周实际进度落后，需要降低下周范围',
        weeks: [
          {
            weekNumber: 1,
            focuses: [
              { title: '收敛范围', reason: '先保证可交付' },
              { title: '补齐测试', reason: '降低回归风险' },
              { title: '完成文档', reason: '便于下次继续' },
            ],
          },
        ],
      },
      [AiScenario.MANUAL_LOCAL_ASSIST]: {
        suggestions: [{ title: '先写一个最小目标', reason: '降低启动成本' }],
      },
    };

    for (const scenario of scenarios) {
      expect(() => validator.validate(scenario, samples[scenario])).not.toThrow();
    }
  });
});
