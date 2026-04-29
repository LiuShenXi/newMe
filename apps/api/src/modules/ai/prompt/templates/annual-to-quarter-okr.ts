import { createJsonPromptTemplate } from './shared';

export const annualToQuarterOkrTemplate = createJsonPromptTemplate(
  'annual_to_quarter_okr:v1',
  'annual_to_quarter_okr',
  '把年度 OKR 拆成 Q1-Q4 四个季度目标，目标类型必须符合 result/project/habit。',
  '{"quarters":[{"quarter":1,"goals":[{"title":"string","goalType":"result|project|habit"}]}]}',
);
