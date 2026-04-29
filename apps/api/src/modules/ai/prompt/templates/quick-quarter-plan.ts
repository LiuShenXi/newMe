import { createJsonPromptTemplate } from './shared';

export const quickQuarterPlanTemplate = createJsonPromptTemplate(
  'quick_quarter_plan:v1',
  'quick_quarter_plan',
  '把一个季度目标拆成本周 3-5 个重点和今日可执行任务。',
  '{"goalType":"result|project|habit","weeklyFocuses":[{"title":"string","reason":"string"}],"todayTodos":[{"title":"string","estimatedMinutes":30,"sourceFocusTitle":"string"}]}',
);
