import { createJsonPromptTemplate } from './shared';

export const quarterToFourWeeksTemplate = createJsonPromptTemplate(
  'quarter_to_four_week_commitments:v1',
  'quarter_to_four_week_commitments',
  '把当前季度目标拆成最近 1-4 周承诺，每周包含 3-5 个重点。',
  '{"weeks":[{"weekNumber":1,"focuses":[{"title":"string","reason":"string"}]}]}',
);
