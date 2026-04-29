import { HttpException, HttpStatus } from '@nestjs/common';
import { AiScenario } from '@newme/shared';

export interface RateLimiterOptions {
  now?: () => Date;
}

interface HitBucket {
  timestamps: number[];
}

export class RateLimiter {
  private readonly scenarioHits = new Map<string, HitBucket>();
  private readonly globalHits = new Map<string, HitBucket>();

  constructor(private readonly options?: RateLimiterOptions) {}

  check(userId: string, scenario: AiScenario) {
    const now = this.options?.now?.().getTime() ?? Date.now();
    const scenarioKey = `${userId}:${scenario}`;
    const scenarioBucket = this.getBucket(this.scenarioHits, scenarioKey);
    const globalBucket = this.getBucket(this.globalHits, userId);

    scenarioBucket.timestamps = scenarioBucket.timestamps.filter(
      (timestamp) => now - timestamp < 60_000,
    );
    globalBucket.timestamps = globalBucket.timestamps.filter(
      (timestamp) => now - timestamp < 60 * 60_000,
    );

    if (scenarioBucket.timestamps.length >= 3) {
      throw new HttpException(
        '生成太频繁了，休息一下再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (globalBucket.timestamps.length >= 30) {
      throw new HttpException(
        '今天已经生成很多次了，休息一下吧',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    scenarioBucket.timestamps.push(now);
    globalBucket.timestamps.push(now);
  }

  private getBucket(map: Map<string, HitBucket>, key: string) {
    const existing = map.get(key);
    if (existing) return existing;

    const created = { timestamps: [] };
    map.set(key, created);
    return created;
  }
}
