import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('registers global configuration', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(ConfigService)).toBeDefined();
  });
});
