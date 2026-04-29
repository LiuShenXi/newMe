import { Injectable } from '@nestjs/common';
import { GenerateOptions, ProviderAdapter } from './provider-adapter';

@Injectable()
export class DeepSeekAdapter implements ProviderAdapter {
  async generate(_prompt: string, _options: GenerateOptions): Promise<string> {
    throw new Error('DeepSeek provider is not configured for this environment');
  }
}
