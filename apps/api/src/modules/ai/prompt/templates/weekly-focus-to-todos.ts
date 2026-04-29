import { createJsonPromptTemplate } from './shared';

export const weeklyFocusToTodosTemplate = createJsonPromptTemplate(
  'weekly_focus_to_todos:v1',
  'weekly_focus_to_todos',
  '根据本周重点和已有任务生成 1-7 天的任务建议，每天最多 10 条。',
  '{"days":[{"date":"YYYY-MM-DD","todos":[{"title":"string","estimatedMinutes":30,"sourceFocusTitle":"string"}]}]}',
);
