import { createJsonPromptTemplate } from './shared';

export const manualLocalAssistTemplate = createJsonPromptTemplate(
  'manual_local_assist:v1',
  'manual_local_assist',
  '在手动 OKR 某一层级提供局部建议，只影响当前层级及下游。',
  '{"suggestions":[{"title":"string","reason":"string"}]}',
);
