import { createJsonPromptTemplate } from './shared';

export const visionToAnnualOkrTemplate = createJsonPromptTemplate(
  'vision_to_annual_okr:v1',
  'vision_to_annual_okr',
  '把五年愿景整理成今年 1-5 个年度目标，每个目标带 1-5 个关键结果。',
  '{"objectives":[{"title":"string","keyResults":["string"]}]}',
);
