export interface GenerateOptions {
  model: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export interface ProviderAdapter {
  generate(prompt: string, options: GenerateOptions): Promise<string>;
}
