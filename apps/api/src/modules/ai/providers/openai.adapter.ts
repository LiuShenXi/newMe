import { Injectable } from '@nestjs/common';
import { GenerateOptions, ProviderAdapter } from './provider-adapter';

type FetchLike = (
  url: string,
  init: {
    body: string;
    headers: Record<string, string>;
    method: 'POST';
    signal?: AbortSignal;
  },
) => Promise<{
  json: () => Promise<unknown>;
  ok: boolean;
  status: number;
}>;

interface OpenAiAdapterOptions {
  fetch?: FetchLike;
}

interface OpenAiChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface ProviderEndpoint {
  apiKey: string;
  baseUrl: string;
  label: 'fallback' | 'local';
  model: string;
}

@Injectable()
export class OpenAiAdapter implements ProviderAdapter {
  private readonly fetchImpl: FetchLike;

  constructor(options: OpenAiAdapterOptions = {}) {
    this.fetchImpl = options.fetch ?? fetch;
  }

  async generate(prompt: string, options: GenerateOptions): Promise<string> {
    const local = this.getLocalEndpoint(options);
    const fallback = this.getFallbackEndpoint();

    try {
      return await this.callChatCompletion(local, prompt, options);
    } catch (localError) {
      if (!fallback) {
        throw this.toError('AI provider failed', localError);
      }

      try {
        return await this.callChatCompletion(fallback, prompt, options);
      } catch (fallbackError) {
        throw new Error(
          `AI provider failed: ${this.errorMessage(localError)}; fallback failed: ${this.errorMessage(
            fallbackError,
          )}`,
        );
      }
    }
  }

  private async callChatCompletion(
    endpoint: ProviderEndpoint,
    prompt: string,
    options: GenerateOptions,
  ) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await this.fetchImpl(`${endpoint.baseUrl}/chat/completions`, {
        body: JSON.stringify({
          max_tokens: options.maxTokens,
          messages: [{ content: prompt, role: 'user' }],
          model: endpoint.model,
          temperature: options.temperature,
        }),
        headers: {
          Authorization: `Bearer ${endpoint.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: controller.signal,
      });
      const body = (await response.json()) as OpenAiChatResponse;

      if (!response.ok) {
        throw new Error(body.error?.message ?? `${endpoint.label} provider HTTP ${response.status}`);
      }

      const content = body.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(`${endpoint.label} provider returned empty content`);
      }

      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  private getLocalEndpoint(options: GenerateOptions): ProviderEndpoint {
    return {
      apiKey: process.env.AI_LOCAL_API_KEY ?? 'local-dev-key',
      baseUrl: this.trimTrailingSlash(
        process.env.AI_LOCAL_BASE_URL ?? process.env.AI_BASE_URL ?? 'http://127.0.0.1:4100/v1',
      ),
      label: 'local',
      model: process.env.AI_LOCAL_MODEL ?? process.env.AI_MODEL ?? options.model,
    };
  }

  private getFallbackEndpoint(): ProviderEndpoint | null {
    const apiKey =
      process.env.AI_FALLBACK_API_KEY ??
      process.env.AI_GLM_API_KEY ??
      process.env.ZHIPU_API_KEY ??
      process.env.BIGMODEL_API_KEY;

    if (!apiKey) {
      return null;
    }

    return {
      apiKey,
      baseUrl: this.trimTrailingSlash(
        process.env.AI_FALLBACK_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4',
      ),
      label: 'fallback',
      model: process.env.AI_FALLBACK_MODEL ?? 'glm-4-flash',
    };
  }

  private trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
  }

  private toError(prefix: string, error: unknown) {
    return new Error(`${prefix}: ${this.errorMessage(error)}`);
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
