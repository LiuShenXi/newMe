import { createJsonPromptTemplate } from './shared';

export const replanFutureWeeksTemplate = createJsonPromptTemplate(
  'replan_future_weeks:v1',
  'replan_future_weeks',
  '根据当前计划、用户反馈和本周结果，调整后续 1-4 周重点。',
  '{"reason":"string","weeks":[{"weekNumber":1,"focuses":[{"title":"string","reason":"string"}]}]}',
);
