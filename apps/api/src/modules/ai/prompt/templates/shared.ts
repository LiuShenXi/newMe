import { PromptTemplate } from '../prompt-registry';

export function createJsonPromptTemplate(
  version: string,
  scenario: string,
  goal: string,
  outputContract: string,
): PromptTemplate {
  return {
    version,
    build: (input) => [
      `scenario=${scenario}`,
      'role=你是个人成长管理 App 的规划助手，语气知性、温和、具体，不做闲聊。',
      `goal=${goal}`,
      'rules=只输出 JSON；不要输出 Markdown；不要添加解释；不要替用户做最终决定；不要覆盖用户已编辑内容。',
      `output_contract=${outputContract}`,
      `input=${JSON.stringify(input)}`,
    ].join('\n'),
  };
}
