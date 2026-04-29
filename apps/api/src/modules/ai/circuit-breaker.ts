import { ServiceUnavailableException } from '@nestjs/common';
import { AiScenario } from '@newme/shared';

export interface CircuitBreakerOptions {
  now?: () => Date;
}

interface FailureState {
  failures: number[];
  openedUntil: number | null;
}

export class CircuitBreaker {
  private readonly states = new Map<AiScenario, FailureState>();

  constructor(private readonly options?: CircuitBreakerOptions) {}

  assertCanRequest(scenario: AiScenario) {
    const state = this.getState(scenario);
    const now = this.now();

    if (state.openedUntil && state.openedUntil > now) {
      throw new ServiceUnavailableException('AI 暂时不可用，请稍后重试');
    }
  }

  recordSuccess(scenario: AiScenario) {
    this.states.set(scenario, { failures: [], openedUntil: null });
  }

  recordFailure(scenario: AiScenario) {
    const state = this.getState(scenario);
    const now = this.now();
    state.failures = state.failures.filter((timestamp) => now - timestamp < 600_000);
    state.failures.push(now);

    if (state.failures.length >= 5) {
      state.openedUntil = now + 5 * 60_000;
    }
  }

  private getState(scenario: AiScenario) {
    const existing = this.states.get(scenario);
    if (existing) return existing;

    const created = { failures: [], openedUntil: null };
    this.states.set(scenario, created);
    return created;
  }

  private now() {
    return this.options?.now?.().getTime() ?? Date.now();
  }
}
